"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuthLayout } from "../layout"
import Link from "next/link"

export default function UpdatePasswordPage() {
  const { setTitle, setSubTitle } = useAuthLayout();

  useEffect(() => {
    setTitle("Nouveau mot de passe");
    setSubTitle("Plus qu'une étape pour te connecter")
  }, [setTitle]);

  const router = useRouter()

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()

    if (password !== confirmPassword) {
      alert("Les mots de passe ne correspondent pas")
      return
    }

    setLoading(true)

    const supabase = createClient()

    const { error } = await supabase.auth.updateUser({
      password,
    })

    setLoading(false)

    if (error) {
      alert(error.message)
      return
    }

    router.push("/login?reset=success")
  }

  return (
    <div className="mx-auto mt-20 max-w-md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label>Nouveau mot de passe</Label>
          <Input
            type="password"
            name="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div>
          <Label>Confirmer le mot de passe</Label>
          <Input
            type="password"
            name="confirmPassword"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={loading}
        >
          {loading ? "Modification..." : "Modifier le mot de passe"}
        </Button>

        <div>
          <p>Déja un compte ? <Link
            className="font-bold"
            href={{
              pathname: '/login'
            }}
          >
            Se connecter
          </Link></p>
          <p><Link
            className="font-bold"
            href={{
              pathname: '/register'
            }}
          >
            Créer un compte
          </Link></p>
        </div>
      </form>
    </div>
  )
}