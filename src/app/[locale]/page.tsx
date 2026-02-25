import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { HomeLanding } from "@/components/home/HomeLanding";
import { getHomePage, getSiteContent } from "@/lib/content";
import { getMessages, isSupportedLocale, type SupportedLocale } from "@/i18n";

type LocalePageProps = {
  params: {
    locale: string;
  };
};

export const dynamic = "force-static";

export function generateMetadata({ params }: LocalePageProps): Metadata {
  if (!isSupportedLocale(params.locale)) {
    return {};
  }
  const locale = params.locale;
  const ui = getMessages(locale);
  const site = getSiteContent();
  const home = getHomePage();

  return {
    title: home?.title || ui.heroTitleFallback,
    description: home?.excerpt || ui.heroDescriptionFallback || site.site.description,
    openGraph: {
      title: home?.title || ui.heroTitleFallback,
      description: home?.excerpt || ui.heroDescriptionFallback || site.site.description,
      url: `/${locale}/`,
      type: "website",
    },
  };
}

export default function LocaleHomePage({ params }: LocalePageProps) {
  if (!isSupportedLocale(params.locale)) {
    notFound();
  }
  const locale = params.locale as SupportedLocale;
  const ui = getMessages(locale);
  const site = getSiteContent();
  const home = getHomePage() ?? null;
  const featured = site.pages.filter((page) => page.path !== "/").slice(0, 9);

  return (
    <HomeLanding
      siteTitle={site.site.title || ui.heroTitleFallback}
      home={home}
      featuredPages={featured}
      locale={locale}
      ui={ui}
    />
  );
}
