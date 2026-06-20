"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useSearchParams } from "next/navigation"
import { fortgotPassword } from "./actions"
import { useAuthLayout } from "../layout"
import { useEffect } from "react"
import Link from "next/link"

export default function ForgotPasswordPage() {
  const { setTitle, setSubTitle } = useAuthLayout();

  useEffect(() => {
    setTitle("Mot de passe oublié");
    setSubTitle("Renseigne ton adresse mail pour pouvoir modifier ton mot de passe")
  }, [setTitle]);


  const searchParams = useSearchParams()
  const success = searchParams.get("success") === "true"
  return (
    <div className="mx-auto mt-20 max-w-md">
      {success ? (
        <p>
          Un email de réinitialisation vient d&apos;être envoyé.
        </p>
      ) : (
        <form action={fortgotPassword} className="space-y-4">
          <div>
            <Label>Email</Label>
            <Input
              type="email"
              name="email"
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full"
          >
            Envoyer le lien
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
      )}
    </div>
  )
}
