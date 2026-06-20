"use client"
import { signIn } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuthLayout } from "../layout"
import { useEffect } from "react"
import Link from "next/link"

export default function LoginPage() {
  const { setTitle, setSubTitle } = useAuthLayout();

  useEffect(() => {
    setTitle("Connexion");
    setSubTitle("Espace membre")
  }, [setTitle]);

  return (
    <form action={signIn} className="mx-auto mt-20 max-w-sm space-y-4">
      <div>
        <Label>Email</Label>
        <Input name="email" type="email" required />
      </div>

      <div>
        <Label>Mot de passe</Label>
        <Input name="password" type="password" required />
      </div>

      <Button className="w-full">Se connecter</Button>

      <div>
        <p>Pas encore de compte ? <Link
          className="font-bold"
          href={{
            pathname: '/register'
          }}
        >
          Créer mon compte
        </Link></p>
        <p><Link
          className="font-bold"
          href={{
            pathname: '/forgot-password'
          }}
        >
          Mot de passe oublié
        </Link></p>
      </div>
    </form>
  )
}