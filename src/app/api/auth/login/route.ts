import { NextResponse } from "next/server"
import { encrypt } from "@/app/lib/session"

export async function POST(request: Request) {
  const sessionData = await request.json()
  const response = NextResponse.json({ message: "Successfully set cookie!" })

  response.cookies.set("session", encrypt(sessionData), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
    sameSite: "lax",
  })

  return response
}
