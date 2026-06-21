import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getOrganizationSwitcherState } from "@/modules/organizations";

export default async function OrgListShell() {
    const { organizations } = await getOrganizationSwitcherState()

    return (
        <Card className="w-full max-w-xl">
            <CardHeader>
                <CardTitle>Liste des éléments</CardTitle>
            </CardHeader>

            <CardContent>
                <div className="space-y-3">
                    {organizations.map((item) => (
                        <div
                            key={item.id}
                            className="rounded-lg border p-4 hover:bg-muted transition"
                        >
                            <h3 className="font-medium">{item.name}</h3>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}