import { NextResponse } from "next/server";
import store from "../../../../lib/store";
import pamojaService from "../../../../lib/pamoja-service";

const { resetDb } = store;
const { buildDashboardPayload } = pamojaService;

export async function POST() {
  const db = resetDb();
  return NextResponse.json(buildDashboardPayload(db));
}
