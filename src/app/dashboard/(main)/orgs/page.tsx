"use client"
import { useSiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";
import { useEffect } from "react";

export default function MyOrgsDashboardPage() {
    const { setTitle } = useSiteHeader();

    useEffect(() => {
        setTitle("Mes organisations");
    }, [setTitle]);

    async function redirectToCreateOrg() {
        redirect("/dashboard/orgs/create")
    }
    return (
        <section className="relative overflow-hidden py-32">
            <div className="container mx-auto px-4">
                <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
                    <span className="mb-4 rounded-full border px-3 py-1 text-sm text-muted-foreground">
                        🚀 Commence par créer ton organisation
                    </span>

                    <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
                        Créez et gérez vos projets
                        <span className="text-primary"> simplement</span>
                    </h1>

                    <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
                        Une plateforme intuitive pour créer, organiser et suivre tous vos
                        tournois et évènements en quelques clics.
                    </p>

                    <div className="mt-10 flex gap-4">
                        <Button size="lg" onClick={redirectToCreateOrg}>
                            Créer maintenant
                        </Button>

                        <Button size="lg" variant="outline">
                            En savoir plus
                        </Button>
                    </div>
                </div>
            </div>

            {/* Effet de fond */}
            <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/10 via-background to-background" />
        </section>
    )
}