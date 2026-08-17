export const ALLOWED_SHIPPING_COUNTRIES = ["CH", "FR", "DE", "IT", "AT"] as const;
export type ShippingCountry = (typeof ALLOWED_SHIPPING_COUNTRIES)[number];

export const COUNTRY_LABELS: Record<ShippingCountry, string> = {
  CH: "Switzerland",
  FR: "France",
  DE: "Germany",
  IT: "Italy",
  AT: "Austria",
};

// Geneva, Switzerland — every delivery price is calculated as a straight-line
// (haversine) distance from here.
const GENEVA = { lat: 46.2044, lng: 6.1432 };

interface DistanceBand {
  maxKm: number;
  amountCHF: number;
}

// Flat, distance-tiered pricing. Adjust freely — these are reasonable
// starting numbers for parcel shipping out of Switzerland.
const BANDS: DistanceBand[] = [
  { maxKm: 60, amountCHF: 6 },
  { maxKm: 150, amountCHF: 9 },
  { maxKm: 350, amountCHF: 13 },
  { maxKm: 700, amountCHF: 18 },
  { maxKm: Infinity, amountCHF: 24 },
];

// Used only if the postal code can't be geocoded — keeps checkout working
// even if the lookup service is briefly unavailable.
const COUNTRY_FALLBACK_CHF: Record<ShippingCountry, number> = {
  CH: 7,
  FR: 15,
  DE: 16,
  IT: 19,
  AT: 15,
};

function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}

function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371; // Earth radius in km
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(h));
}

/**
 * Postal-code geocoding via Zippopotam.us — free, no API key, good enough
 * precision for a shipping estimate (city/postal-code level, not street
 * level). Swap this for Google/Mapbox geocoding later if you need tighter
 * accuracy; the rest of this file doesn't need to change.
 */
async function geocodePostalCode(
  country: ShippingCountry,
  postalCode: string
): Promise<{ lat: number; lng: number } | null> {
  try {
    const res = await fetch(
      `https://api.zippopotam.us/${country}/${encodeURIComponent(postalCode.trim())}`,
      { next: { revalidate: 60 * 60 * 24 } }
    );
    if (!res.ok) return null;
    const json = await res.json();
    const place = json.places?.[0];
    if (!place) return null;
    return { lat: parseFloat(place.latitude), lng: parseFloat(place.longitude) };
  } catch {
    return null;
  }
}

function priceForDistance(distanceKm: number): number {
  return BANDS.find((band) => distanceKm <= band.maxKm)!.amountCHF;
}

export interface ShippingEstimate {
  amountCHF: number;
  distanceKm: number | null;
  estimated: boolean; // false when we fell back to the flat country rate
}

export async function calculateShipping(
  country: ShippingCountry,
  postalCode: string
): Promise<ShippingEstimate> {
  const destination = await geocodePostalCode(country, postalCode);

  if (!destination) {
    return { amountCHF: COUNTRY_FALLBACK_CHF[country], distanceKm: null, estimated: false };
  }

  const distanceKm = Math.round(haversineKm(GENEVA, destination));
  return { amountCHF: priceForDistance(distanceKm), distanceKm, estimated: true };
}
