"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const WIDTH = 980;
const HEIGHT = 620;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function buildLayout(dashboard, selectedEventId, selectedProfileId, usersById, recommendations, savedPositions) {
  const events = dashboard?.events || [];
  const selectedEvent = events.find((event) => event.id === selectedEventId) || events[0] || null;
  const profiles = (dashboard?.profileAgents || []).filter(
    (agent) => agent.eventId === (selectedEvent?.id || selectedEventId)
  );
  const recommendationIds = new Set((recommendations || []).map((item) => item.profileAgentId));

  const eventNodes = events.map((event, index, items) => {
    const angle = (-Math.PI / 2) + (index / Math.max(items.length, 1)) * Math.PI * 2;
    const fallback = event.id === selectedEvent?.id
      ? { x: WIDTH / 2, y: 122 }
      : { x: WIDTH / 2 + Math.cos(angle) * 300, y: 122 + Math.sin(angle) * 72 };
    const saved = savedPositions[event.id];

    return {
      id: event.id,
      label: event.title,
      type: "event",
      x: saved?.x ?? fallback.x,
      y: saved?.y ?? fallback.y,
      radius: 20,
      selected: event.id === selectedEvent?.id,
      recommended: false,
    };
  });

  const profileNodes = profiles.map((agent, index, items) => {
    const angle = (-Math.PI / 2) + (index / Math.max(items.length, 1)) * Math.PI * 2;
    const ring = 190 + (index % 4) * 34;
    const fallback = {
      x: WIDTH / 2 + Math.cos(angle) * ring,
      y: HEIGHT / 2 + Math.sin(angle) * (ring * 0.65),
    };
    const saved = savedPositions[agent.id];
    const user = usersById.get(agent.userId);

    return {
      id: agent.id,
      label: user?.name || "Agent",
      type: "profile",
      x: saved?.x ?? fallback.x,
      y: saved?.y ?? fallback.y,
      radius: 17,
      selected: agent.id === selectedProfileId,
      recommended: recommendationIds.has(agent.id),
    };
  });

  const nodes = [...eventNodes, ...profileNodes];
  const nodeMap = new Map(nodes.map((node) => [node.id, node]));
  const links = [];
  const selectedProfile = profileNodes.find((node) => node.id === selectedProfileId) || null;

  if (selectedEvent && nodeMap.has(selectedEvent.id)) {
    profileNodes.forEach((node) => {
      links.push({
        id: `event_${selectedEvent.id}_${node.id}`,
        sourceId: selectedEvent.id,
        targetId: node.id,
        highlighted: node.selected,
        kind: "event",
      });
    });
  }

  if (selectedProfile) {
    profileNodes
      .filter((node) => node.id !== selectedProfile.id)
      .forEach((node) => {
        links.push({
          id: `profile_${selectedProfile.id}_${node.id}`,
          sourceId: selectedProfile.id,
          targetId: node.id,
          highlighted: node.recommended,
          kind: "match",
        });
      });
  }

  return { nodes, links };
}

function nodeColor(node) {
  if (node.type === "event") {
    return node.selected ? "#ff98cf" : "#ff5db1";
  }
  if (node.selected) {
    return "#d8fbff";
  }
  if (node.recommended) {
    return "#ffcf5b";
  }
  return "#72e8ff";
}

function pixelBlocks(size, color) {
  const pixel = Math.max(4, Math.round(size / 4));
  const coords = [
    [-2, -1], [-1, -1], [0, -1], [1, -1],
    [-2, 0], [-1, 0], [0, 0], [1, 0],
    [-1, 1], [0, 1],
  ];

  return coords.map(([x, y], index) => (
    <rect
      key={index}
      x={x * pixel}
      y={y * pixel}
      width={pixel}
      height={pixel}
      rx="1"
      fill={color}
    />
  ));
}

function BeamPacket({ pathId, color, duration = "3.4s", size = 4.5, begin = "0s" }) {
  return (
    <circle r={size} fill={color} opacity="0.95" className="svg-beam-packet">
      <animateMotion dur={duration} repeatCount="indefinite" begin={begin} rotate="auto">
        <mpath href={`#${pathId}`} />
      </animateMotion>
    </circle>
  );
}

