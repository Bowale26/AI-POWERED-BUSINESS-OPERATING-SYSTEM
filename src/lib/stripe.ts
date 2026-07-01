import { loadStripe } from "@stripe/stripe-js";

export const stripePromise = loadStripe(
  ((import.meta as any).env?.VITE_STRIPE_PUBLISHABLE_KEY as string) ||
  (typeof process !== 'undefined' && process.env?.REACT_APP_STRIPE_PUBLISHABLE_KEY as string) ||
  "pk_live_Y8I4kIWBXPdQIfZ2tthPIFwV00DlqCjZva"
);


