import Link from "next/link";

import type { UiMessages } from "@/i18n";

type StickyCtaProps = {
  reservePath: string;
  ui: UiMessages;
};

export function StickyCta({ reservePath, ui }: StickyCtaProps) {
  return (
    <aside className="sticky-cta" aria-label={ui.inquiry}>
      <Link href={reservePath}>{ui.reserve}</Link>
      <a href="#access">{ui.accessButtonLabel}</a>
      <a href="tel:+810000000000">{ui.phoneInquiry}</a>
      <a href="#contact">{ui.lineInquiry}</a>
    </aside>
  );
}
