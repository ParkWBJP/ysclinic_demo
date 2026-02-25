import Link from "next/link";

import type { UiMessages } from "@/i18n";
import type { MenuItem } from "@/lib/types";

type SiteFooterProps = {
  siteTitle: string;
  menuItems: MenuItem[];
  ui: UiMessages;
};

export function SiteFooter({ siteTitle, menuItems, ui }: SiteFooterProps) {
  const navItems = menuItems.filter((item) => item.slug !== "home").slice(0, 10);

  return (
    <footer className="site-footer" id="contact">
      <div className="site-footer__inner">
        <section>
          <h2>{siteTitle}</h2>
          <p>{ui.footerSummary}</p>
          <p className="site-footer__meta">{ui.footerMeta}</p>
        </section>

        <section>
          <h3>{ui.quickLinks}</h3>
          <div className="site-footer__links">
            {navItems.map((item) => (
              <Link key={item.path} href={item.path}>
                {item.title}
              </Link>
            ))}
          </div>
        </section>

        <section>
          <h3>{ui.legalTitle}</h3>
          <p>{ui.legalText}</p>
        </section>
      </div>
    </footer>
  );
}
