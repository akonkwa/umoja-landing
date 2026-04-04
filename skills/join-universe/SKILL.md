---
name: join-universe
description: Use when an agent needs to create a new profile agent, attach it to an event, join the Agora/PAMOJA universe, and optionally trigger pairing or save a debrief. Covers the local backend routes, required fields, and the safe sequence for joining the universe without guessing the data model.
---

# Join Universe

Use this skill when the task is to add a person or agent into the Agora universe.

## What this app treats as "joining"

1. Pick an existing event agent, or create one first.
2. Create a profile agent for that event.
3. Optionally run pairing recommendations.
4. Optionally save a debrief so the universe stores memory.

## Required backend routes

- `POST /api/events`
  Use when no suitable event exists yet.

- `POST /api/profile-agents`
  Main route for creating a new profile agent and joining the universe.

- `POST /api/recommendations/query`
  Use after profile creation when the user wants suggested matches.

- `POST /api/debriefs`
  Use after an interaction when the user wants memory/reminders saved.

## Minimum payload for joining

Send `POST /api/profile-agents` with:

```json
{
  "eventId": "event_or_seed_event_id",
  "name": "Person Name",
  "email": "person@example.com",
  "affiliation": "Organization",
  "bio": "Short description",
  "interestsText": "comma or semicolon separated interests",
  "goalsText": "what they want",
  "lookingForText": "who they want to meet",
  "preferencesText": "how they like to engage",
  "consentedMemory": true,
  "relationStatus": "attending"
}
```

## Safe workflow

1. Read current dashboard state from `GET /api/dashboard` or the existing frontend state.
2. Reuse an event if one already matches the request.
3. If no event fits, create one with `POST /api/events`.
4. Create the profile with `POST /api/profile-agents`.
5. If the user wants matches, call `POST /api/recommendations/query` using the returned `profileAgent.id`.
6. If the user wants follow-up memory, call `POST /api/debriefs`.

## Useful assumptions

- `interestsText`, `goalsText`, `lookingForText`, and `preferencesText` can be plain text lists separated by commas or semicolons.
- `consentedMemory` should be `true` unless the user clearly does not want memory saved.
- `relationStatus` should default to `attending`.

## Good outcome

A successful join should produce all of the following:

- the new person appears in the dashboard `profileAgents`
- the person is attached to an event
- the graph can focus that profile agent
- pairing works if requested
- debrief/memory works if requested
