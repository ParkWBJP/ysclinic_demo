import { notFound } from "next/navigation";

import { AccessSection } from "@/components/layout/AccessSection";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { StickyCta } from "@/components/layout/StickyCta";
import { getMenuItems, getSiteContent } from "@/lib/content";
import { withLocalePath } from "@/lib/routing";
import { getMessages, isSupportedLocale, SUPPORTED_LOCALES, type SupportedLocale } from "@/i18n";

type LocaleLayoutProps = Readonly<{
  children: React.ReactNode;
  params: {
    locale: string;
  };
}>;

function buildLocalizedMenu(locale: SupportedLocale) {
  return getMenuItems().map((item) => ({
    ...item,
    path: withLocalePath(locale, item.path),
  }));
}

function buildPrimaryNav(locale: SupportedLocale, ui: ReturnType<typeof getMessages>) {
  return [
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
}

export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((locale) => ({ locale }));
}

export default function LocaleLayout({ children, params }: LocaleLayoutProps) {
  if (!isSupportedLocale(params.locale)) {
    notFound();
  }

  const locale = params.locale;
  const ui = getMessages(locale);
  const site = getSiteContent();
  const menuItems = buildLocalizedMenu(locale);
  const primaryNavItems = buildPrimaryNav(locale, ui);
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
      {children}
      <AccessSection locale={locale} ui={ui} />
      <SiteFooter siteTitle={site.site.title || "YS Clinic"} menuItems={menuItems} ui={ui} />
      <StickyCta reservePath={reservePath} ui={ui} />
    </div>
  );
}
