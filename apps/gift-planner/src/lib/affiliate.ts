/**
 * Rewrites shopping links so outbound clicks can earn referral revenue.
 * Amazon: adds/replaces the `tag` param with AMAZON_ASSOCIATES_TAG. Other hosts pass through.
 */
export function affiliateUrl(url: string): string {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    const isAmazon = host === "amazon.com" || host.endsWith(".amazon.com") || /(^|\.)amazon\.[a-z.]+$/.test(host);
    const tag = process.env.AMAZON_ASSOCIATES_TAG;
    if (isAmazon && tag) {
      parsed.searchParams.set("tag", tag);
    }
    return parsed.toString();
  } catch {
    return url;
  }
}

export function hostLabel(url: string | null): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}
