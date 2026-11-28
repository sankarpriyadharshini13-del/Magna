import { Country, State } from "country-state-city";
import { handle, HttpError, json } from "@/lib/server/http";

export const dynamic = "force-dynamic";

const normal = (value: string) => value.trim().toLowerCase();

/**
 * Public: states / provinces for a country (GET /api/locations/states?country=India&code=IN).
 * Uses the bundled country-state-city dataset, so the list is complete and works offline.
 */
export const GET = handle(async (req) => {
  const params = new URL(req.url).searchParams;
  const name = (params.get("country") ?? "").trim();
  const code = (params.get("code") ?? "").trim().toUpperCase();
  if ((!name && !code) || name.length > 80) throw new HttpError(400, "Choose a country first.");

  const country = code
    ? Country.getCountryByCode(code)
    : Country.getAllCountries().find((entry) => normal(entry.name) === normal(name));
  if (!country) return json({ states: [] });

  const states = State.getStatesOfCountry(country.isoCode)
    .map((state) => state.name)
    .sort((a, b) => a.localeCompare(b));
  return json({ states, country: country.name, code: country.isoCode });
});
