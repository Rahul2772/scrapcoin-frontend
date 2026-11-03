export const SITE_URL = "https://scrapco.in";

type PageHeadOptions = {
  path: string;
  title: string;
  description: string;
  /** Keep the page out of search results (account and auth pages). */
  noindex?: boolean;
};

/** Per-page head tags: title, description, canonical and share-card tags.
 *  Meta tags here override the root defaults (deepest route wins); the
 *  canonical link is only ever set here, never in the root route. */
export function pageHead({ path, title, description, noindex }: PageHeadOptions) {
  const url = `${SITE_URL}${path}`;
  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:url", content: url },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      ...(noindex ? [{ name: "robots", content: "noindex, follow" }] : []),
    ],
    links: [{ rel: "canonical", href: url }],
  };
}
