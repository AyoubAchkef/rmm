// Exemple d'API route Next.js (sera mockée par MSW en dev)
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    users: [
      { id: 1, name: "Alice", email: "alice@example.com" },
      { id: 2, name: "Bob", email: "bob@example.com" },
      { id: 3, name: "Charlie", email: "charlie@example.com" },
    ],
  });
}
