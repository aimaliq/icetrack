"use client";

import { useState } from "react";
import type { Source } from "@/lib/types";

const input =
  "focus-ring w-full rounded-xl bg-elevated px-4 py-2.5 text-[15px] outline-none placeholder:text-faint";

export function Field({
  label,
  name,
  defaultValue,
  hint,
  ...rest
}: {
  label: string;
  name: string;
  defaultValue?: string | number | null;
  hint?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label htmlFor={name} className="text-[13px] font-medium">
        {label}
      </label>
      <input
        id={name}
        name={name}
        defaultValue={defaultValue ?? ""}
        className={`${input} mt-1.5`}
        {...rest}
      />
      {hint && <p className="mt-1 text-[12px] text-faint">{hint}</p>}
    </div>
  );
}

export function TextArea({
  label,
  name,
  defaultValue,
  hint,
  rows = 4,
  maxLength,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  hint?: string;
  rows?: number;
  maxLength?: number;
}) {
  return (
    <div>
      <label htmlFor={name} className="text-[13px] font-medium">
        {label}
      </label>
      <textarea
        id={name}
        name={name}
        rows={rows}
        maxLength={maxLength}
        defaultValue={defaultValue ?? ""}
        className={`${input} mt-1.5 resize-y`}
      />
      {hint && <p className="mt-1 text-[12px] text-faint">{hint}</p>}
    </div>
  );
}

export function Select({
  label,
  name,
  defaultValue,
  options,
  hint,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  options: { value: string; label: string }[];
  hint?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="text-[13px] font-medium">
        {label}
      </label>
      <select
        id={name}
        name={name}
        defaultValue={defaultValue ?? ""}
        className={`${input} mt-1.5`}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {hint && <p className="mt-1 text-[12px] text-faint">{hint}</p>}
    </div>
  );
}

/**
 * Repeatable source rows. Sources are what separate this from a rumour site,
 * so adding one is a first-class action rather than a nested JSON field.
 */
export function SourceEditor({ initial }: { initial: Source[] }) {
  const [rows, setRows] = useState<Source[]>(
    initial.length > 0 ? initial : [{ title: "", url: "" }],
  );

  return (
    <div>
      <p className="text-[13px] font-medium">Sources</p>
      <p className="mt-1 text-[12px] text-faint">
        A dated, linkable source for each claim. An entry marked verified or
        reported needs at least one.
      </p>

      <div className="mt-3 space-y-3">
        {rows.map((s, i) => (
          <div key={i} className="rounded-xl bg-sunken p-3">
            <div className="grid gap-2 sm:grid-cols-2">
              <input
                name="source_title"
                defaultValue={s.title}
                placeholder="Article title"
                className={input}
              />
              <input
                name="source_url"
                defaultValue={s.url}
                placeholder="https://…"
                inputMode="url"
                className={input}
              />
              <input
                name="source_publisher"
                defaultValue={s.publisher ?? ""}
                placeholder="Publisher"
                className={input}
              />
              <input
                name="source_retrieved"
                defaultValue={s.retrieved ?? ""}
                placeholder="Retrieved (YYYY-MM-DD)"
                className={input}
              />
            </div>
            {rows.length > 1 && (
              <button
                type="button"
                onClick={() => setRows(rows.filter((_, j) => j !== i))}
                className="focus-ring mt-2 rounded px-1 text-[12px] text-faint hover:text-ink"
              >
                Remove
              </button>
            )}
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setRows([...rows, { title: "", url: "" }])}
        className="focus-ring mt-3 rounded-full border border-line px-4 py-2
                   text-[13px] transition hover:bg-sunken"
      >
        Add a source
      </button>
    </div>
  );
}

/** Summary + submit. Every wiki edit says why it happened. */
export function EditFooter({
  pending,
  error,
  cancelHref,
}: {
  pending: boolean;
  error?: string;
  cancelHref: string;
}) {
  return (
    <div className="space-y-4 border-t border-line pt-6">
      <div>
        <label htmlFor="edit_summary" className="text-[13px] font-medium">
          Edit summary
        </label>
        <input
          id="edit_summary"
          name="edit_summary"
          maxLength={300}
          required
          placeholder="Added the FAA registration and a 2026 source"
          className={`${input} mt-1.5`}
        />
        <p className="mt-1 text-[12px] text-faint">
          Shown publicly in this entry&apos;s history. Say what you changed and
          where the information came from.
        </p>
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-xl bg-amber-500/10 px-4 py-3 text-[13px] text-amber-700
                     dark:text-amber-300"
        >
          {error}
        </p>
      )}

      <div className="flex flex-col gap-3 sm:flex-row-reverse">
        <button
          type="submit"
          disabled={pending}
          className="focus-ring rounded-full bg-ink px-6 py-3 text-[15px] font-medium
                     text-surface transition hover:opacity-90 disabled:opacity-50
                     sm:py-2.5 sm:text-[14px]"
        >
          {pending ? "Saving…" : "Publish changes"}
        </button>
        <a
          href={cancelHref}
          className="focus-ring rounded-full border border-line px-6 py-3 text-center
                     text-[15px] transition hover:bg-sunken sm:py-2.5 sm:text-[14px]"
        >
          Cancel
        </a>
      </div>
    </div>
  );
}
