import type { NewSubscription, Subscription } from "./subscription.entity";

export interface SubscriptionRepository {
  findMany(): Promise<Subscription[]>;
  create(data: NewSubscription): Promise<Subscription>;
}
