import fs from "node:fs";
import path from "node:path";

import { load } from "cheerio";
import { XMLParser } from "fast-xml-parser";
import sanitizeHtml from "sanitize-html";

type Taxonomy = {
  domain: string;
  nicename: string;
  label: string;
};

type RawItem = {
  id: string;
  title: string;
  link: string;
  postType: string;
  status: string;
  slug: string;
  postDate: string;
  modifiedDate: string;
  parentId: string;
  menuOrder: number;
  content: string;
  excerpt: string;
  guid: string;
  attachmentUrl: string;
  taxonomy: Taxonomy[];
  meta: Record<string, string>;
};

type AttachmentRecord = {
  id: string;
  title: string;
  slug: string;
  path: string;
  url: string;
  alt: string;
  caption: string;
  description: string;
};

type TemplateKind = "home" | "procedure" | "page" | "post" | "placeholder";

type ContentRecord = {
  id: string;
  type: "page" | "post";
  title: string;
  path: string;
  pathDecoded: string;
  slug: string;
  slugDecoded: string;
  originalLink: string;
  publishedAt: string;
  modifiedAt: string;
  excerpt: string;
  categories: string[];
  tags: string[];
  html: string;
  imageCount: number;
  featuredImage: string | null;
  hasContent: boolean;
  template: TemplateKind;
};

type MenuItem = {
  title: string;
  path: string;
  slug: string;
  sourceId: string;
};

type SiteContent = {
  generatedAt: string;
  sourceXml: string;
  site: {
    title: string;
    link: string;
    description: string;
    language: string;
  };
  stats: {
    itemsTotal: number;
    pagesPublish: number;
    postsPublish: number;
    attachments: number;
  };
  menu: {
    inferredFrom: string;
    structure: "flat";
    items: MenuItem[];
  };
  pages: ContentRecord[];
  posts: ContentRecord[];
  attachments: AttachmentRecord[];
};

const ROOT_DIR = process.cwd();
const SOURCE_XML = process.env.WP_XML_PATH
  ? path.resolve(process.env.WP_XML_PATH)
  : path.join(ROOT_DIR, "data", "source", "yj.WordPress.2026-02-25.xml");

const OUTPUT_JSON = path.join(
  ROOT_DIR,
  "src",
  "data",
  "site-content.generated.json",
);
const ANALYSIS_MD = path.join(ROOT_DIR, "docs", "xml-analysis.md");
const URL_MAPPING_MD = path.join(ROOT_DIR, "docs", "url-mapping.md");

function toArray<T>(value: T | T[] | undefined): T[] {
  if (value === undefined) {
    return [];
  }
  return Array.isArray(value) ? value : [value];
}

function toText(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  if (typeof value === "object") {
    const node = value as Record<string, unknown>;
    if ("__cdata" in node) {
      return toText(node.__cdata);
    }
    if ("#text" in node) {
      return toText(node["#text"]);
    }
  }
  return "";
}

function safeDecodeURIComponent(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function safeDecodeURI(value: string): string {
  try {
    return decodeURI(value);
  } catch {
    return value;
  }
}

function trimSlashes(value: string): string {
  return value.replace(/^\/+|\/+$/g, "");
}

function normalizePath(pathname: string): string {
  if (!pathname) {
    return "/";
  }
  const cleaned = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const singleSlash = cleaned.replace(/\/{2,}/g, "/");
  if (singleSlash === "/") {
    return "/";
  }
  if (/\.[a-z0-9]{2,5}$/i.test(singleSlash)) {
    return singleSlash;
  }
  return singleSlash.endsWith("/") ? singleSlash : `${singleSlash}/`;
}

function getPathFromLink(link: string, slug: string): string {
  if (link) {
    try {
      const pathname = new URL(link).pathname;
      return normalizePath(pathname);
    } catch {
      return normalizePath(link);
    }
  }
  if (slug === "home") {
    return "/";
  }
  return normalizePath(`/${slug}/`);
}

function normalizeMediaUrl(url: string): string {
  if (!url) {
    return "";
  }
  try {
    const parsed = new URL(url);
    const pathname = parsed.pathname
      .replace(/-\d+x\d+(?=\.[a-z0-9]+$)/i, "")
      .toLowerCase();
    return `${parsed.origin.toLowerCase()}${pathname}`;
  } catch {
    return url.toLowerCase();
  }
}

function guessAltFromUrl(url: string): string {
  const clean = url.split("?")[0];
  const filename = clean.split("/").pop() ?? "clinic-image";
  return filename
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/[-_]+/g, " ")
    .trim();
}

