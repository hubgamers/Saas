"use client"

import { useSiteHeader } from "@/components/site-header";
import { redirect } from "next/navigation";
import { useEffect } from "react";

export default function MyTeamsDashboardPage() {

    const { setTitle } = useSiteHeader();

    useEffect(() => {
        setTitle("Mes organisations");
    }, [setTitle]);

    async function redirectToCreateOrg() {
        redirect("/dashboard/orgs/create")
    }
    return (
        <section>

        </section>
    )
}