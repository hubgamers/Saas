import type { SubscriptionRepository } from "../../domain/subscription.repository";
import type { SubscriptionPlan, SubscriptionStatus } from "../../domain/subscription.entity";
import { assertCanCreateSubscription } from "../../domain/subscription.rules";
import { toSubscriptionDto } from "../dtos/subscription.dto";

type Input = {
  organizationId: string; // @relation(Organization)
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  stripeCustomerId: string;
  stripeSubscriptionId?: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  subscriptionRepository: SubscriptionRepository;
};

export async function createSubscriptionUseCase(input: Input) {
  assertCanCreateSubscription();

  const subscription = await input.subscriptionRepository.create({
    organizationId: input.organizationId,
    plan: input.plan,
    status: input.status,
    stripeCustomerId: input.stripeCustomerId,
    stripeSubscriptionId: input.stripeSubscriptionId,
    currentPeriodStart: input.currentPeriodStart,
    currentPeriodEnd: input.currentPeriodEnd,
  });

  return toSubscriptionDto(subscription);
}