function makeDescription(text: string, fallback: string): string {
  const source = text || fallback;
  if (!source) {
    return "プレミアムメディカルクリニックのコンテンツを準備中です。";
  }
  const normalized = source.replace(/\s+/g, " ").trim();
  return normalized.length > 160 ? `${normalized.slice(0, 157)}...` : normalized;
}

function chooseTemplate(record: {
  type: "page" | "post";
  path: string;
  slugDecoded: string;
  hasContent: boolean;
}): TemplateKind {
  if (record.path === "/") {
    return "home";
  }
  if (record.type === "post") {
    return "post";
  }
  if (!record.hasContent) {
    return "placeholder";
  }
  const infoKeywords = ["初めて", "about", "clinic", "access", "contact"];
  if (infoKeywords.some((keyword) => record.slugDecoded.includes(keyword))) {
    return "page";
  }
  return "procedure";
}

function normalizeInternalLink(href: string, siteOrigin: string): string {
  if (!href) {
    return href;
  }
  if (href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
    return href;
  }
  try {
    const url = new URL(href, siteOrigin);
    if (url.origin === siteOrigin) {
      const normalizedPath = normalizePath(url.pathname);
      return `${normalizedPath}${url.search}${url.hash}`;
    }
    return url.toString();
  } catch {
    return href;
  }
}

function normalizeImageSrc(src: string, siteOrigin: string): string {
  if (!src) {
    return src;
  }
  try {
    const url = new URL(src, siteOrigin);
    if (url.origin === siteOrigin) {
      return `${siteOrigin}${url.pathname}${url.search}`;
    }
    return url.toString();
  } catch {
    return src;
  }
}

