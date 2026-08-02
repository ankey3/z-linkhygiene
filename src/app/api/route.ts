import { NextResponse } from "next/server";

// This root /api endpoint is intentionally disabled to reduce attack surface.
// All API traffic should go through specific versioned routes.
export async function GET() {
  return NextResponse.json(
    { error: "Not Found" },
    { status: 404 }
  );
}

export async function POST() {
  return NextResponse.json(
    { error: "Not Found" },
    { status: 404 }
  );
}
