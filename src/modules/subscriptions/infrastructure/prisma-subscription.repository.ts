import type { SubscriptionRepository } from "../domain/subscription.repository";

export const prismaSubscriptionRepository: SubscriptionRepository = {
  findMany() {
    throw new Error("Implement prismaSubscriptionRepository.findMany after adding the Prisma model.");
  },

  create() {
    throw new Error("Implement prismaSubscriptionRepository.create after adding the Prisma model.");
  },
};
