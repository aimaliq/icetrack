import type { AssetCategory } from "./types";

/**
 * Category-specific fields.
 *
 * A jet and a house have almost nothing in common beyond a maker and a year,
 * so each category declares the fields worth recording for it. This is the
 * single source of truth: the edit form builds its inputs from it and the
 * entry page renders from it, so the two cannot drift apart.
 *
 * Values live in the `specs` jsonb column. That keeps a new field — wingspan,
 * hull material — a change to this file rather than a migration, at the cost
 * of the database not enforcing which keys belong to which category. The form
 * is what enforces that.
 */
export type SpecField = {
  key: string;
  label: string;
  /** `number` inputs get numeric keyboards and are formatted with separators. */
  type?: "text" | "number";
  /** Rendered after the value: "12 m", "5,400 nm". */
  unit?: string;
  placeholder?: string;
  hint?: string;
};

export const CATEGORY_SPECS: Record<AssetCategory, SpecField[]> = {
  jet: [
    {
      key: "icao24",
      label: "ICAO hex",
      placeholder: "a835af",
      hint: "The transponder's 24-bit address, six hex characters. Find it by searching the tail number on globe.adsbexchange.com. This is what the flight map needs.",
    },
    { key: "passengers", label: "Passengers", type: "number", placeholder: "14" },
    { key: "range", label: "Range", type: "number", unit: "nm", placeholder: "7500" },
    { key: "cruise_speed", label: "Cruise speed", type: "number", unit: "kt" },
    { key: "engines", label: "Engines", placeholder: "2 × Rolls-Royce BR725" },
    { key: "cabin_crew", label: "Cabin crew", type: "number" },
  ],

  yacht: [
    { key: "length", label: "Length", type: "number", unit: "m", placeholder: "78" },
    { key: "beam", label: "Beam", type: "number", unit: "m" },
    { key: "cabins", label: "Cabins", type: "number", placeholder: "6" },
    { key: "guests", label: "Guests", type: "number", placeholder: "12" },
    { key: "crew", label: "Crew", type: "number" },
    { key: "top_speed", label: "Top speed", type: "number", unit: "kn" },
    { key: "builder", label: "Builder", placeholder: "Feadship" },
  ],

  car: [
    { key: "engine", label: "Engine", placeholder: "8.0 L quad-turbo W16" },
    { key: "power", label: "Power", type: "number", unit: "hp", placeholder: "1001" },
    { key: "top_speed", label: "Top speed", type: "number", unit: "km/h" },
    { key: "zero_to_100", label: "0–100 km/h", type: "number", unit: "s" },
    { key: "production", label: "Units built", type: "number", hint: "How rare it is." },
  ],

  estate: [
    { key: "floor_area", label: "Floor area", type: "number", unit: "m²", placeholder: "1200" },
    { key: "plot_area", label: "Plot", type: "number", unit: "m²" },
    { key: "bedrooms", label: "Bedrooms", type: "number", placeholder: "8" },
    { key: "bathrooms", label: "Bathrooms", type: "number" },
    { key: "built", label: "Built", type: "number", placeholder: "2019" },
    {
      key: "features",
      label: "Features",
      placeholder: "Pool, cinema, guest house",
      hint: "Comma separated. Never anything that identifies where it is.",
    },
  ],

  accessories: [
    { key: "reference", label: "Reference", placeholder: "5711/1A-010" },
    { key: "material", label: "Material", placeholder: "Platinum" },
    { key: "case_size", label: "Case size", type: "number", unit: "mm" },
    { key: "movement", label: "Movement", placeholder: "Calibre 26-330 S C" },
    { key: "stones", label: "Stones", placeholder: "12.4 ct diamonds" },
  ],
};

export type Specs = Record<string, string | number>;

/** The filled-in fields for an asset, in the order the category declares. */
export function readSpecs(
  category: AssetCategory,
  specs: Specs | null | undefined,
): { label: string; value: string }[] {
  if (!specs) return [];

  return CATEGORY_SPECS[category]
    .map((field) => {
      const raw = specs[field.key];
      if (raw === undefined || raw === null || raw === "") return null;

      const value =
        field.type === "number" && !Number.isNaN(Number(raw))
          ? new Intl.NumberFormat("en-US").format(Number(raw))
          : String(raw);

      return { label: field.label, value: field.unit ? `${value} ${field.unit}` : value };
    })
    .filter((x): x is { label: string; value: string } => x !== null);
}
