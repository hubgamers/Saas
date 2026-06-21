import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader, SiteHeaderProvider } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

import { TooltipProvider } from "@/components/ui/tooltip"
import { getOrganizationSwitcherState } from "@/modules/organizations/presentation/queries"
import React from "react"

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { organizations, activeOrganization } = await getOrganizationSwitcherState()

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <TooltipProvider>
        <SiteHeaderProvider>
          <AppSidebar
            variant="inset"
            organizations={organizations}
            activeOrganization={activeOrganization}
          />
          <SidebarInset>
            <SiteHeader />
            <div className="flex flex-1 flex-col">
              <div className="@container/main flex flex-1 flex-col gap-2">
                <div className="flex flex-col gap-4 py-4 px-6 md:gap-6 md:py-6">
                  {children}
                </div>
              </div>
            </div>
          </SidebarInset>
        </SiteHeaderProvider>
      </TooltipProvider>
    </SidebarProvider>
  )
}
