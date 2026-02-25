import ja from "@/i18n/messages/ja.json";
import ko from "@/i18n/messages/ko.json";

export const SUPPORTED_LOCALES = ["ja", "ko"] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export type UiMessages = typeof ja;

const messages: Record<SupportedLocale, UiMessages> = {
  ja,
  ko,
};

export function isSupportedLocale(locale: string): locale is SupportedLocale {
  return SUPPORTED_LOCALES.includes(locale as SupportedLocale);
}

export function getMessages(locale: SupportedLocale): UiMessages {
  return messages[locale];
}
