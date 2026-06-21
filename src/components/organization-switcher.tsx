"use client"

import { Building2, Check, ChevronsUpDown, Plus } from "lucide-react"
import Link from "next/link"
import type { OrganizationDto } from "@/modules/organizations/application/dtos/organization.dto"
import { setActiveOrganizationAction } from "@/modules/organizations/presentation/actions"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

type OrganizationSwitcherProps = {
  organizations: OrganizationDto[]
  activeOrganization: OrganizationDto | null
}

export function OrganizationSwitcher({
  organizations,
  activeOrganization,
}: OrganizationSwitcherProps) {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <Building2 className="size-4" />
              </div>
              <div className="flex min-w-0 flex-col gap-0.5 leading-none">
                <span className="font-medium">Organisation</span>
                <span className="truncate text-xs text-muted-foreground">
                  {activeOrganization?.name ?? "Aucune organisation"}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width)"
            align="start"
          >
            {organizations.length > 0 ? (
              organizations.map((organization) => (
                <DropdownMenuItem key={organization.id} asChild>
                  <form action={setActiveOrganizationAction} className="w-full">
                    <input type="hidden" name="organizationId" value={organization.id} />
                    <button type="submit" className="flex w-full items-center gap-2 text-left">
                      <span className="truncate">{organization.name}</span>
                      {organization.id === activeOrganization?.id && <Check className="ml-auto" />}
                    </button>
                  </form>
                </DropdownMenuItem>
              ))
            ) : (
              <DropdownMenuItem disabled>Aucune organisation</DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/orgs/create" className="flex items-center gap-2">
                <Plus className="size-4" />
                <span>Creer une organisation</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
