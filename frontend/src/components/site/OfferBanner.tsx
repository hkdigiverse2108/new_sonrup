import { useEffect, useState } from "react";
import { useIntegrationsSettings } from "@/lib/api";
import { Copy, ArrowRight, Ticket, Check } from "lucide-react";
import { toast } from "sonner";
import { useRouterState } from "@tanstack/react-router";

export function OfferBanner() {
  const loaderData = useRouterState({ select: (s) => s.matches[0]?.loaderData }) as any;
  const { data: settings } = useIntegrationsSettings();
  const activeSettings = settings || loaderData?.integrationsSettings;

  const [copied, setCopied] = useState(false);

  const enabled = activeSettings?.offer_banner_enabled !== false;
  const code = activeSettings?.offer_banner_code || "WELCOME100";
  const title = activeSettings?.offer_banner_title || "Flat ₹100 OFF on Your Order";
  const buttonText = activeSettings?.offer_banner_button_text || "Copy Code";

  if (!enabled) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success(`Coupon code ${code} copied! 🎉`);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <>
      {/* Desktop: Centered Full-Width Golden Offer Bar with Larger High-Contrast Typography */}
      <div className="hidden lg:block w-full bg-gradient-to-r from-[#c69229] via-[#ecd067] to-[#c69229] border-b border-[#b8851f] shadow-md">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-4 lg:px-10 py-3 text-center">
          {/* Centered text & button container */}
          <div className="mx-auto flex items-center justify-center gap-3.5">
            <p className="text-[16px] font-black text-[#1a1208] tracking-tight">
              <span>{title}</span>
              <span className="ml-2 font-black text-[#1a1208]">— Use code</span>
            </p>

            {/* High-Contrast Centered Coupon Code Badge */}
            <button
              onClick={handleCopy}
              title="Click to copy coupon code"
              className="group relative inline-flex items-center gap-2 rounded-full border border-[#1a1208] bg-[#1a1208] px-5.5 py-1.5 font-mono text-[15px] font-black uppercase tracking-widest text-[#f7dc78] shadow-[0_4px_16px_rgba(26,18,8,0.4)] ring-2 ring-[#1a1208]/30 ring-offset-1 ring-offset-[#ecd067] transition-all hover:bg-[#2b1e0f] hover:scale-105 active:scale-95 cursor-pointer"
            >
              {copied ? (
                <Check className="h-4 w-4 text-[#f7dc78] animate-in zoom-in" />
              ) : (
                <Copy className="h-4 w-4 text-[#f7dc78]" />
              )}
              <span className="font-mono text-[15px] font-black tracking-widest">{copied ? "COPIED!" : code}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile: Fixed bottom card with Coupon CTA */}
      <div className="lg:hidden fixed bottom-4 left-4 right-4 z-40 rounded-2xl border border-[#b8851f] bg-gradient-to-b from-[#ecd067] to-[#c69229] p-4 shadow-[0_16px_40px_rgba(198,146,41,0.5)] animate-in slide-in-from-bottom duration-500">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-[#1a1208]/30 bg-[#1a1208]/15 text-[#1a1208]">
            <Ticket className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-display text-[16px] font-black tracking-tight text-[#1a1208]">
              {title}
            </h3>
            <p className="text-[13px] font-black text-[#1a1208]">
              Use coupon code below
            </p>
          </div>
        </div>

        <button
          onClick={handleCopy}
          className="mt-3.5 flex w-full items-center justify-center gap-2.5 rounded-xl bg-[#1a1208] px-4 py-3 text-[14.5px] font-black text-[#f7dc78] shadow-[0_4px_16px_rgba(26,18,8,0.4)] transition-all hover:bg-[#2e1f0e] active:scale-[0.98]"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 text-[#f7dc78]" />
              <span>COPIED TO CLIPBOARD! 🎉</span>
            </>
          ) : (
            <>
              <Copy className="h-4 w-4 text-[#f7dc78]" />
              <span>{buttonText} — {code}</span>
            </>
          )}
        </button>
      </div>
    </>
  );
}
