import Link from "next/link";
import Image from "next/image";

import { getPlaceholderImage } from "@/data/placeholder-images";
import type { SupportedLocale, UiMessages } from "@/i18n";
import { withLocalePath } from "@/lib/routing";
import type { ContentRecord } from "@/lib/types";

type ContentPageProps = {
  entry: ContentRecord;
  related: ContentRecord[];
  locale: SupportedLocale;
  ui: UiMessages;
};

function getTemplateLabel(template: ContentRecord["template"], ui: UiMessages) {
  if (template === "post") {
    return ui.subpageLabelPost;
  }
  if (template === "placeholder") {
    return ui.subpageLabelPlaceholder;
  }
  if (template === "page") {
    return ui.subpageLabelPage;
  }
  return ui.subpageLabelProcedure;
}

export function ContentPage({ entry, related, locale, ui }: ContentPageProps) {
  const subpageImage = getPlaceholderImage("subpageHero", locale);
  const doctorImage = getPlaceholderImage("doctor", locale);
  const ctaImage = getPlaceholderImage("cta", locale);

  return (
    <main className="subpage" lang={locale}>
      <section className="subpage-hero">
        <div className="subpage-hero__content">
          <p>{getTemplateLabel(entry.template, ui)}</p>
          <h1>{entry.title}</h1>
          <p>{entry.excerpt}</p>
        </div>
        <div className="subpage-hero__media">
          <Image src={entry.featuredImage || subpageImage.src} alt={entry.title || subpageImage.alt} width={1400} height={460} />
        </div>
      </section>

      <div className="subpage-body">
        <article className="subpage-article">
          {entry.hasContent ? (
            <div
              className="rich-content"
              dangerouslySetInnerHTML={{ __html: entry.html }}
            />
          ) : (
            <section className="placeholder-block">
              <h2>{ui.placeholderTitle}</h2>
              <p>{ui.placeholderBody}</p>
            </section>
          )}
        </article>

        <aside className="subpage-aside">
          <div className="side-card">
            <div className="side-card__media">
              <Image src={doctorImage.src} alt={doctorImage.alt} width={760} height={860} />
            </div>
            <h2>{ui.consultTitle}</h2>
            <p>{ui.consultBody}</p>
            <a href="tel:+810000000000">{ui.phoneInquiry}</a>
            <a href="#contact">{ui.lineInquiry}</a>
          </div>
          <div className="side-card">
            <h2>{ui.baseInfoTitle}</h2>
            <p>
              {ui.publishedAt}: {entry.publishedAt || "-"}
            </p>
            <p>
              {ui.imageCount}: {entry.imageCount}
            </p>
            <p>
              {ui.pathLabel}: {entry.path}
            </p>
            <div className="side-card__banner">
              <Image src={ctaImage.src} alt={ctaImage.alt} width={1200} height={420} />
            </div>
          </div>
        </aside>
      </div>

      <section className="related">
        <h2>{ui.relatedTitle}</h2>
        <div className="related__grid">
          {related.map((page) => (
            <Link key={page.path} href={withLocalePath(locale, page.path)} className="related__card">
              <h3>{page.title}</h3>
              <p>{page.excerpt}</p>
            </Link>
          ))}
        </div>
      </section>

      {locale === "ko" && ui.translationNotice ? (
        <section className="translation-notice">
          <p>{ui.translationNotice}</p>
        </section>
      ) : null}
    </main>
  );
}
