"use client"

import { createContext, useContext, useState } from "react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar"

const OrgLayoutContext = createContext<{
  parentTitle: string;
  setParentTitle: (title: string) => void;
  parentLink: string;
  setParentLink: (title: string) => void;
  title: string;
  setTitle: (title: string) => void;
} | null>(null);

export function useOrgLayout() {
  const context = useContext(OrgLayoutContext);
  if (!context) throw new Error("useOrgLayout");
  return context;
}

export function OrgLayoutShell({ children }: { children: React.ReactNode }) {
  const [parentTitle, setParentTitle] = useState("Organisations")
  const [parentLink, setParentLink] = useState("/dashboard/orgs")
  const [title, setTitle] = useState("Mon organisation")

  return (
    <OrgLayoutContext.Provider value={{ parentTitle, setParentTitle, parentLink, setParentLink, title, setTitle }}>
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href={parentLink}>{parentTitle}</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>{title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        {children}
      </SidebarInset>
    </OrgLayoutContext.Provider>
  )
}

