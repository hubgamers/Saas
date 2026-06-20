import crypto from "node:crypto"
import type { NextApiRequest } from "next"

type SessionData = {
  user?: {
    role?: string
  }
  [key: string]: unknown
}

const algorithm = "aes-256-gcm"

function getSessionKey() {
  const secret =
    process.env.SESSION_SECRET ??
    process.env.NEXTAUTH_SECRET ??
    process.env.AUTH_SECRET ??
    "development-session-secret"

  return crypto.createHash("sha256").update(secret).digest()
}

export function encrypt(sessionData: unknown) {
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv(algorithm, getSessionKey(), iv)
  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(sessionData), "utf8"),
    cipher.final(),
  ])
  const tag = cipher.getAuthTag()

  return Buffer.concat([iv, tag, encrypted]).toString("base64url")
}

export function decrypt(value: string): SessionData | null {
  try {
    const payload = Buffer.from(value, "base64url")
    const iv = payload.subarray(0, 12)
    const tag = payload.subarray(12, 28)
    const encrypted = payload.subarray(28)
    const decipher = crypto.createDecipheriv(algorithm, getSessionKey(), iv)

    decipher.setAuthTag(tag)

    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]).toString("utf8")

    return JSON.parse(decrypted) as SessionData
  } catch {
    return null
  }
}

export async function getSession(req: NextApiRequest) {
  const value = req.cookies.session

  if (!value) {
    return null
  }

  return decrypt(value)
}
