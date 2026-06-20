import type { SubscriptionRepository } from "../../domain/subscription.repository";
import { toSubscriptionDto } from "../dtos/subscription.dto";

type Input = {
  subscriptionRepository: SubscriptionRepository;
};

export async function listSubscriptionsUseCase(input: Input) {
  const subscriptions = await input.subscriptionRepository.findMany();

  return subscriptions.map(toSubscriptionDto);
}
