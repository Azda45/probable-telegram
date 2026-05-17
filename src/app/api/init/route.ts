import { NextResponse } from "next/server";
import { initDatabase } from "@/lib/schema";

export async function POST() {
  try {
    await initDatabase();
    return NextResponse.json({ message: "Database initialized successfully" });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { error: "Failed to initialize database", details: err.message },
      { status: 500 }
    );
  }
}
