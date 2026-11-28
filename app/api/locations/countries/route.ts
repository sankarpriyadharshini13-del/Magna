import { Country } from "country-state-city";
import { json } from "@/lib/server/http";

export const revalidate = 86_400;

/**
 * Public: every country for the enquiry forms (GET /api/locations/countries).
 * Served from the bundled country-state-city dataset, so names and ISO codes are consistent
 * with the state / city lists and the picker never waits on an outside service.
 */
export async function GET() {
  const countries = Country.getAllCountries()
    .map((country) => ({ code: country.isoCode, name: country.name }))
    .sort((a, b) => a.name.localeCompare(b.name));
  return json({ countries });
}
