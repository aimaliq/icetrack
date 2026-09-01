"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const LICENCES = [
  { value: "", label: "Choose a licence" },
  { value: "CC0", label: "CC0 — public domain dedication" },
  { value: "Public domain", label: "Public domain" },
  { value: "CC BY 4.0", label: "CC BY — credit required" },
  { value: "CC BY-SA 4.0", label: "CC BY-SA — credit, share alike" },
  { value: "CC BY 3.0", label: "CC BY 3.0" },
  { value: "CC BY-SA 3.0", label: "CC BY-SA 3.0" },
  { value: "CC BY 2.0", label: "CC BY 2.0" },
  { value: "CC BY-SA 2.0", label: "CC BY-SA 2.0" },
];

const MAX_BYTES = 5 * 1024 * 1024;

const input =
  "focus-ring w-full rounded-xl bg-elevated px-4 py-2.5 text-[15px] outline-none placeholder:text-faint";

type Credit = {
  url?: string;
  author?: string;
  license?: string;
  sourcePage?: string;
};

/**
 * Photo for an entry, uploaded to Supabase Storage.
 *
 * Author and licence are required alongside the file. The licences this
 * project accepts oblige us to credit the photographer, so an image whose
 * author is unknown cannot be published — collecting that at upload time is
 * the only point where the person who has the information is present.
 */
export function ImageUpload({
  currentUrl,
  currentCredit,
  currentIsRepresentative,
}: {
  currentUrl?: string;
  currentCredit?: Credit | null;
  currentIsRepresentative?: boolean;
}) {
  const [url, setUrl] = useState(currentUrl ?? "");
  const [author, setAuthor] = useState(currentCredit?.author ?? "");
  const [license, setLicense] = useState(currentCredit?.license ?? "");
  const [sourcePage, setSourcePage] = useState(currentCredit?.sourcePage ?? "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function upload(file: File) {
    setError(null);

    if (file.size > MAX_BYTES) {
      setError("That file is over 5 MB. Try a smaller version.");
      return;
    }

    setUploading(true);
    try {
      const db = createClient();
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
      // Random name: two people uploading "photo.jpg" must not collide, and
      // the original filename can carry a person's name.
      const path = `${crypto.randomUUID()}.${ext}`;

      const { error: uploadError } = await db.storage
        .from("asset-images")
        .upload(path, file, { cacheControl: "31536000", upsert: false });

      if (uploadError) {
        setError(
          uploadError.message.toLowerCase().includes("row-level security")
            ? "You need to be signed in to upload an image."
            : uploadError.message,
        );
        return;
      }

      const { data } = db.storage.from("asset-images").getPublicUrl(path);
      setUrl(data.publicUrl);
    } catch {
      setError("The upload failed. Check your connection and try again.");
    } finally {
      setUploading(false);
    }
  }

  const needsCredit = url !== "" && license !== "" && license !== "CC0" &&
    license !== "Public domain";

  return (
    <div className="space-y-3">
      <p className="text-[13px] font-medium">Photo</p>

      {url ? (
        <div className="flex items-start gap-3 rounded-xl bg-sunken p-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt=""
            className="h-20 w-28 shrink-0 rounded-lg object-cover"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] text-muted">{url}</p>
            <button
              type="button"
              onClick={() => {
                setUrl("");
                if (fileRef.current) fileRef.current.value = "";
              }}
              className="focus-ring mt-1 rounded px-1 text-[13px] text-faint
                         transition-colors duration-150 ease-out-strong hover:text-ink"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <div>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            disabled={uploading}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void upload(file);
            }}
            className="focus-ring w-full rounded-xl bg-elevated px-4 py-2.5 text-[14px]
                       file:mr-3 file:rounded-full file:border-0 file:bg-ink
                       file:px-4 file:py-1.5 file:text-[13px] file:font-medium
                       file:text-surface"
          />
          <p className="mt-1.5 text-[12px] text-faint">
            {uploading ? "Uploading…" : "JPEG, PNG, WebP or AVIF. Up to 5 MB."}
          </p>
        </div>
      )}

      {error && (
        <p
          role="alert"
          className="rounded-xl bg-amber-500/10 px-4 py-2.5 text-[13px] text-amber-700
                     dark:text-amber-300"
        >
          {error}
        </p>
      )}

      {/* Submitted with the form; set by the upload above. */}
      <input type="hidden" name="image_url" value={url} />

      {url && (
        <div className="space-y-3 rounded-xl bg-sunken p-3">
          <p className="text-[13px] font-medium">Where this photo came from</p>
          <p className="text-[12px] leading-relaxed text-faint">
            Only upload photos you are allowed to republish: your own, public
            domain, or Creative Commons. Never a press or agency photo. If the
            licence asks for credit, the photographer&apos;s name is required.
          </p>

          <select
            name="image_license"
            value={license}
            onChange={(e) => setLicense(e.target.value)}
            required
            className={input}
          >
            {LICENCES.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>

          <input
            name="image_author"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            required={needsCredit}
            placeholder={
              needsCredit ? "Photographer (required)" : "Photographer"
            }
            className={input}
          />

          <input
            name="image_source_page"
            value={sourcePage}
            onChange={(e) => setSourcePage(e.target.value)}
            placeholder="Page you found it on (optional)"
            inputMode="url"
            className={input}
          />

          <label className="flex items-start gap-2.5 text-[13px] text-muted">
            <input
              type="checkbox"
              name="image_is_representative"
              value="on"
              defaultChecked={currentIsRepresentative}
              className="mt-0.5"
            />
            <span>
              This shows the model in general, not the exact item owned. The
              entry will say so.
            </span>
          </label>
        </div>
      )}
    </div>
  );
}
