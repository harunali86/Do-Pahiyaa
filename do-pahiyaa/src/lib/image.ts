export const defaultBlurDataURL =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 800'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop stop-color='%230f172a' offset='0'/%3E%3Cstop stop-color='%231e293b' offset='1'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='1200' height='800' fill='url(%23g)'/%3E%3C/svg%3E";

export const imageSizes = {
  hero: "100vw",
  homeCategoryWide: "(min-width: 1280px) 42vw, (min-width: 768px) 50vw, 100vw",
  homeCategoryTile: "(min-width: 1280px) 20vw, (min-width: 768px) 25vw, 100vw",
  listingCard:
    "(min-width: 1280px) 30vw, (min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw",
  auctionCard:
    "(min-width: 1280px) 30vw, (min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw",
  auctionRoom: "(min-width: 1280px) 70vw, (min-width: 1024px) 66vw, 100vw",
  galleryMain: "(min-width: 1280px) 66vw, 100vw",
  galleryThumb:
    "(min-width: 1280px) 16vw, (min-width: 1024px) 18vw, (min-width: 768px) 25vw, 33vw"
} as const;

export const imageQuality = {
  hero: 82,
  homeCategory: 68,
  listingCard: 70,
  auctionCard: 70,
  auctionRoom: 78,
  galleryMain: 78,
  galleryThumb: 50
} as const;
