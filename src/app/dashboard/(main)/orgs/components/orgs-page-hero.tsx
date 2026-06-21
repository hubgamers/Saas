"use client"

import { useSiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function OrgsPageHero() {
    const router = useRouter();
    const { setTitle } = useSiteHeader();

    useEffect(() => {
        setTitle("Mes organisations");
    }, [setTitle]);

    return (
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
                    <Button size="lg" onClick={() => router.push("/dashboard/orgs/create")}>
                        Créer maintenant
                    </Button>

                    <Button size="lg" variant="outline">
                        En savoir plus
                    </Button>
                </div>
            </div>
        </div>
    )
}
