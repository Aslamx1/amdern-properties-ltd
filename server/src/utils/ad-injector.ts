export type FeedItem<T, A> =
  | { type: "item"; data: T }
  | { type: "ad"; data: A };

/**
 * Injects an active ad placement after every Nth (default: 5) item in a search result array.
 * If multiple ads are provided, it cycles through them in round-robin order.
 */
export function injectInFeedAds<T, A>(
  items: T[],
  ads: A[],
  interval: number = 5
): FeedItem<T, A>[] {
  if (!items || items.length === 0) return [];
  if (!ads || ads.length === 0) {
    return items.map((data) => ({ type: "item", data }));
  }

  const result: FeedItem<T, A>[] = [];
  let adIndex = 0;

  for (let i = 0; i < items.length; i++) {
    result.push({ type: "item", data: items[i] });

    // After every interval items (e.g. 5th, 10th, 15th...), insert an ad
    if ((i + 1) % interval === 0) {
      const ad = ads[adIndex % ads.length];
      result.push({ type: "ad", data: ad });
      adIndex++;
    }
  }

  return result;
}
