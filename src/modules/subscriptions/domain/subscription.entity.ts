export type RelationReference = {
  id: string;
  label?: string;
};

export const SubscriptionPlanValues = ["FREE", "STARTER", "PRO", "ENTERPRISE"] as const;
export type SubscriptionPlan = (typeof SubscriptionPlanValues)[number];

export const SubscriptionStatusValues = ["TRIALING", "ACTIVE", "PAST_DUE", "CANCELED"] as const;
export type SubscriptionStatus = (typeof SubscriptionStatusValues)[number];

export type Subscription = {
  id: string;
  organizationId: string;
  organization?: RelationReference;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  stripeCustomerId: string;
  stripeSubscriptionId?: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type NewSubscription = {
  organizationId: string; // @relation(Organization)
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  stripeCustomerId: string;
  stripeSubscriptionId?: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
};
