"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export async function fortgotPassword(formData: FormData) {
    const supabase = await createClient()

    const email = String(formData.get("email"))

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/update-password`,
    })

    if (error) {
        redirect("/forgot-password?success=false")
    }

    redirect("/forgot-password?success=true")
}