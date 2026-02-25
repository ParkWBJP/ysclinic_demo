import type { SupportedLocale } from "@/i18n";

export function normalizePath(pathValue: string): string {
  if (!pathValue || pathValue === "/") {
    return "/";
  }
  const normalized = pathValue.startsWith("/") ? pathValue : `/${pathValue}`;
  if (/\.[a-z0-9]{2,5}$/i.test(normalized)) {
    return normalized;
  }
  return normalized.endsWith("/") ? normalized : `${normalized}/`;
}

export function withLocalePath(locale: SupportedLocale, pathValue: string): string {
  const normalized = normalizePath(pathValue);
  if (normalized === "/") {
    return `/${locale}/`;
  }
  return `/${locale}${normalized}`;
}

export function pathFromSlug(slug?: string[]): string {
  if (!slug || slug.length === 0) {
    return "/";
  }
  return normalizePath(`/${slug.join("/")}/`);
}
