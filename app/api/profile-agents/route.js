import { NextResponse } from "next/server";
import store from "../../../lib/store";
import pamojaService from "../../../lib/pamoja-service";

const { updateDb } = store;
const { createProfileAction } = pamojaService;

export async function POST(request) {
  const body = await request.json();
  let payload;

  try {
    updateDb((db) => {
      payload = createProfileAction(db, body);
      return db;
    });
  } catch (error) {
    const status =
      error.message === "Event not found." || error.message === "Profile name is required." ? 400 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }

  return NextResponse.json(payload, { status: 201 });
}
