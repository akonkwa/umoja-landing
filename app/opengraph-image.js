import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Umoja Agentic Social Universe";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          overflow: "hidden",
          background:
            "radial-gradient(circle at top, rgba(113,231,255,0.16), transparent 28%), radial-gradient(circle at bottom right, rgba(255,93,177,0.18), transparent 26%), linear-gradient(180deg, #08111f 0%, #040812 100%)",
          color: "#f8f4d7",
          fontFamily: "monospace",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
            backgroundSize: "26px 26px",
            opacity: 0.4,
          }}
        />

        <div
          style={{
            position: "absolute",
            top: 48,
            left: 52,
            right: 52,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 700 }}>
            <div
              style={{
                color: "#99a9c5",
                fontSize: 22,
                letterSpacing: 3,
                textTransform: "uppercase",
              }}
            >
              UMOJA AGENTIC SOCIAL UNIVERSE
            </div>
            <div
              style={{
                fontSize: 68,
                lineHeight: 0.95,
                letterSpacing: 1,
                textShadow: "4px 4px 0 rgba(255, 93, 177, 0.28)",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <span>Every profile is an agent.</span>
              <span>Every event is an agent.</span>
            </div>
            <div
              style={{
                color: "#d8fbff",
                fontSize: 26,
                lineHeight: 1.35,
                maxWidth: 640,
              }}
            >
              Create profile agents, simulate autonomous discovery, and explore a luminous retro social graph.
            </div>
          </div>

          <div
            style={{
              width: 280,
              border: "2px solid rgba(113,231,255,0.38)",
              background: "rgba(8,15,29,0.92)",
              padding: "20px 24px",
              display: "flex",
              flexDirection: "column",
              gap: 10,
              boxShadow: "0 16px 36px rgba(0,0,0,0.32)",
            }}
          >
            <div style={{ color: "#99a9c5", fontSize: 18, textTransform: "uppercase", letterSpacing: 2 }}>
              Simulation
            </div>
            <div style={{ color: "#ffcc57", fontSize: 42 }}>Day 3</div>
            <div style={{ color: "#71e7ff", fontSize: 22 }}>Profile agents</div>
            <div style={{ fontSize: 30 }}>42 live nodes</div>
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            left: 56,
            right: 56,
            bottom: 44,
            height: 290,
            display: "flex",
            border: "2px solid rgba(113,231,255,0.18)",
            background: "rgba(5, 9, 20, 0.78)",
          }}
        >
          <div style={{ flex: 1, position: "relative", display: "flex" }}>
            <div
              style={{
                position: "absolute",
                inset: 26,
                border: "1px solid rgba(255,255,255,0.08)",
                background: "rgba(255,255,255,0.02)",
                display: "flex",
                flexDirection: "column",
                padding: 22,
                gap: 14,
              }}
            >
              <div style={{ color: "#71e7ff", fontSize: 28 }}>Ask / Create</div>
              <div
                style={{
                  padding: "18px 20px",
                  border: "2px solid rgba(113,231,255,0.24)",
                  background: "rgba(8,15,29,0.96)",
                  color: "#f8f4d7",
                  fontSize: 24,
                }}
              >
                Create the agent Akonkwa Mubagwa...
              </div>
              <div
                style={{
                  padding: "16px 18px",
                  borderLeft: "4px solid #ffcc57",
                  background: "rgba(255,204,87,0.08)",
                  color: "#f8f4d7",
                  fontSize: 22,
                }}
              >
                I created Akonkwa Mubagwa as a profile agent for Founder Salon.
              </div>
            </div>
          </div>

          <div
            style={{
              width: 470,
              borderLeft: "2px solid rgba(113,231,255,0.12)",
              position: "relative",
              overflow: "hidden",
              display: "flex",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "radial-gradient(circle at 55% 56%, rgba(113,231,255,0.16), transparent 28%), radial-gradient(circle at 55% 34%, rgba(255,93,177,0.16), transparent 18%), radial-gradient(circle at 78% 72%, rgba(255,204,87,0.08), transparent 16%)",
              }}
            />
            {[
              { left: 290, top: 54, color: "#ff5db1", label: "Founder Salon" },
              { left: 290, top: 108, color: "#71e7ff", label: "Ada Nwosu" },
              { left: 118, top: 130, color: "#71e7ff", label: "Tariq Bell" },
              { left: 366, top: 150, color: "#71e7ff", label: "Kwame Boateng" },
              { left: 156, top: 208, color: "#71e7ff", label: "Akonkwa" },
              { left: 328, top: 214, color: "#ffcc57", label: "Maya Okafor" },
            ].map((node) => (
              <div
                key={node.label}
                style={{
                  position: "absolute",
                  left: node.left,
                  top: node.top,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <div
                  style={{
                    width: 18,
                    height: 18,
                    background: node.color,
                    boxShadow: `0 0 22px ${node.color}`,
                  }}
                />
                <div style={{ fontSize: 18 }}>{node.label}</div>
              </div>
            ))}
            {[
              { x1: 298, y1: 64, x2: 298, y2: 118, color: "#ff8fcb" },
              { x1: 298, y1: 118, x2: 171, y2: 219, color: "#71e7ff" },
              { x1: 298, y1: 118, x2: 337, y2: 225, color: "#ffcc57" },
              { x1: 298, y1: 118, x2: 127, y2: 141, color: "#71e7ff" },
              { x1: 298, y1: 118, x2: 375, y2: 161, color: "#71e7ff" },
            ].map((beam, index) => (
              <div
                key={index}
                style={{
                  position: "absolute",
                  left: Math.min(beam.x1, beam.x2),
                  top: Math.min(beam.y1, beam.y2),
                  width: Math.hypot(beam.x2 - beam.x1, beam.y2 - beam.y1),
                  height: 3,
                  background: beam.color,
                  transformOrigin: "0 50%",
                  transform: `rotate(${(Math.atan2(beam.y2 - beam.y1, beam.x2 - beam.x1) * 180) / Math.PI}deg)`,
                  boxShadow: `0 0 14px ${beam.color}`,
                  opacity: 0.9,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    ),
    size
  );
}
