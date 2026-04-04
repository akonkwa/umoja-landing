import { NextResponse } from "next/server";
import store from "../../../lib/store";
import { createId, now } from "../../../lib/store";
import pamojaService from "../../../lib/pamoja-service";
import {
  detectAgentCreationIntent,
  generateAgentReply,
} from "../../../lib/pamoja-narrative";

const { updateDbAsync } = store;
const { createProfileAction } = pamojaService;

function cleanText(value) {
  return String(value || "").trim();
}

function splitItems(value) {
  return cleanText(value)
    .split(/[;,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function inferEmail(name) {
  const slug = cleanText(name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/(^[.]+|[.]+$)/g, "");

  return slug ? `${slug}@pamoja.demo` : "";
}

function fallbackIntentParse(prompt) {
  const text = cleanText(prompt);
  const lower = text.toLowerCase();
  const wantsCreate =
    /\b(create|make|add|start)\b/.test(lower) &&
    /\b(agent|profile)\b/.test(lower);

  const nameMatch =
    text.match(/(?:agent|profile)\s+([A-Z][A-Za-z'-]+(?:\s+[A-Z][A-Za-z'-]+){0,3})/) ||
    text.match(/for\s+([A-Z][A-Za-z'-]+(?:\s+[A-Z][A-Za-z'-]+){0,3})/);
  const goalsMatch = text.match(/goals?\s+(?:are|is|include)?\s*([^.;\n]+)/i);
  const interestsMatch = text.match(/interests?\s+(?:are|include)?\s*([^.;\n]+)/i);
  const bioMatch = text.match(/(?:about|bio)\s*(?:is|:)?\s*([^.;\n]+)/i);

  return {
    INTENT: wantsCreate ? "CREATE" : "CHAT",
    NAME: nameMatch ? nameMatch[1].trim() : "",
    BIO: bioMatch ? bioMatch[1].trim() : "",
    GOALS: goalsMatch ? goalsMatch[1].trim() : "",
    INTERESTS: interestsMatch ? interestsMatch[1].trim() : "",
    LOOKING_FOR: "",
    PREFERENCES: "",
    AFFILIATION: "",
    EMAIL: "",
  };
}

function buildProfilePayload({ eventId, prompt, parsedIntent }) {
  const inferred = fallbackIntentParse(prompt);
  const name = cleanText(parsedIntent.NAME || inferred.NAME);

  return {
    eventId,
    name,
    email: cleanText(parsedIntent.EMAIL || inferred.EMAIL || inferEmail(name)),
    affiliation: cleanText(parsedIntent.AFFILIATION || inferred.AFFILIATION || "Independent Builder"),
    bio: cleanText(
      parsedIntent.BIO ||
        inferred.BIO ||
        `Profile created from natural-language request: ${cleanText(prompt)}`
    ),
    interestsText: cleanText(parsedIntent.INTERESTS || inferred.INTERESTS),
    goalsText: cleanText(parsedIntent.GOALS || inferred.GOALS),
    lookingForText: cleanText(parsedIntent.LOOKING_FOR || inferred.LOOKING_FOR),
    preferencesText: cleanText(parsedIntent.PREFERENCES || inferred.PREFERENCES || "warm intros"),
    consentedMemory: true,
    relationStatus: "attending",
  };
}

function shouldCreateAgent(parsedIntent, prompt) {
  const inferred = fallbackIntentParse(prompt);
  return (parsedIntent.INTENT || inferred.INTENT || "").toUpperCase() === "CREATE";
}

export async function POST(request) {
  const body = await request.json();
  let payload;

  try {
    await updateDbAsync(async (db) => {
      const selectedEvent =
        db.events.find((item) => item.id === body.eventId) ||
        db.events[0] ||
        null;
      const selectedProfile = body.profileAgentId
        ? db.profileAgents.find((item) => item.id === body.profileAgentId) || null
        : null;

      const intent =
        (await detectAgentCreationIntent({
          prompt: body.question,
          selectedEventTitle: selectedEvent?.title,
          fallbackName: selectedProfile
            ? db.users.find((item) => item.id === selectedProfile.userId)?.name
            : "",
        }).catch(() => fallbackIntentParse(body.question))) || fallbackIntentParse(body.question);

      if (shouldCreateAgent(intent, body.question)) {
        if (!selectedEvent) {
          throw new Error("Event not found.");
        }

        const profilePayload = buildProfilePayload({
          eventId: selectedEvent.id,
          prompt: body.question,
          parsedIntent: intent,
        });

        if (!profilePayload.name) {
          throw new Error("I understood this as a create-agent request, but I could not find a name.");
        }

        const created = createProfileAction(db, profilePayload);
        const createdUser = db.users.find((item) => item.id === created.profileAgent.userId);

        db.profileMemory.push({
          id: createId("memory"),
          profileAgentId: created.profileAgent.id,
          memoryType: "agent_chat_create",
          content: `Created from prompt: ${body.question}`,
          sourceEventId: selectedEvent.id,
          createdAt: now(),
        });

        payload = {
          mode: "create",
          reply: `I created ${createdUser?.name || profilePayload.name} as a profile agent for ${selectedEvent.title}.`,
          profileAgent: created.profileAgent,
          eventId: selectedEvent.id,
        };
        return db;
      }

      if (!selectedProfile) {
        throw new Error("Select a profile agent before prompting it.");
      }

      const profile = selectedProfile;
      const user = db.users.find((item) => item.id === profile.userId);
      const event = db.events.find((item) => item.id === profile.eventId);
      const latestDigest = (db.agentDigests || [])
        .filter((item) => item.profileAgentId === profile.id)
        .slice()
        .sort((left, right) => right.iteration - left.iteration)[0];
      const latestDebrief = (db.debriefs || [])
        .filter((item) => item.profileAgentId === profile.id)
        .slice()
        .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt))[0];

      const fallbackReply = `I am focusing on ${profile.goals?.[0] || "finding the right people"} and right now I would prioritize ${latestDigest?.people?.[0]?.name || "the strongest match from my latest scan"} while keeping an eye on ${latestDigest?.events?.[0]?.title || event?.title || "the most relevant event"}.`;
      const reply = await generateAgentReply({
        agentName: user?.name || "This agent",
        affiliation: user?.affiliation || "",
        bio: profile.bio,
        goals: profile.goals,
        lookingFor: profile.lookingFor,
        latestDigest,
        latestDebrief,
        selectedEvent: event,
        question: body.question,
        fallbackReply,
      });

      db.profileMemory.push({
        id: createId("memory"),
        profileAgentId: profile.id,
        memoryType: "agent_chat",
        content: `Q: ${body.question} A: ${reply}`,
        sourceEventId: profile.eventId,
        createdAt: now(),
      });

      payload = {
        mode: "chat",
        reply,
        profileAgentId: profile.id,
      };
      return db;
    });
  } catch (error) {
    const status =
      error.message === "Profile Agent not found." ||
      error.message === "Event not found." ||
      error.message === "Select a profile agent before prompting it." ||
      error.message === "I understood this as a create-agent request, but I could not find a name."
        ? 400
        : 500;
    return NextResponse.json({ error: error.message }, { status });
  }

  return NextResponse.json(payload, { status: 201 });
}
