import { listSubscriptionsUseCase } from "../application/use-cases/list-subscriptions.use-case";
import { prismaSubscriptionRepository } from "../infrastructure/prisma-subscription.repository";

export async function getSubscriptions() {
  return listSubscriptionsUseCase({
    subscriptionRepository: prismaSubscriptionRepository,
  });
}