function cleanHtml(input: {
  html: string;
  siteOrigin: string;
  fallbackAlt: string;
  attachmentAltByUrl: Map<string, string>;
}) {
  const stripped = input.html
    .replace(/<!--\s*\/?wp:[\s\S]*?-->/gi, "")
    .replace(
      /\[(\/)?(caption|gallery|embed|audio|video|playlist|contact-form-7|et_pb_[^\]\s]*|vc_[^\]\s]*)[^\]]*]/gi,
      "",
    )
    .trim();

  if (!stripped) {
    return {
      html: "",
      text: "",
      imageCount: 0,
    };
  }

  const $ = load(stripped);

  $("script,style,noscript,iframe,object,embed,form").remove();

  $("a").each((_, element) => {
    const anchor = $(element);
    const href = (anchor.attr("href") ?? "").trim();
    if (href) {
      anchor.attr("href", normalizeInternalLink(href, input.siteOrigin));
    }
    if (anchor.attr("target") === "_blank") {
      anchor.attr("rel", "noopener noreferrer");
    }
  });

  $("img").each((_, element) => {
    const image = $(element);
    const src = (image.attr("src") ?? "").trim();
    if (!src) {
      image.remove();
      return;
    }

    const normalizedSrc = normalizeImageSrc(src, input.siteOrigin);
    image.attr("src", normalizedSrc);
    image.attr("loading", "lazy");
    image.attr("decoding", "async");
    image.removeAttr("srcset");
    image.removeAttr("sizes");

    const alt = (image.attr("alt") ?? "").trim();
    if (!alt) {
      const mappedAlt = input.attachmentAltByUrl.get(normalizeMediaUrl(normalizedSrc));
      image.attr("alt", mappedAlt || input.fallbackAlt || guessAltFromUrl(src));
    }
  });

  $("p,li,h1,h2,h3,h4,h5,h6,div,span").each((_, element) => {
    const node = $(element);
    const hasMedia = node.find("img,video,br").length > 0;
    const text = node.text().replace(/\u00a0/g, " ").trim();
    if (!hasMedia && !text) {
      node.remove();
    }
  });

  $("*").each((_, element) => {
    const node = $(element);
    const nodeData = element as unknown as {
      tagName?: string;
      attribs?: Record<string, string>;
    };
    const tag = nodeData.tagName?.toLowerCase() ?? "";
    const allowed =
      tag === "a"
        ? ["href", "target", "rel", "title"]
        : tag === "img"
          ? ["src", "alt", "title", "loading", "decoding"]
          : tag === "blockquote"
            ? ["cite"]
            : [];

    for (const attr of Object.keys(nodeData.attribs ?? {})) {
      if (!allowed.includes(attr)) {
        node.removeAttr(attr);
      }
    }
  });

  const bodyHtml = $("body").html() ?? $.root().html() ?? "";
  const sanitized = sanitizeHtml(bodyHtml, {
    allowedTags: [
      "p",
      "br",
      "hr",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "ul",
      "ol",
      "li",
      "a",
      "img",
      "strong",
      "b",
      "em",
      "i",
      "u",
      "s",
      "blockquote",
      "figure",
      "figcaption",
      "table",
      "thead",
      "tbody",
      "tr",
      "th",
      "td",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel", "title"],
      img: ["src", "alt", "title", "loading", "decoding"],
      blockquote: ["cite"],
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowedSchemesByTag: {
      img: ["http", "https"],
    },
    allowProtocolRelative: false,
  }).trim();

  const plainText = load(`<div>${sanitized}</div>`)
    .text()
    .replace(/\s+/g, " ")
    .trim();

  const imageCount = (sanitized.match(/<img\b/gi) ?? []).length;

  return {
    html: sanitized,
    text: plainText,
    imageCount,
  };
}

function formatTitle(rawTitle: string, pathValue: string, slugValue: string, siteTitle: string): string {
  const title = rawTitle.trim();
  if (title) {
    return title;
  }
  if (pathValue === "/") {
    return siteTitle || "Clinic Home";
  }
  const decodedSlug = safeDecodeURIComponent(slugValue).replace(/[-_]+/g, " ").trim();
  return decodedSlug || trimSlashes(pathValue) || "Untitled";
}

function escapePipe(value: string): string {
  return value.replace(/\|/g, "\\|");
}

function parseRawItems(xmlText: string): {
  site: {
    title: string;
    link: string;
    description: string;
    language: string;
  };
  items: RawItem[];
} {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "",
    parseTagValue: false,
    trimValues: false,
    cdataPropName: "__cdata",
  });

  const parsed = parser.parse(xmlText) as Record<string, unknown>;
  const channel = (parsed.rss as Record<string, unknown>)?.channel as Record<string, unknown> | undefined;
  if (!channel) {
    throw new Error("WXR parse error: channel not found.");
  }

  const rawItems = toArray<Record<string, unknown>>(channel.item as Record<string, unknown> | Record<string, unknown>[] | undefined);
  const site = {
    title: toText(channel.title),
    link: toText(channel.link),
    description: toText(channel.description),
    language: toText(channel.language),
  };

  const items: RawItem[] = rawItems.map((item) => {
    const rawMeta = toArray<Record<string, unknown>>(item["wp:postmeta"] as Record<string, unknown> | Record<string, unknown>[] | undefined);
    const meta: Record<string, string> = {};
    for (const entry of rawMeta) {
      const key = toText(entry["wp:meta_key"]);
      if (!key) {
        continue;
      }
      meta[key] = toText(entry["wp:meta_value"]);
    }

    const rawCategories = toArray<Record<string, unknown>>(item.category as Record<string, unknown> | Record<string, unknown>[] | undefined);
    const taxonomy: Taxonomy[] = rawCategories.map((entry) => ({
      domain: toText(entry.domain),
      nicename: toText(entry.nicename),
      label: toText(entry),
    }));

    return {
      id: toText(item["wp:post_id"]),
      title: toText(item.title),
      link: toText(item.link),
      postType: toText(item["wp:post_type"]),
      status: toText(item["wp:status"]),
      slug: toText(item["wp:post_name"]),
      postDate: toText(item["wp:post_date"]),
      modifiedDate: toText(item["wp:post_modified"]),
      parentId: toText(item["wp:post_parent"]),
      menuOrder: Number.parseInt(toText(item["wp:menu_order"]) || "0", 10) || 0,
      content: toText(item["content:encoded"]),
      excerpt: toText(item["excerpt:encoded"]),
      guid: toText(item.guid),
      attachmentUrl: toText(item["wp:attachment_url"]),
      taxonomy,
      meta,
    };
  });

  return { site, items };
}

