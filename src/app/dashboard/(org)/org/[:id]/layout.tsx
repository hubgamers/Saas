import { SidebarProvider } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip";
import { getOrganizationSwitcherState } from "@/modules/organizations/presentation/queries";
import { OrgSidebar } from "../../components/org-sidebar";
import { OrgLayoutShell } from "./org-layout-shell";

export default async function OrgLayoutDashboard({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const { organizations, activeOrganization } = await getOrganizationSwitcherState()

    return (
        <SidebarProvider>
            <TooltipProvider>
                <OrgSidebar
                    organizations={organizations}
                    activeOrganization={activeOrganization}
                />
                <OrgLayoutShell>
                    {children}
                </OrgLayoutShell>
            </TooltipProvider>
        </SidebarProvider>
    )
}
