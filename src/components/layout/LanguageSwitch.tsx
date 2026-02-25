"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import type { SupportedLocale, UiMessages } from "@/i18n";
import { SUPPORTED_LOCALES } from "@/i18n";

type LanguageSwitchProps = {
  locale: SupportedLocale;
  ui: UiMessages;
};

function buildLocalizedPath(pathname: string, nextLocale: SupportedLocale) {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) {
    return `/${nextLocale}/`;
  }
  if (SUPPORTED_LOCALES.includes(segments[0] as SupportedLocale)) {
    const rest = segments.slice(1).join("/");
    return rest ? `/${nextLocale}/${rest}/` : `/${nextLocale}/`;
  }
  return `/${nextLocale}${pathname.endsWith("/") ? pathname : `${pathname}/`}`;
}

export function LanguageSwitch({ locale, ui }: LanguageSwitchProps) {
  const pathname = usePathname();

  return (
    <div className="language-switch" aria-label={ui.switchLanguage}>
      <Link
        href={buildLocalizedPath(pathname, "ja")}
        className={locale === "ja" ? "active" : ""}
      >
        {ui.languageJapanese}
      </Link>
      <Link
        href={buildLocalizedPath(pathname, "ko")}
        className={locale === "ko" ? "active" : ""}
      >
        {ui.languageKorean}
      </Link>
    </div>
  );
}