function buildOutput(): SiteContent {
  if (!fs.existsSync(SOURCE_XML)) {
    throw new Error(`XML not found: ${SOURCE_XML}`);
  }

  const xml = fs.readFileSync(SOURCE_XML, "utf8");
  const parsed = parseRawItems(xml);
  const siteOrigin = new URL(parsed.site.link).origin;

  const attachmentsRaw = parsed.items.filter(
    (item) => item.postType === "attachment" && item.status === "inherit",
  );
  const attachments: AttachmentRecord[] = attachmentsRaw.map((item) => {
    const pathValue = getPathFromLink(item.link, item.slug);
    const alt = item.meta._wp_attachment_image_alt || "";
    return {
      id: item.id,
      title: formatTitle(item.title, pathValue, item.slug, parsed.site.title),
      slug: item.slug,
      path: pathValue,
      url: item.attachmentUrl || item.guid || "",
      alt,
      caption: item.excerpt,
      description: item.content,
    };
  });

  const attachmentAltByUrl = new Map<string, string>();
  const attachmentById = new Map<string, AttachmentRecord>();
  for (const attachment of attachments) {
    attachmentById.set(attachment.id, attachment);
    if (!attachment.url) {
      continue;
    }
    const candidateAlt = attachment.alt || attachment.title;
    if (candidateAlt) {
      attachmentAltByUrl.set(normalizeMediaUrl(attachment.url), candidateAlt);
    }
  }

  const publishedPages = parsed.items.filter(
    (item) => item.postType === "page" && item.status === "publish",
  );
  const publishedPosts = parsed.items.filter(
    (item) => item.postType === "post" && item.status === "publish",
  );

  const pageRecords: ContentRecord[] = publishedPages.map((item) => {
    const pathValue = getPathFromLink(item.link, item.slug);
    const title = formatTitle(item.title, pathValue, item.slug, parsed.site.title);
    const cleaned = cleanHtml({
      html: item.content,
      siteOrigin,
      fallbackAlt: title,
      attachmentAltByUrl,
    });
    const slugDecoded = safeDecodeURIComponent(item.slug);
    const hasContent = cleaned.text.length > 0;
    const template = chooseTemplate({
      type: "page",
      path: pathValue,
      slugDecoded,
      hasContent,
    });
    const featuredImageAttachment = attachmentById.get(item.meta._thumbnail_id || "");
    return {
      id: item.id,
      type: "page",
      title,
      path: pathValue,
      pathDecoded: safeDecodeURI(pathValue),
      slug: item.slug,
      slugDecoded,
      originalLink: item.link,
      publishedAt: item.postDate,
      modifiedAt: item.modifiedDate,
      excerpt: makeDescription(cleaned.text, item.excerpt),
      categories: item.taxonomy
        .filter((tax) => tax.domain === "category")
        .map((tax) => tax.label),
      tags: item.taxonomy.filter((tax) => tax.domain === "post_tag").map((tax) => tax.label),
      html: cleaned.html,
      imageCount: cleaned.imageCount,
      featuredImage: featuredImageAttachment?.url ?? null,
      hasContent,
      template,
    };
  });

  const postRecords: ContentRecord[] = publishedPosts.map((item) => {
    const pathValue = getPathFromLink(item.link, item.slug);
    const title = formatTitle(item.title, pathValue, item.slug, parsed.site.title);
    const cleaned = cleanHtml({
      html: item.content,
      siteOrigin,
      fallbackAlt: title,
      attachmentAltByUrl,
    });
    const slugDecoded = safeDecodeURIComponent(item.slug);
    const hasContent = cleaned.text.length > 0;
    const featuredImageAttachment = attachmentById.get(item.meta._thumbnail_id || "");
    return {
      id: item.id,
      type: "post",
      title,
      path: pathValue,
      pathDecoded: safeDecodeURI(pathValue),
      slug: item.slug,
      slugDecoded,
      originalLink: item.link,
      publishedAt: item.postDate,
      modifiedAt: item.modifiedDate,
      excerpt: makeDescription(cleaned.text, item.excerpt),
      categories: item.taxonomy
        .filter((tax) => tax.domain === "category")
        .map((tax) => tax.label),
      tags: item.taxonomy.filter((tax) => tax.domain === "post_tag").map((tax) => tax.label),
      html: cleaned.html,
      imageCount: cleaned.imageCount,
      featuredImage: featuredImageAttachment?.url ?? null,
      hasContent,
      template: hasContent ? "post" : "placeholder",
    };
  });

  pageRecords.sort((a, b) => a.path.localeCompare(b.path, "ja"));
  postRecords.sort((a, b) => a.path.localeCompare(b.path, "ja"));

  const homeRecord = pageRecords.find((page) => page.path === "/");
  const menuPages = pageRecords.filter((page) => page.path !== "/");
  menuPages.sort((a, b) => a.title.localeCompare(b.title, "ja"));

  const menuItems: MenuItem[] = [];
  if (homeRecord) {
    menuItems.push({
      title: homeRecord.title || "HOME",
      path: homeRecord.path,
      slug: homeRecord.slug,
      sourceId: homeRecord.id,
    });
  }
  for (const page of menuPages) {
    menuItems.push({
      title: page.title,
      path: page.path,
      slug: page.slug,
      sourceId: page.id,
    });
  }

  const availablePaths = new Set([
    ...pageRecords.map((entry) => entry.path),
    ...postRecords.map((entry) => entry.path),
  ]);
  for (const menuItem of menuItems) {
    if (availablePaths.has(menuItem.path)) {
      continue;
    }
    pageRecords.push({
      id: `placeholder-${trimSlashes(menuItem.path) || "home"}`,
      type: "page",
      title: menuItem.title,
      path: menuItem.path,
      pathDecoded: safeDecodeURI(menuItem.path),
      slug: menuItem.slug,
      slugDecoded: safeDecodeURIComponent(menuItem.slug),
      originalLink: menuItem.path,
      publishedAt: "",
      modifiedAt: "",
      excerpt: "Content will be added later.",
      categories: [],
      tags: [],
      html: "",
      imageCount: 0,
      featuredImage: null,
      hasContent: false,
      template: "placeholder",
    });
  }

  pageRecords.sort((a, b) => a.path.localeCompare(b.path, "ja"));

  return {
    generatedAt: new Date().toISOString(),
    sourceXml: path.relative(ROOT_DIR, SOURCE_XML).replace(/\\/g, "/"),
    site: parsed.site,
    stats: {
      itemsTotal: parsed.items.length,
      pagesPublish: pageRecords.length,
      postsPublish: postRecords.length,
      attachments: attachments.length,
    },
    menu: {
      inferredFrom:
        "wp_navigation(page-list) + published pages (flat). nav_menu_item is not present in this XML.",
      structure: "flat",
      items: menuItems,
    },
    pages: pageRecords,
    posts: postRecords,
    attachments,
  };
}

