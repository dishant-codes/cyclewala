/* THE SHOP FLOOR — real customer photos from Cycle Wala.
 *
 * Real photography, supplied by the shop (public/images/gallery/shop-*.png).
 * `ar` is each file's true aspect ratio, so a frame is only ever cropped by
 * object-fit, never scaled non-uniformly. `scale`/`y` are curation — a
 * little rhythm so the rail reads as a hung archive rather than a filmstrip. */

export type Frame = {
  id: string;
  src: string;
  ar: number;
  scale: number;
  y: number;
  hero?: boolean;
};

export const FRAMES: Frame[] = [
  { id: "shop-1", src: "/images/gallery/shop-1.png", ar: 1080 / 1319, scale: 0.94, y: -18 },
  { id: "shop-2", src: "/images/gallery/shop-2.png", ar: 1080 / 1339, scale: 0.88, y: 30 },
  { id: "shop-3", src: "/images/gallery/shop-3.png", ar: 1080 / 1328, scale: 1.0, y: -34 },
  { id: "shop-4", src: "/images/gallery/shop-4.png", ar: 1080 / 1310, scale: 0.86, y: 22 },
  { id: "shop-5", src: "/images/gallery/shop-5.png", ar: 1080 / 1328, scale: 0.97, y: -10 },
  { id: "shop-6", src: "/images/gallery/shop-6.png", ar: 1080 / 1333, scale: 1.14, y: 0, hero: true },
  { id: "shop-7", src: "/images/gallery/shop-7.png", ar: 1080 / 1328, scale: 1.14, y: 0, hero: true },
  { id: "shop-8", src: "/images/gallery/shop-8.png", ar: 1080 / 1313, scale: 0.92, y: -30 },
  { id: "shop-9", src: "/images/gallery/shop-9.png", ar: 1080 / 1334, scale: 0.87, y: 26 },
  { id: "shop-10", src: "/images/gallery/shop-10.png", ar: 1080 / 1049, scale: 1.0, y: -14 },
];
