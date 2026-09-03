"use client";

import { CATEGORY_SPECS, type Specs } from "@/lib/specs";
import { CATEGORY_META } from "@/lib/categories";
import type { AssetCategory } from "@/lib/types";

const input =
  "focus-ring mt-1.5 w-full rounded-xl bg-elevated px-4 py-2.5 text-[15px] outline-none placeholder:text-faint";

/**
 * The fields that belong to one category, and only that one.
 *
 * Which fields appear follows the category selected above, so switching from
 * Jet to Yacht swaps passengers and range for cabins and length. Values are
 * namespaced `spec_<key>` in the form data, which is how the action tells them
 * apart from the fields every asset shares.
 */
export function SpecFields({
  category,
  current,
}: {
  category: AssetCategory;
  current?: Specs;
}) {
  const fields = CATEGORY_SPECS[category];
  if (fields.length === 0) return null;

  return (
    <div className="rounded-2xl bg-sunken p-4">
      <p className="text-[13px] font-medium">
        {CATEGORY_META[category].label} details
      </p>
      <p className="mt-1 text-[12px] text-faint">
        Optional. Fill in what you can source — these show on the entry.
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {fields.map((f) => (
          <div key={f.key}>
            <label htmlFor={`spec_${f.key}`} className="text-[13px] font-medium">
              {f.label}
              {f.unit && (
                <span className="ml-1 font-normal text-faint">({f.unit})</span>
              )}
            </label>
            <input
              id={`spec_${f.key}`}
              name={`spec_${f.key}`}
              defaultValue={current?.[f.key] ?? ""}
              inputMode={f.type === "number" ? "numeric" : undefined}
              placeholder={f.placeholder}
              className={input}
            />
            {f.hint && <p className="mt-1 text-[12px] text-faint">{f.hint}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