function writeAnalysisFiles(payload: SiteContent) {
  const pageRows = payload.pages
    .map(
      (page, index) =>
        `| ${index + 1} | page | ${escapePipe(page.title)} | ${escapePipe(page.path)} | ${escapePipe(page.slugDecoded)} | ${page.hasContent ? "Y" : "N"} | ${page.template} |`,
    )
    .join("\n");

  const postRows = payload.posts
    .map(
      (post, index) =>
        `| ${index + 1} | post | ${escapePipe(post.title)} | ${escapePipe(post.path)} | ${escapePipe(post.slugDecoded)} | ${post.hasContent ? "Y" : "N"} | ${post.template} |`,
    )
    .join("\n");

  const menuRows = payload.menu.items
    .map(
      (item, index) =>
        `| ${index + 1} | ${escapePipe(item.title)} | ${escapePipe(item.path)} | ${escapePipe(item.slug)} | ${item.sourceId} |`,
    )
    .join("\n");

  const analysis = `# XML Analysis

## Source
- File: \`${payload.sourceXml}\`
- Site: ${payload.site.title} (${payload.site.link})
- Generated at: ${payload.generatedAt}

## Item Counts
- Total items: ${payload.stats.itemsTotal}
- Published pages: ${payload.stats.pagesPublish}
- Published posts: ${payload.stats.postsPublish}
- Attachments: ${payload.stats.attachments}

## Menu Estimate
- Inference method: ${payload.menu.inferredFrom}
- Structure: flat (all pages are top-level)

| # | Menu Title | Path | Slug | Source ID |
| --- | --- | --- | --- | --- |
${menuRows}

## Page List + Slug List
| # | Type | Title | Path | Decoded Slug | Has Content | Template |
| --- | --- | --- | --- | --- | --- | --- |
${pageRows}

## Post List + Slug List
| # | Type | Title | Path | Decoded Slug | Has Content | Template |
| --- | --- | --- | --- | --- | --- | --- |
${postRows || "| - | - | - | - | - | - | - |"}
`;

  fs.writeFileSync(ANALYSIS_MD, analysis, "utf8");

  const allRoutes = [...payload.pages, ...payload.posts].sort((a, b) =>
    a.path.localeCompare(b.path, "ja"),
  );
  const routeRows = allRoutes
    .map((entry, index) => {
      let component = "ContentPage";
      if (entry.template === "home") {
        component = "HomeLanding";
      } else if (entry.template === "placeholder") {
        component = "ContentPage (Placeholder)";
      } else if (entry.template === "post") {
        component = "ContentPage (Post)";
      }
      const jaPath = entry.path === "/" ? "/ja/" : `/ja${entry.path}`;
      const koPath = entry.path === "/" ? "/ko/" : `/ko${entry.path}`;
      return `| ${index + 1} | ${escapePipe(entry.path)} | ${escapePipe(jaPath)} | ${escapePipe(koPath)} | ${escapePipe(entry.slug)} | ${entry.type} | ${entry.template} | ${component} |`;
    })
    .join("\n");

  const mapping = `# URL Mapping

Routing map that preserves existing slug/path structure.

| # | Existing Path | JA URL | KO URL | Slug | Type | Template | Render Component |
| --- | --- | --- | --- | --- | --- | --- | --- |
${routeRows}
`;

  fs.writeFileSync(URL_MAPPING_MD, mapping, "utf8");
}

function main() {
  const output = buildOutput();
  fs.mkdirSync(path.dirname(OUTPUT_JSON), { recursive: true });
  fs.mkdirSync(path.dirname(ANALYSIS_MD), { recursive: true });
  fs.writeFileSync(OUTPUT_JSON, JSON.stringify(output, null, 2), "utf8");
  writeAnalysisFiles(output);
  console.log(`Generated: ${path.relative(ROOT_DIR, OUTPUT_JSON)}`);
  console.log(`Generated: ${path.relative(ROOT_DIR, ANALYSIS_MD)}`);
  console.log(`Generated: ${path.relative(ROOT_DIR, URL_MAPPING_MD)}`);
}

main();
