import type { Metadata } from "next";

import { HomeLanding } from "@/components/home/HomeLanding";
import { AccessSection } from "@/components/layout/AccessSection";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { StickyCta } from "@/components/layout/StickyCta";
import { getHomePage, getMenuItems, getSiteContent } from "@/lib/content";
import { withLocalePath } from "@/lib/routing";
import { getMessages } from "@/i18n";

export const dynamic = "force-static";

export function generateMetadata(): Metadata {
  const site = getSiteContent();
  const home = getHomePage();
  const ui = getMessages("ja");

  return {
    title: home?.title || ui.heroTitleFallback,
    description: home?.excerpt || ui.heroDescriptionFallback || site.site.description,
    openGraph: {
      title: home?.title || ui.heroTitleFallback,
      description: home?.excerpt || ui.heroDescriptionFallback || site.site.description,
      url: "/",
      type: "website",
    },
  };
}

export default function RootHomePage() {
  const locale = "ja";
  const ui = getMessages(locale);
  const site = getSiteContent();
  const menuItems = getMenuItems().map((item) => ({
    ...item,
    path: withLocalePath(locale, item.path),
  }));
  const primaryNavItems = [
    {
      title: ui.menuHospitalIntro,
      path: withLocalePath(locale, "/%e3%82%af%e3%83%aa%e3%83%8b%e3%83%83%e3%82%af%e7%b4%b9%e4%bb%8b/"),
    },
    {
      title: ui.menuFace,
      path: withLocalePath(locale, "/%e7%9b%ae%e3%81%ae%e6%95%b4%e5%bd%a2/"),
    },
    {
      title: ui.menuContour,
      path: withLocalePath(locale, "/%e8%bc%aa%e9%83%ad%e6%b3%a8%e5%b0%84-%e8%82%a5%e6%ba%80/"),
    },
    {
      title: ui.menuYouthful,
      path: withLocalePath(locale, "/%e5%b0%8f%e9%a1%94v%e3%83%a9%e3%82%a4%e3%83%b3%e3%82%b3%e3%83%bc%e3%82%b9/"),
    },
    {
      title: ui.menuLifting,
      path: withLocalePath(locale, "/%e3%83%aa%e3%83%95%e3%83%86%e3%82%a3%e3%83%b3%e3%82%b0/"),
    },
    {
      title: ui.menuConsult,
      path: withLocalePath(locale, "/%e5%88%9d%e3%82%81%e3%81%a6%e3%81%ae%e6%96%b9%e3%81%b8/"),
      isEmphasis: true,
    },
  ];
  const home = getHomePage() ?? null;
  const featured = site.pages.filter((page) => page.path !== "/").slice(0, 9);
  const reservePath = menuItems.find((item) => item.slug !== "home")?.path ?? `/${locale}/`;

  return (
    <div className={`site-shell locale-${locale}`} data-locale={locale}>
      <SiteHeader
        siteTitle={site.site.title || "YS Clinic"}
        menuItems={menuItems}
        primaryNavItems={primaryNavItems}
        locale={locale}
        ui={ui}
        reservePath={reservePath}
      />
      <HomeLanding
        siteTitle={site.site.title || ui.heroTitleFallback}
        home={home}
        featuredPages={featured}
        locale={locale}
        ui={ui}
      />
      <AccessSection locale={locale} ui={ui} />
      <SiteFooter siteTitle={site.site.title || "YS Clinic"} menuItems={menuItems} ui={ui} />
      <StickyCta reservePath={reservePath} ui={ui} />
    </div>
  );
}
