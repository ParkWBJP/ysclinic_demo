import Link from "next/link";

import { LanguageSwitch } from "@/components/layout/LanguageSwitch";
import type { SupportedLocale, UiMessages } from "@/i18n";
import type { MenuItem } from "@/lib/types";

type PrimaryNavItem = {
  title: string;
  path: string;
  isEmphasis?: boolean;
};

type SiteHeaderProps = {
  siteTitle: string;
  menuItems: MenuItem[];
  primaryNavItems: PrimaryNavItem[];
  locale: SupportedLocale;
  ui: UiMessages;
  reservePath: string;
};

export function SiteHeader({
  siteTitle,
  menuItems,
  primaryNavItems,
  locale,
  ui,
  reservePath,
}: SiteHeaderProps) {
  const homeItem = menuItems.find((item) => item.slug === "home") ?? menuItems[0];

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link href={homeItem?.path ?? "/"} className="site-header__brand">
          <span className="site-header__brand-sub">{ui.siteTagline}</span>
          <strong>{siteTitle}</strong>
        </Link>

        <nav className="site-header__primary-nav" aria-label="Primary Menu">
          {primaryNavItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`site-header__nav-link${item.isEmphasis ? " is-emphasis" : ""}`}
            >
              {item.title}
            </Link>
          ))}
        </nav>

        <details className="site-header__mobile-menu">
          <summary aria-label="Open menu">
            <span />
            <span />
            <span />
          </summary>
          <div className="site-header__mobile-panel">
            {primaryNavItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`site-header__mobile-link${item.isEmphasis ? " is-emphasis" : ""}`}
              >
                {item.title}
              </Link>
            ))}
          </div>
        </details>

        <Link href={reservePath} className="site-header__cta">
          {ui.reserve}
        </Link>

        <LanguageSwitch locale={locale} ui={ui} />
      </div>
    </header>
  );
}
