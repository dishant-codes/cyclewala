/* The header search and the Shop section live far apart in the tree, so they talk through one window
   event: the header says "show the shop filtered to this" (and optionally "open this cycle"), the
   Shop listens, applies it and the page scrolls down to it. */
import { scrollToHash } from "@/lib/lenis";

export const SHOP_SEARCH_EVENT = "cw:shop-search";

export type ShopSearchDetail = {
  /** text for the shop's own search filter */
  query: string;
  /** open this cycle's popup once the list is ready */
  openSlug?: string;
};

export function requestShopSearch(detail: ShopSearchDetail) {
  window.dispatchEvent(new CustomEvent<ShopSearchDetail>(SHOP_SEARCH_EVENT, { detail }));
  scrollToHash("#shop");
}
