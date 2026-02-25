import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ContentPage } from "@/components/pages/ContentPage";
import { getAllRoutes, getContentByPath, getRelatedPages, getSiteContent } from "@/lib/content";
import { pathFromSlug, withLocalePath } from "@/lib/routing";
import { getMessages, isSupportedLocale, SUPPORTED_LOCALES, type SupportedLocale } from "@/i18n";

type LocaleSlugProps = {
  params: {
    locale: string;
    slug: string[];
  };
};

export function generateStaticParams() {
  const routes = getAllRoutes().filter((routePath) => routePath !== "/");
  const params: Array<{ locale: SupportedLocale; slug: string[] }> = [];
  for (const locale of SUPPORTED_LOCALES) {
    for (const routePath of routes) {
      const segments = routePath
        .split("/")
        .filter(Boolean)
        .map((segment) => {
          try {
            return decodeURIComponent(segment);
          } catch {
            return segment;
          }
        });
      params.push({ locale, slug: segments });
    }
  }
  return params;
}

export function generateMetadata({ params }: LocaleSlugProps): Metadata {
  if (!isSupportedLocale(params.locale)) {
    return {};
  }
  const locale = params.locale;
  const ui = getMessages(locale);
  const site = getSiteContent();
  const contentPath = pathFromSlug(params.slug);
  const entry = getContentByPath(contentPath);
  if (!entry || entry.path === "/") {
    return {
      title: ui.notFoundTitle,
      description: ui.notFoundBody,
    };
  }
  return {
    title: entry.title,
    description: entry.excerpt || site.site.description,
    openGraph: {
      title: entry.title,
      description: entry.excerpt || site.site.description,
      type: "article",
      url: withLocalePath(locale, entry.path),
    },
  };
}

export default function LocaleDynamicPage({ params }: LocaleSlugProps) {
  if (!isSupportedLocale(params.locale)) {
    notFound();
  }
  const locale = params.locale as SupportedLocale;
  const ui = getMessages(locale);
  const contentPath = pathFromSlug(params.slug);
  const entry = getContentByPath(contentPath);
  if (!entry || entry.path === "/") {
    notFound();
  }
  const related = getRelatedPages(entry.path, 6);
  return <ContentPage entry={entry} related={related} locale={locale} ui={ui} />;
}
