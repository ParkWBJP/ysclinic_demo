export const SUPPORTED_LOCALES = ["ja", "ko"] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];
