"use client"
import { createContext, useContext, useState } from "react";

const AuthLayoutContext = createContext<{
    title: string;
    setTitle: (title: string) => void;
    subTitle: string;
    setSubTitle: (subtitle: string) => void;
} | null>(null);

export function useAuthLayout() {
    const context = useContext(AuthLayoutContext);
    if (!context) throw new Error("useAuthLayout");
    return context;
}

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const [title, setTitle] = useState("Bienvenue")
    const [subTitle, setSubTitle] = useState("Gestion de tournois et d'évènements")
    return (
        <AuthLayoutContext.Provider value={{ title, setTitle, subTitle, setSubTitle }}>
            <main className="min-h-screen bg-background">
                <div className="grid min-h-screen lg:grid-cols-2">
                    <section className="hidden bg-muted lg:flex lg:flex-col lg:justify-between p-10">
                        <div className="text-xl font-bold">
                            HubGamers
                        </div>

                        <div>
                            <h1 className="text-4xl font-bold tracking-tight">
                                {title}
                            </h1>
                            <p className="mt-4 text-muted-foreground">
                                {subTitle}
                            </p>
                        </div>

                        <p className="text-sm text-muted-foreground">
                            © 2026 HubGamers - Tous droits réservés.
                        </p>
                    </section>

                    <section className="flex items-center justify-center px-4 py-10">
                        <div className="w-full max-w-md">
                            {children}
                        </div>
                    </section>
                </div>
            </main>
        </AuthLayoutContext.Provider>
    )
}