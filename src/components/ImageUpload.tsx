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
 * Photo for an entry: uploaded from the device, or linked from elsewhere.
 *
 * Linking suits Wikimedia Commons, where the file is already hosted under a
 * licence that permits it and hotlinking is expected. Uploading suits
 * everything else.
 *
 * Author and licence are collected either way. The licences this project
 * accepts oblige us to credit the photographer, so an image whose author is
 * unknown cannot be published.
 */
export function ImageUpload({
  currentUrl,
  currentCredit,
}: {
  currentUrl?: string;
  currentCredit?: Credit | null;
}) {
  const [url, setUrl] = useState(currentUrl ?? "");
  const [author, setAuthor] = useState(currentCredit?.author ?? "");
  const [license, setLicense] = useState(currentCredit?.license ?? "");
  const [sourcePage, setSourcePage] = useState(currentCredit?.sourcePage ?? "");
  const [linkDraft, setLinkDraft] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function upload(file: File) {
    setError(null);
    setPendingFile(file);

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
        const m = uploadError.message.toLowerCase();
        setError(
          m.includes("row-level security")
            ? "You need to be signed in to upload an image."
            : m.includes("bucket not found")
              ? "Image storage is not set up yet. Tell an administrator."
              : uploadError.message,
        );
        return;
      }

      const { data } = db.storage.from("asset-images").getPublicUrl(path);
      setUrl(data.publicUrl);
      setPendingFile(null);
    } catch {
      setError("The upload failed. Check your connection and try again.");
    } finally {
      setUploading(false);
    }
  }

  function useLink() {
    const trimmed = linkDraft.trim();
    if (!trimmed) return;
    if (!/^https:\/\//i.test(trimmed)) {
      setError("Paste a full https:// address.");
      return;
    }
    setError(null);
    setUrl(trimmed);
    setLinkDraft("");
  }

  const needsCredit =
    url !== "" && license !== "" && license !== "CC0" && license !== "Public domain";

  return (
    <div className="space-y-3">
      <p className="text-[13px] font-medium">Photo</p>

      {url ? (
        <div className="flex items-center gap-3 rounded-xl bg-sunken p-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt=""
            className="h-20 w-28 shrink-0 rounded-lg bg-elevated object-contain"
          />
          <button
            type="button"
            onClick={() => {
              setUrl("");
              if (fileRef.current) fileRef.current.value = "";
            }}
            className="focus-ring rounded-full border border-line px-4 py-1.5 text-[13px]
                       transition-colors duration-150 ease-out-strong hover:bg-sunken"
          >
            Replace
          </button>
        </div>
      ) : (
        <div className="space-y-3">
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

          {uploading && <p className="text-[12px] text-faint">Uploading…</p>}

          {pendingFile && !uploading && (
            <button
              type="button"
              onClick={() => void upload(pendingFile)}
              className="focus-ring rounded-full border border-line px-4 py-1.5 text-[13px]
                         transition-colors duration-150 ease-out-strong hover:bg-sunken"
            >
              Try uploading again
            </button>
          )}

          <div className="flex items-center gap-3">
            <span className="h-px flex-1 bg-line" />
            <span className="text-[12px] text-faint">or paste a link</span>
            <span className="h-px flex-1 bg-line" />
          </div>

          <div className="flex gap-2">
            <input
              value={linkDraft}
              onChange={(e) => setLinkDraft(e.target.value)}
              onKeyDown={(e) => {
                // Enter inside a form would submit it; use it for the link.
                if (e.key === "Enter") {
                  e.preventDefault();
                  useLink();
                }
              }}
              placeholder="https://upload.wikimedia.org/…"
              inputMode="url"
              className={input}
            />
            <button
              type="button"
              onClick={useLink}
              className="focus-ring shrink-0 rounded-xl border border-line px-4 text-[14px]
                         transition-colors duration-150 ease-out-strong hover:bg-sunken"
            >
              Use
            </button>
          </div>
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

      {/* Submitted with the form; set by the upload or the link above. */}
      <input type="hidden" name="image_url" value={url} />

      {url && (
        <div className="space-y-3 rounded-xl bg-sunken p-3">
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
            placeholder={needsCredit ? "Photographer (required)" : "Photographer"}
            className={input}
          />

          <input
            name="image_source_page"
            value={sourcePage}
            onChange={(e) => setSourcePage(e.target.value)}
            placeholder="Source page (optional)"
            inputMode="url"
            className={input}
          />
        </div>
      )}
    </div>
  );
}
