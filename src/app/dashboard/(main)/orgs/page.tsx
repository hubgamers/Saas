"use client"
import { useSiteHeader } from "@/components/site-header";
import { useEffect } from "react";

export default function MyOrgsDashboardPage() {
    const { setTitle } = useSiteHeader();

    useEffect(() => {
        setTitle("Mes organisations");
    }, [setTitle]);
    return (
        <div>
            <p>liste des mes organisations si pas vide ou bouton pour en creer</p>
        </div>
    )
}