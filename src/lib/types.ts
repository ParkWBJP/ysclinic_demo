export type TemplateKind = "home" | "procedure" | "page" | "post" | "placeholder";

export type ContentRecord = {
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

export type MenuItem = {
  title: string;
  path: string;
  slug: string;
  sourceId: string;
};

export type AttachmentRecord = {
  id: string;
  title: string;
  slug: string;
  path: string;
  url: string;
  alt: string;
  caption: string;
  description: string;
};

export type SiteContent = {
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
