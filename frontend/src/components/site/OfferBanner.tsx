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
  const subtitle = activeSettings?.offer_banner_subtitle || "Use code WELCOME100 at checkout";
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
      {/* Desktop: Full-width bar with RICH GOLDEN SHADING + LARGER HIGH-CONTRAST TEXT */}
      <div className="hidden lg:block w-full bg-gradient-to-r from-[#c69229] via-[#ecd067] to-[#c69229] border-b border-[#b8851f] shadow-md">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-4 lg:px-10 py-3">
          {/* Left: Code tag + offer message */}
          <div className="flex items-center gap-3.5">
            {/* Dark Ink Badge pill for high contrast code */}
            <span className="flex items-center gap-1.5 rounded-full border border-[#1a1208] bg-[#1a1208] px-3.5 py-1 font-mono text-[12.5px] font-black uppercase tracking-widest text-[#f7dc78] shrink-0 shadow-sm">
              ✦ {code}
            </span>
            <p className="text-[14.5px] font-black text-[#1a1208] tracking-tight">
              {title}
              <span className="ml-2 font-bold text-[#3b280e]">— {subtitle}</span>
            </p>
          </div>

          {/* Right: Larger Sleek Dark Ink CTA Copy Button */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#1a1208] px-4.5 py-1.5 text-[12px] font-black text-[#f7dc78] shadow-md transition-all hover:bg-[#2e1f0e] active:scale-95"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-[#f7dc78]" /> : <Copy className="h-3.5 w-3.5 text-[#f7dc78]" />}
              {copied ? "Copied!" : buttonText}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile: Fixed bottom card with LARGER TEXT */}
      <div className="lg:hidden fixed bottom-4 left-4 right-4 z-40 rounded-2xl border border-[#b8851f] bg-gradient-to-b from-[#ecd067] to-[#c69229] p-4 shadow-[0_16px_40px_rgba(198,146,41,0.5)] animate-in slide-in-from-bottom duration-500">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            {/* Icon box */}
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-[#1a1208]/30 bg-[#1a1208]/15 text-[#1a1208]">
              <Ticket className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display text-[15px] font-black tracking-tight text-[#1a1208]">
                {title}
              </h3>
              {/* Code pill */}
              <span className="mt-0.5 inline-block rounded-md bg-[#1a1208] px-2.5 py-0.5 font-mono text-[12px] font-bold text-[#f7dc78]">
                {code}
              </span>
            </div>
          </div>
        </div>

        <p className="mt-2.5 text-[13px] font-bold text-[#3b280e] leading-relaxed">
          {subtitle}
        </p>

        <button
          onClick={handleCopy}
          className="mt-3.5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#1a1208] px-4 py-2.5 text-[13px] font-black text-[#f7dc78] shadow-md transition-all hover:bg-[#2e1f0e] active:scale-[0.98]"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 text-[#f7dc78]" />
              <span>Copied to Clipboard! 🎉</span>
            </>
          ) : (
            <>
              <span>{buttonText} — {code}</span>
              <ArrowRight className="h-4 w-4 text-[#f7dc78]" />
            </>
          )}
        </button>
      </div>
    </>
  );
}
