import { Webhooks } from "@polar-sh/nextjs";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "edge";

type PolarOrder = {
  id: string;
  customer_id?: string | null;
  customer?: {
    id?: string | null;
    email?: string | null;
    external_id?: string | null;
  } | null;
  customer_email?: string | null;
  customer_external_id?: string | null;
  metadata?: Record<string, unknown> | null;
};

const getApiBase = () => {
  return process.env.POLAR_SERVER === "sandbox"
    ? "https://sandbox-api.polar.sh/v1"
    : "https://api.polar.sh/v1";
};

const refundOrder = async (orderId: string) => {
  const token = process.env.POLAR_ACCESS_TOKEN;
  if (!token) {
    throw new Error("Missing POLAR_ACCESS_TOKEN");
  }

  const response = await fetch(`${getApiBase()}/refunds`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      order_id: orderId,
      reason: "customer_request"
    })
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Refund failed: ${response.status} ${detail}`);
  }
};

const grantEntitlement = async (order: PolarOrder) => {
  const metadata = order.metadata ?? {};
  const userId =
    (metadata.userId as string | undefined) ??
    (metadata.user_id as string | undefined) ??
    order.customer?.external_id ??
    order.customer_external_id ??
    null;
  const email =
    (metadata.email as string | undefined) ??
    (metadata.customerEmail as string | undefined) ??
    order.customer?.email ??
    (order.customer_email ?? null);

  if (!userId && !email) {
    throw new Error("Missing customer identity for entitlement");
  }

  const supabase = getSupabaseAdmin();
  const baseQuery = supabase
    .from("profiles")
    .update({
      plan: "pro",
      polar_customer_id: order.customer?.id ?? order.customer_id ?? null,
      polar_order_id: order.id
    });

  const { error, data } = userId
    ? await baseQuery.eq("id", userId).select("id").maybeSingle()
    : await baseQuery.eq("email", email ?? "").select("id").maybeSingle();

  if (error) {
    throw new Error(`Profile update failed: ${error.message}`);
  }

  if (!data?.id) {
    throw new Error("Profile not found for order");
  }
};

export const POST = Webhooks({
  webhookSecret: process.env.POLAR_WEBHOOK_SECRET ?? "",
  onOrderPaid: async (payload) => {
    const order = (payload as unknown as { data?: PolarOrder }).data;
    if (!order?.id) {
      throw new Error("Missing order data in webhook payload");
    }
    try {
      await grantEntitlement(order);
    } catch (error) {
      await refundOrder(order.id);
      throw error;
    }
  }
});
