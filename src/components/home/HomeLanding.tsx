import Link from "next/link";
import Image from "next/image";

import { getPlaceholderImage } from "@/data/placeholder-images";
import type { SupportedLocale, UiMessages } from "@/i18n";
import { withLocalePath } from "@/lib/routing";
import type { ContentRecord } from "@/lib/types";

type HomeLandingProps = {
  siteTitle: string;
  home: ContentRecord | null;
  featuredPages: ContentRecord[];
  locale: SupportedLocale;
  ui: UiMessages;
};

export function HomeLanding({
  siteTitle,
  home,
  featuredPages,
  locale,
  ui,
}: HomeLandingProps) {
  const heroImage = getPlaceholderImage("hero", locale);
  const trustImage = getPlaceholderImage("trust", locale);
  const doctorImage = getPlaceholderImage("doctor", locale);
  const faqImage = getPlaceholderImage("faq", locale);
  const ctaImage = getPlaceholderImage("cta", locale);
  const programImage = getPlaceholderImage("program", locale);
  const facilityImage = getPlaceholderImage("facility", locale);

  const heroSummary =
    home?.excerpt || ui.heroDescriptionFallback;

  return (
    <main className="home" lang={locale}>
      <section className="hero">
        <div className="hero__content">
          <p className="hero__eyebrow">{ui.heroEyebrow}</p>
          <h1>{siteTitle || ui.heroTitleFallback}</h1>
          <p>{heroSummary}</p>
          <div className="hero__actions">
            <a href="#contact">{ui.heroPrimaryAction}</a>
            <a href="#programs">{ui.heroSecondaryAction}</a>
          </div>
        </div>
        <div className="hero__media">
          <Image src={heroImage.src} alt={heroImage.alt} width={1600} height={920} priority />
        </div>
      </section>

      <section className="trust-grid">
        <article>
          <div className="card-media">
            <Image src={trustImage.src} alt={trustImage.alt} width={1080} height={620} />
          </div>
          <h2>{ui.trustTitle1}</h2>
          <p>{ui.trustBody1}</p>
        </article>
        <article>
          <div className="card-media">
            <Image src={facilityImage.src} alt={facilityImage.alt} width={980} height={640} />
          </div>
          <h2>{ui.trustTitle2}</h2>
          <p>{ui.trustBody2}</p>
        </article>
        <article>
          <div className="card-media">
            <Image src={doctorImage.src} alt={doctorImage.alt} width={760} height={860} />
          </div>
          <h2>{ui.trustTitle3}</h2>
          <p>{ui.trustBody3}</p>
        </article>
      </section>

      <section className="programs" id="programs">
        <div className="section-head">
          <p>{ui.programHeadingEyebrow}</p>
          <h2>{ui.programHeadingTitle}</h2>
        </div>
        <div className="programs__grid">
          {featuredPages.map((page) => (
            <Link key={page.path} href={withLocalePath(locale, page.path)} className="program-card">
              <div className="program-card__media">
                <Image
                  src={page.featuredImage || programImage.src}
                  alt={page.title || programImage.alt}
                  width={840}
                  height={560}
                />
              </div>
              <h3>{page.title}</h3>
              <p>{page.excerpt}</p>
              <span>{ui.programCardAction}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="expansion-grid">
        <article>
          <div className="card-media">
            <Image src={facilityImage.src} alt={facilityImage.alt} width={980} height={640} />
          </div>
          <h2>{ui.aboutTitle}</h2>
          <p>{ui.aboutBody}</p>
        </article>
        <article>
          <div className="card-media">
            <Image src={doctorImage.src} alt={doctorImage.alt} width={760} height={860} />
          </div>
          <h2>{ui.doctorTitle}</h2>
          <p>{ui.doctorBody}</p>
        </article>
        <article>
          <div className="card-media">
            <Image src={faqImage.src} alt={faqImage.alt} width={1400} height={500} />
          </div>
          <h2>{ui.faqTitle}</h2>
          <p>{ui.faqBody}</p>
        </article>
      </section>

      <section className="cta-banner">
        <div className="cta-banner__text">
          <h2>{ui.reserve}</h2>
          <p>{ui.footerSummary}</p>
          <a href="#contact">{ui.inquiry}</a>
        </div>
        <div className="cta-banner__media">
          <Image src={ctaImage.src} alt={ctaImage.alt} width={1200} height={420} />
        </div>
      </section>

      {home?.hasContent ? (
        <section className="home-content">
          <div className="section-head">
            <p>{ui.originalContent}</p>
            <h2>{home.title}</h2>
          </div>
          <div className="rich-content" dangerouslySetInnerHTML={{ __html: home.html }} />
        </section>
      ) : null}

      {locale === "ko" && ui.translationNotice ? (
        <section className="translation-notice">
          <p>{ui.translationNotice}</p>
        </section>
      ) : null}
    </main>
  );
}
