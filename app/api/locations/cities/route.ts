import { City, Country, State } from "country-state-city";
import { handle, HttpError, json } from "@/lib/server/http";

export const dynamic = "force-dynamic";

const normal = (value: string) => value.trim().toLowerCase();

/**
 * Public: cities for a country + state
 * (GET /api/locations/cities?country=India&code=IN&state=Tamil Nadu&stateCode=TN).
 * Uses the bundled country-state-city dataset — every city in the state, spelled consistently.
 */
export const GET = handle(async (req) => {
  const params = new URL(req.url).searchParams;
  const name = (params.get("country") ?? "").trim();
  const code = (params.get("code") ?? "").trim().toUpperCase();
  const stateName = (params.get("state") ?? "").trim();
  const stateCode = (params.get("stateCode") ?? "").trim().toUpperCase();
  if ((!name && !code) || name.length > 80) throw new HttpError(400, "Choose a country first.");
  if ((!stateName && !stateCode) || stateName.length > 80) throw new HttpError(400, "Enter a state first.");

  const country = code
    ? Country.getCountryByCode(code)
    : Country.getAllCountries().find((entry) => normal(entry.name) === normal(name));
  if (!country) return json({ cities: [] });

  const states = State.getStatesOfCountry(country.isoCode);
  const state = stateCode
    ? states.find((entry) => entry.isoCode === stateCode)
    : states.find((entry) => normal(entry.name) === normal(stateName));
  if (!state) return json({ cities: [] });

  const cities = Array.from(
    new Set(
      City.getCitiesOfState(country.isoCode, state.isoCode)
        .map((city) => city.name.trim())
        .filter(Boolean),
    ),
  ).sort((a, b) => a.localeCompare(b));
  return json({ cities, state: state.name });
});
