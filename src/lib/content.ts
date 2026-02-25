import contentData from "@/data/site-content.generated.json";
import type { ContentRecord, MenuItem, SiteContent } from "@/lib/types";
import { normalizePath } from "@/lib/routing";

const data = contentData as SiteContent;

function safeDecode(pathValue: string): string {
  try {
    return decodeURI(pathValue);
  } catch {
    return pathValue;
  }
}

const allContent = [...data.pages, ...data.posts];
const contentIndex = new Map<string, ContentRecord>();
for (const entry of allContent) {
  contentIndex.set(normalizePath(entry.path), entry);
  contentIndex.set(normalizePath(entry.pathDecoded), entry);
  contentIndex.set(normalizePath(safeDecode(entry.path)), entry);
}

export function getSiteContent(): SiteContent {
  return data;
}

export function getMenuItems(): MenuItem[] {
  return data.menu.items;
}

export function getHomePage(): ContentRecord | undefined {
  return contentIndex.get("/");
}

export function getAllRoutes(): string[] {
  return allContent.map((entry) => normalizePath(entry.path));
}

export function getContentByPath(pathValue: string): ContentRecord | undefined {
  const normalized = normalizePath(pathValue);
  return contentIndex.get(normalized) ?? contentIndex.get(normalizePath(safeDecode(normalized)));
}

export function getRelatedPages(currentPath: string, limit = 6): ContentRecord[] {
  const normalized = normalizePath(currentPath);
  return data.pages.filter((page) => page.path !== normalized && page.path !== "/").slice(0, limit);
}
