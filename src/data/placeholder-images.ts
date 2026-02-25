import type { SupportedLocale } from "@/i18n";

type ImageKey =
  | "hero"
  | "program"
  | "trust"
  | "doctor"
  | "faq"
  | "cta"
  | "subpageHero"
  | "facility";

type PlaceholderImage = {
  src: string;
  alt: Record<SupportedLocale, string>;
};

export const PLACEHOLDER_IMAGES: Record<ImageKey, PlaceholderImage> = {
  hero: {
    src: "/placeholders/hero-clinic.svg",
    alt: {
      ja: "クリニックのメインビジュアルプレースホルダー",
      ko: "클리닉 메인 비주얼 플레이스홀더",
    },
  },
  program: {
    src: "/placeholders/treatment-card.svg",
    alt: {
      ja: "施術メニューカード用プレースホルダー",
      ko: "시술 카드용 플레이스홀더",
    },
  },
  trust: {
    src: "/placeholders/facility-lounge.svg",
    alt: {
      ja: "院内イメージプレースホルダー",
      ko: "클리닉 내부 이미지 플레이스홀더",
    },
  },
  doctor: {
    src: "/placeholders/doctor-portrait.svg",
    alt: {
      ja: "医師紹介プレースホルダー",
      ko: "의료진 소개 플레이스홀더",
    },
  },
  faq: {
    src: "/placeholders/faq-banner.svg",
    alt: {
      ja: "FAQセクションバナープレースホルダー",
      ko: "FAQ 섹션 배너 플레이스홀더",
    },
  },
  cta: {
    src: "/placeholders/cta-banner.svg",
    alt: {
      ja: "相談CTAバナープレースホルダー",
      ko: "상담 CTA 배너 플레이스홀더",
    },
  },
  subpageHero: {
    src: "/placeholders/subpage-hero.svg",
    alt: {
      ja: "施術詳細ページのヘッダービジュアル",
      ko: "시술 상세 페이지 헤더 비주얼",
    },
  },
  facility: {
    src: "/placeholders/facility-detail.svg",
    alt: {
      ja: "クリニック設備紹介プレースホルダー",
      ko: "클리닉 시설 소개 플레이스홀더",
    },
  },
};

export function getPlaceholderImage(key: ImageKey, locale: SupportedLocale) {
  const item = PLACEHOLDER_IMAGES[key];
  return {
    src: item.src,
    alt: item.alt[locale],
  };
}
