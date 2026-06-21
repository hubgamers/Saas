import OrgListShell from "./components/orgs-list-shell";
import OrgsPageHero from "./components/orgs-page-hero";

export default function MyOrgsDashboardPage() {
    return (
        <section className="relative overflow-hidden py-32">
            <OrgsPageHero />

            <OrgListShell />

            {/* Effet de fond */}
            <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/10 via-background to-background" />
        </section>
    )
}