function PixelNode({ node, hovered, onPointerDown, onPointerEnter, onPointerLeave }) {
  const color = nodeColor(node);
  return (
    <g
      transform={`translate(${node.x} ${node.y})`}
      className="svg-node"
      onPointerDown={onPointerDown}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      style={{ cursor: "grab" }}
    >
      <circle
        cx="0"
        cy="0"
        r={node.radius + 18}
        fill="transparent"
        className="svg-hit-area"
      />
      <circle
        cx="0"
        cy="0"
        r={node.radius + (node.type === "event" ? 24 : 20)}
        className={node.type === "event" ? "svg-node-aura event-aura" : "svg-node-aura profile-aura"}
      />
      <g filter={hovered ? "url(#pixelGlowStrong)" : "url(#pixelGlow)"}>
        {pixelBlocks(node.radius, color)}
      </g>
      <text className="svg-node-label" textAnchor="middle" x="0" y={node.radius + 22}>
        {node.label}
      </text>
    </g>
  );
}

export default function GraphCanvas({
  dashboard,
  selectedEventId,
  selectedProfileId,
  recommendations,
  usersById,
  onSelectEvent,
  onSelectProfile,
}) {
  const positionsRef = useRef({});
  const dragRef = useRef({ id: null, moved: false, dx: 0, dy: 0, startX: 0, startY: 0 });
  const [hoveredId, setHoveredId] = useState(null);
  const [tick, setTick] = useState(0);
  const [zoom, setZoom] = useState(1);

  const scene = useMemo(
    () =>
      buildLayout(
        dashboard,
        selectedEventId,
        selectedProfileId,
        usersById,
        recommendations,
        positionsRef.current
      ),
    [dashboard, selectedEventId, selectedProfileId, usersById, recommendations, tick]
  );

  useEffect(() => {
    scene.nodes.forEach((node) => {
      if (!positionsRef.current[node.id]) {
        positionsRef.current[node.id] = { x: node.x, y: node.y };
      }
    });
  }, [scene]);

  useEffect(() => {
    function handlePointerMove(event) {
      if (!dragRef.current.id) {
        return;
      }
      const svg = document.getElementById("network-svg");
      if (!svg) {
        return;
      }
      const rect = svg.getBoundingClientRect();
      const { x, y } = toGraphCoords(event.clientX, event.clientY, rect);
      const travel = Math.hypot(x - dragRef.current.startX, y - dragRef.current.startY);
      if (travel > 6) {
        dragRef.current.moved = true;
      }
      positionsRef.current[dragRef.current.id] = {
        x: clamp(x - dragRef.current.dx, 60, WIDTH - 60),
        y: clamp(y - dragRef.current.dy, 74, HEIGHT - 74),
      };
      setTick((value) => value + 1);
    }

    function handlePointerUp() {
      const { id, moved } = dragRef.current;
      if (id && !moved) {
        const node = scene.nodes.find((item) => item.id === id);
        if (node) {
          if (node.type === "event") {
            onSelectEvent(node.id);
          } else {
            onSelectProfile(node.id);
          }
        }
      }
      dragRef.current = { id: null, moved: false, dx: 0, dy: 0, startX: 0, startY: 0 };
    }

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [scene, onSelectEvent, onSelectProfile]);

  function toGraphCoords(clientX, clientY, rect) {
    const rawX = ((clientX - rect.left) / rect.width) * WIDTH;
    const rawY = ((clientY - rect.top) / rect.height) * HEIGHT;
    return {
      x: (rawX - WIDTH / 2) / zoom + WIDTH / 2,
      y: (rawY - HEIGHT / 2) / zoom + HEIGHT / 2,
    };
  }

  function adjustZoom(delta) {
    setZoom((current) => clamp(Number((current + delta).toFixed(2)), 0.65, 1.8));
  }

  if (!scene.nodes.length) {
    return <div className="graph-empty">Reset the demo universe to generate event and profile agents.</div>;
  }

  const nodeMap = new Map(scene.nodes.map((node) => [node.id, node]));
  return (
    <div className="graph-shell dynamic-graph">
      <div className="graph-zoom-controls">
        <button type="button" onClick={() => adjustZoom(0.12)} aria-label="Zoom in">
          +
        </button>
        <button type="button" onClick={() => setZoom(1)} aria-label="Reset zoom">
          {Math.round(zoom * 100)}%
        </button>
        <button type="button" onClick={() => adjustZoom(-0.12)} aria-label="Zoom out">
          -
        </button>
      </div>
      <svg
        id="network-svg"
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="graph-svg-surface"
        role="img"
        aria-label="Interactive network graph"
        onWheel={(event) => {
          event.preventDefault();
          adjustZoom(event.deltaY > 0 ? -0.08 : 0.08);
        }}
      >
        <defs>
          <filter id="pixelGlow">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="pixelGlowStrong">
            <feGaussianBlur stdDeviation="11" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <radialGradient id="nodeAuraProfile" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(113, 231, 255, 0.36)" />
            <stop offset="100%" stopColor="rgba(113, 231, 255, 0)" />
          </radialGradient>
          <radialGradient id="nodeAuraEvent" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(255, 93, 177, 0.34)" />
            <stop offset="100%" stopColor="rgba(255, 93, 177, 0)" />
          </radialGradient>
          <linearGradient id="spaceGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0a1327" />
            <stop offset="100%" stopColor="#050914" />
          </linearGradient>
          <linearGradient id="eventLinkGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(255, 93, 177, 0.08)" />
            <stop offset="55%" stopColor="rgba(255, 93, 177, 0.92)" />
            <stop offset="100%" stopColor="rgba(255, 204, 87, 0.18)" />
          </linearGradient>
          <linearGradient id="matchLinkGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(113, 231, 255, 0.12)" />
            <stop offset="50%" stopColor="rgba(113, 231, 255, 0.9)" />
            <stop offset="100%" stopColor="rgba(255, 204, 87, 0.86)" />
          </linearGradient>
        </defs>

        <g transform={`translate(${WIDTH / 2} ${HEIGHT / 2}) scale(${zoom}) translate(${-WIDTH / 2} ${-HEIGHT / 2})`}>
          <rect x="0" y="0" width={WIDTH} height={HEIGHT} fill="url(#spaceGradient)" />

          <circle cx={WIDTH / 2} cy={HEIGHT / 2} r="290" className="svg-nebula cyan" />
          <circle cx={WIDTH / 2} cy={HEIGHT / 2 - 120} r="190" className="svg-nebula pink" />
          <circle cx={WIDTH / 2 + 180} cy={HEIGHT / 2 + 80} r="120" className="svg-nebula gold" />

          {Array.from({ length: 58 }, (_, index) => (
            <rect
              key={index}
              x={(index * 173) % WIDTH}
              y={(index * 97) % HEIGHT}
              width={index % 4 === 0 ? 4 : 3}
              height={index % 4 === 0 ? 4 : 3}
              className={`svg-star ${index % 3 === 0 ? "twinkle-fast" : "twinkle-slow"}`}
            />
          ))}

          {scene.links.map((link) => {
            const source = nodeMap.get(link.sourceId);
            const target = nodeMap.get(link.targetId);
            if (!source || !target) {
              return null;
            }

            const mx = (source.x + target.x) / 2;
            const my = (source.y + target.y) / 2 - (link.kind === "match" ? 30 : 18);
            const pathId = `beam_${link.id}`;
            return (
              <g key={link.id}>
                <path
                  id={pathId}
                  d={`M ${source.x} ${source.y} Q ${mx} ${my} ${target.x} ${target.y}`}
                  className={
                    link.kind === "event"
                      ? link.highlighted
                        ? "svg-link event-link is-hot"
                        : "svg-link event-link"
                      : link.highlighted
                        ? "svg-link match-link is-hot"
                        : "svg-link match-link"
                  }
                />
                <path
                  d={`M ${source.x} ${source.y} Q ${mx} ${my} ${target.x} ${target.y}`}
                  className={
                    link.kind === "event"
                      ? link.highlighted
                        ? "svg-link event-beam is-hot"
                        : "svg-link event-beam"
                      : link.highlighted
                        ? "svg-link match-beam is-hot"
                        : "svg-link match-beam"
                  }
                />
                {link.highlighted ? (
                  <>
                    <BeamPacket
                      pathId={pathId}
                      color={link.kind === "event" ? "#ff8fcb" : "#ffcf5b"}
                      duration={link.kind === "event" ? "3.6s" : "2.6s"}
                      size={link.kind === "event" ? 3.5 : 4.5}
                    />
                    <BeamPacket
                      pathId={pathId}
                      color="#71e7ff"
                      duration={link.kind === "event" ? "4.2s" : "3.1s"}
                      size={3.25}
                      begin="0.7s"
                    />
                  </>
                ) : null}
              </g>
            );
          })}

          {scene.nodes.map((node) => (
            <PixelNode
              key={node.id}
              node={node}
              hovered={hoveredId === node.id}
              onPointerEnter={() => setHoveredId(node.id)}
              onPointerLeave={() => setHoveredId((current) => (current === node.id ? null : current))}
              onPointerDown={(event) => {
                const svg = event.currentTarget.ownerSVGElement;
                const rect = svg.getBoundingClientRect();
                const { x, y } = toGraphCoords(event.clientX, event.clientY, rect);
                dragRef.current = {
                  id: node.id,
                  moved: false,
                  dx: x - node.x,
                  dy: y - node.y,
                  startX: x,
                  startY: y,
                };
              }}
            />
          ))}
        </g>
      </svg>

      <div className="graph-caption">
        Click to focus. Drag to rearrange. Gold connections are recommended matches.
      </div>
    </div>
  );
}
