"use client"
import { signUp } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuthLayout } from "../layout";
import { useEffect } from "react";
import Link from "next/link"

export default function RegisterPage() {
  const { setTitle, setSubTitle } = useAuthLayout();

  useEffect(() => {
    setTitle("Créer un compte");
    setSubTitle("Découvre tout un univers !")
  }, [setTitle]);

  return (
    <form action={signUp} className="mx-auto mt-20 max-w-sm space-y-4">
      <div>
        <Label>Email</Label>
        <Input name="email" type="email" required />
      </div>

      <div>
        <Label>Mot de passe</Label>
        <Input name="password" type="password" required />
      </div>

      <Button className="w-full">Créer mon compte</Button>

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
            pathname: '/forgot-password'
          }}
        >
          Mot de passe oublié
        </Link></p>
      </div>
    </form>
  )
}