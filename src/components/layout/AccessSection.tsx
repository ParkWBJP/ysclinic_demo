import Image from "next/image";

import { getPlaceholderImage } from "@/data/placeholder-images";
import type { SupportedLocale, UiMessages } from "@/i18n";

const GOOGLE_MAP_URL =
  "https://www.google.com/maps/place/%EC%98%88%EC%A0%95%ED%99%80%EB%A6%AD%EC%84%B1%ED%98%95%EC%99%B8%EA%B3%BC/data=!3m1!4b1!4m6!3m5!1s0x357ca159bfcc1ad1:0x269945d3f9656767!8m2!3d37.4987334!4d127.0278077!16s%2Fg%2F11d_8dp2cz?entry=ttu&g_ep=EgoyMDI2MDIyMi4wIKXMDSoASAFQAw%3D%3D";

type AccessSectionProps = {
  locale: SupportedLocale;
  ui: UiMessages;
};

export function AccessSection({ locale, ui }: AccessSectionProps) {
  const mapImage = getPlaceholderImage("facility", locale);

  return (
    <section className="access-section" id="access" aria-label={ui.accessSectionTitle}>
      <div className="access-section__head">
        <p>{ui.accessButtonLabel}</p>
        <h2>{ui.accessSectionTitle}</h2>
      </div>

      <div className="access-section__grid">
        <a
          href={GOOGLE_MAP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="access-map"
          aria-label={ui.googleMapButton}
        >
          <Image src={mapImage.src} alt={ui.accessMapAlt || mapImage.alt} width={980} height={640} />
          <span>{ui.googleMapButton}</span>
        </a>

        <div className="access-details">
          <h3>{ui.accessClinicName}</h3>
          <p>{ui.accessAddress}</p>
          <div className="access-details__meta">
            <p>
              <strong>{ui.accessHoursLabel}</strong>
              <span>{ui.accessHoursValue}</span>
            </p>
            <p>
              <strong>{ui.accessPhoneLabel}</strong>
              <span>{ui.accessPhoneValue}</span>
            </p>
          </div>
          <a
            href={GOOGLE_MAP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="access-details__map-button"
          >
            {ui.googleMapButton}
          </a>
        </div>
      </div>
    </section>
  );
}
