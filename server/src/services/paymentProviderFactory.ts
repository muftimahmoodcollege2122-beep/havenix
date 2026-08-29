import { PaymentProvider } from "./paymentProvider";
import { MockProvider } from "./mockProvider";
import { SimpaisaProvider } from "./simpaisaProvider";

let instance: PaymentProvider | null = null;

export function getPaymentProvider(): PaymentProvider {
  if (instance) return instance;
  const providerName = process.env.PAYMENT_PROVIDER || "mock";
  switch (providerName) {
    case "simpaisa":
      instance = new SimpaisaProvider();
      break;
    case "mock":
    default:
      instance = new MockProvider();
      break;
  }
  return instance;
}
