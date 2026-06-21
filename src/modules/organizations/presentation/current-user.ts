import { prisma } from "@/infrastructure/database/prisma";
import { createClient } from "@/lib/supabase/server";

export async function getCurrentPrismaUser() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user?.email) {
    return null;
  }

  return prisma.user.upsert({
    where: {
      email: data.user.email,
    },
    update: {},
    create: {
      email: data.user.email,
      username: data.user.email,
      passwordHash: "managed-by-supabase",
    },
  });
}

