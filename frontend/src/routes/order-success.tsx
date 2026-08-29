import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { z } from "zod";
import { Container } from "@/components/site/Page";
import { BrandButton } from "@/components/site/Primitives";

const orderSuccessSearchSchema = z.object({
  orderId: z.string().default(""),
});

export const Route = createFileRoute("/order-success")({
  validateSearch: orderSuccessSearchSchema,
  head: () => ({
    meta: [
      { title: "Order Confirmed — Sonrup Gummies" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OrderSuccessPage,
});

function OrderSuccessPage() {
  const { orderId } = Route.useSearch();

  return (
    <main>
      <Container className="py-20">
        <div className="surface-card mx-auto flex max-w-xl flex-col items-center gap-5 px-6 py-16 text-center shadow-lg rounded-3xl border border-border">
          <div className="grid h-20 w-20 place-items-center rounded-full bg-[image:var(--gradient-gold)] shadow-md">
            <CheckCircle2 className="h-9 w-9 text-ink animate-bounce" />
          </div>
          <h1 className="display-xl text-4xl mt-2">Order Confirmed!</h1>
          <p className="text-sm text-muted-foreground max-w-md">
            Thank you for your order! Your order ID is <span className="font-bold text-foreground">{orderId || "SNR-XXXXXX"}</span>. We are packing your gummies, and you will receive a tracking link via email and SMS once dispatched.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-3 w-full">
            <Link to="/track-order" search={{ query: orderId }} className="w-full sm:w-auto">
              <BrandButton variant="solid" className="w-full sm:w-auto">Track Order</BrandButton>
            </Link>
            <Link to="/shop" className="w-full sm:w-auto">
              <BrandButton variant="outline" className="w-full sm:w-auto">Keep Shopping</BrandButton>
            </Link>
          </div>
        </div>
      </Container>
    </main>
  );
}
