"use client";

import { useEffect, useState } from "react";
import { COUNTRIES, DEFAULT_COUNTRY_CODE, type Country } from "@/data/countries";
import Combobox from "./Combobox";

export type { Country };
export { DEFAULT_COUNTRY_CODE };

/**
 * Country field for the Distributor / Export enquiry forms.
 * Typing filters the full ISO 3166-1 list; picking a suggestion keeps its code so the PIN,
 * state and city lookups know which country to ask about. Free text still works.
 */
export default function CountrySelect({
  id,
  value,
  onChange,
  invalid = false,
}: {
  id: string;
  value: Country;
  onChange: (country: Country) => void;
  invalid?: boolean;
}) {
  const [countries, setCountries] = useState<Country[]>(COUNTRIES);

  useEffect(() => {
    let live = true;
    fetch("/api/locations/countries")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { countries?: Country[] } | null) => {
        if (!live || !Array.isArray(data?.countries) || data.countries.length === 0) return;
        setCountries(data.countries);
      })
      .catch(() => {
        // The bundled list is already showing — nothing to do.
      });
    return () => {
      live = false;
    };
  }, []);

  return (
    <Combobox
      id={id}
      value={value.name}
      options={countries.map((country) => country.name)}
      placeholder="Start typing a country"
      autoComplete="country-name"
      invalid={invalid}
      onChange={(text) => {
        const match = countries.find((country) => country.name.toLowerCase() === text.trim().toLowerCase());
        onChange(match ?? { code: "", name: text });
      }}
    />
  );
}
