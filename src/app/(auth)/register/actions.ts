"use server"

import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { createClient } from "@/lib/supabase/server"

export async function signUp(formData: FormData) {
  const supabase = await createClient()
  const origin = (await headers()).get("origin")

  const email = String(formData.get("email"))
  const password = String(formData.get("password"))

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=/dashboard`,
    },
  })

  if (error) {
    redirect("/register?error=signup")
  }

  redirect("/login?message=check-email")
}
