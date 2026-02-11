import { Checkout } from "@polar-sh/nextjs";

export const runtime = "edge";

export const GET = Checkout({
  accessToken: process.env.POLAR_ACCESS_TOKEN,
  successUrl: process.env.POLAR_SUCCESS_URL,
  returnUrl: process.env.POLAR_RETURN_URL,
  server: process.env.POLAR_SERVER
});
