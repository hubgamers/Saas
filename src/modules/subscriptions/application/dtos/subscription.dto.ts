export type RelationReferenceDto = {
  id: string;
  label?: string;
};

import type { Subscription, SubscriptionPlan, SubscriptionStatus } from "../../domain/subscription.entity";

export type SubscriptionDto = {
  id: string;
  organizationId: string;
  organization?: RelationReferenceDto;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  stripeCustomerId: string;
  stripeSubscriptionId?: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  createdAt: string;
};

export function toSubscriptionDto(subscription: Subscription): SubscriptionDto {
  return {
    id: subscription.id,
    organizationId: subscription.organizationId,
    organization: subscription.organization,
    plan: subscription.plan,
    status: subscription.status,
    stripeCustomerId: subscription.stripeCustomerId,
    stripeSubscriptionId: subscription.stripeSubscriptionId,
    currentPeriodStart: subscription.currentPeriodStart.toISOString(),
    currentPeriodEnd: subscription.currentPeriodEnd.toISOString(),
    createdAt: subscription.createdAt.toISOString(),
  };
}
