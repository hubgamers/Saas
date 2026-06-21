import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarDays, Plus, Trophy, Users, Swords } from "lucide-react"

export default function TournamentDashboard() {
  return (
    <main className="min-h-screen bg-background px-6 py-8">
      <div className="mx-auto max-w-7xl space-y-8">
        
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <Badge variant="secondary" className="mb-3">
              Organisation tournoi
            </Badge>
            <h1 className="text-3xl font-bold tracking-tight">
              Tournoi Rocket League
            </h1>
            <p className="text-muted-foreground">
              Gérez les équipes, les matchs, le planning et les résultats.
            </p>
          </div>

          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Créer un match
          </Button>
        </div>

        {/* Statistiques */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Équipes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">16</p>
              <p className="text-xs text-muted-foreground">équipes inscrites</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Matchs</CardTitle>
              <Swords className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">24</p>
              <p className="text-xs text-muted-foreground">matchs planifiés</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Date</CardTitle>
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">28 Juin</p>
              <p className="text-xs text-muted-foreground">début du tournoi</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Statut</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">Actif</p>
              <p className="text-xs text-muted-foreground">tournoi en cours</p>
            </CardContent>
          </Card>
        </div>

        {/* Contenu principal */}
        <Tabs defaultValue="matches" className="space-y-4">
          <TabsList>
            <TabsTrigger value="matches">Matchs</TabsTrigger>
            <TabsTrigger value="teams">Équipes</TabsTrigger>
            <TabsTrigger value="settings">Paramètres</TabsTrigger>
          </TabsList>

          <TabsContent value="matches">
            <Card>
              <CardHeader>
                <CardTitle>Matchs à venir</CardTitle>
                <CardDescription>
                  Liste des prochaines rencontres du tournoi.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {[
                  ["Team Alpha", "Team Nova", "18:00", "En attente"],
                  ["Blue Wolves", "Red Dragons", "19:30", "En attente"],
                  ["Shadow Esport", "Fast Crew", "21:00", "Confirmé"],
                ].map((match, index) => (
                  <div
                    key={index}
                    className="flex flex-col gap-3 rounded-lg border p-4 md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <p className="font-medium">
                        {match[0]} <span className="text-muted-foreground">vs</span>{" "}
                        {match[1]}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Heure : {match[2]}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <Badge variant="outline">{match[3]}</Badge>
                      <Button variant="outline" size="sm">
                        Modifier
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="teams">
            <Card>
              <CardHeader>
                <CardTitle>Équipes inscrites</CardTitle>
                <CardDescription>
                  Gérez les participants du tournoi.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input placeholder="Nom de l’équipe" />
                  <Button>Ajouter</Button>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  {["Team Alpha", "Team Nova", "Blue Wolves", "Red Dragons"].map(
                    (team) => (
                      <div
                        key={team}
                        className="flex items-center justify-between rounded-lg border p-4"
                      >
                        <span className="font-medium">{team}</span>
                        <Button variant="ghost" size="sm">
                          Voir
                        </Button>
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Paramètres du tournoi</CardTitle>
                <CardDescription>
                  Configurez les informations principales.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <Input placeholder="Nom du tournoi" defaultValue="Tournoi Rocket League" />
                <Input placeholder="Jeu" defaultValue="Rocket League" />
                <Input placeholder="Nombre maximum d’équipes" defaultValue="16" />

                <Button className="w-full md:w-auto">
                  Enregistrer les modifications
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}