import { handle, HttpError, json } from "@/lib/server/http";

export const revalidate = 86_400;

/** How long the outside lookup may take before the form gives up and asks for the details by hand. */
const TIMEOUT_MS = 5_000;

interface Place {
  /** Town / district used to fill the City field. */
  city: string;
  /** State / province used to fill the State field. */
  state: string;
  district: string;
}

/** India Post PIN directory: https://api.postalpincode.in/pincode/600099 */
async function lookupIndia(pin: string): Promise<Place | null> {
  const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`, {
    next: { revalidate: 86_400 },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) return null;
  const data = (await res.json()) as
    | Array<{ Status?: string; PostOffice?: Array<{ Name?: string; Block?: string; District?: string; Division?: string; Region?: string; State?: string }> }>
    | null;
  const office = Array.isArray(data) ? data[0]?.PostOffice?.[0] : null;
  if (!office) return null;
  const district = office.District?.trim() ?? "";
  // "Chennai Region" → "Chennai": the post office's region is the closest thing to a city name.
  const region = (office.Region ?? "").replace(/\s+region$/i, "").trim();
  return {
    city: region || district || office.Block?.trim() || office.Name?.trim() || "",
    state: office.State?.trim() ?? "",
    district,
  };
}

/** Rest-of-world postal codes: https://api.zippopotam.us/us/90210 */
async function lookupWorld(country: string, pin: string): Promise<Place | null> {
  const res = await fetch(`https://api.zippopotam.us/${country}/${encodeURIComponent(pin)}`, {
    next: { revalidate: 86_400 },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) return null;
  const data = (await res.json()) as
    | { places?: Array<Record<string, string>> }
    | null;
  const place = data?.places?.[0];
  if (!place) return null;
  return { city: place["place name"] ?? "", state: place.state ?? "", district: "" };
}

/**
 * Public: turns a postal code into a city + state for the Distributors / Export enquiry forms
 * (GET /api/locations/pincode?country=IN&pin=600099). India uses India Post; other countries use
 * zippopotam.us. A miss (or an outside service being down) returns { ok: false } — the form then
 * simply asks the visitor to type the city and state.
 */
export const GET = handle(async (req) => {
  const params = new URL(req.url).searchParams;
  const pin = (params.get("pin") ?? "").trim();
  const country = (params.get("country") ?? "IN").trim().toUpperCase();
  if (!/^[A-Za-z0-9][A-Za-z0-9 -]{1,11}$/.test(pin)) throw new HttpError(400, "Enter a valid postal / PIN code.");
  if (!/^[A-Z]{2}$/.test(country)) throw new HttpError(400, "Choose a country first.");

  try {
    const place = country === "IN" && /^\d{6}$/.test(pin) ? await lookupIndia(pin) : await lookupWorld(country, pin);
    return json(place && place.city ? { ok: true, ...place } : { ok: false });
  } catch {
    // The lookup is a convenience — it must never block the enquiry.
    return json({ ok: false });
  }
});
