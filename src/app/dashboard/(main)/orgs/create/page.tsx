import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createOrg } from "./actions"

export default function CreateOrgDashboardPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Informations principales</CardTitle>
        <CardDescription>
          Remplissez les informations ci-dessous pour commencer.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form action={createOrg} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Nom</Label>
            <Input id="name" name="name" placeholder="Nova Esport" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input id="slug" name="slug" placeholder="nova-esport" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="logoUrl">Logo</Label>
            <Input id="logoUrl" name="logoUrl" type="url" placeholder="https://example.com/logo.png" />
          </div>

          <Button type="submit" className="w-full">
            Créer mon organisation
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
