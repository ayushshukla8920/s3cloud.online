import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"

export const POST = async (req) => {
  try {
    const body = await req.json()
    const token = body.token

    if (!token) {
      return NextResponse.json({ err: "Token missing" }, { status: 400 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    return NextResponse.json({
      email: decoded,
    })

  } catch (error) {
    console.error("Token verification failed:", error)
    return NextResponse.json({ err: "Invalid or expired token" }, { status: 401 })
  }
}
