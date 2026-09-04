"use client";

import { useRef, useState } from "react";
import { X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { LICENCES, licenceNeedsAuthor } from "@/components/ImageUpload";
import type { GalleryImage } from "@/lib/types";

const MAX_BYTES = 5 * 1024 * 1024;
const MAX_PHOTOS = 10;

const input =
  "focus-ring w-full rounded-xl bg-elevated px-4 py-2.5 text-[14px] outline-none placeholder:text-faint";

/**
 * Extra photos on an entry, each with its own credit.
 *
 * The whole list rides in one hidden input as JSON: the server treats the
 * gallery as a single field, which is also how the revision history should
 * read — "changed the gallery", not ten separate edits.
 */
export function GalleryUpload({ initial }: { initial?: GalleryImage[] }) {
  const [items, setItems] = useState<GalleryImage[]>(initial ?? []);
  const [uploading, setUploading] = useState(false);
  const [linkDraft, setLinkDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function patch(i: number, changes: Partial<GalleryImage>) {
    setItems((list) =>
      list.map((it, j) => (j === i ? { ...it, ...changes } : it)),
    );
  }

  function add(url: string) {
    if (items.length >= MAX_PHOTOS) {
      setError(`At most ${MAX_PHOTOS} extra photos per entry.`);
      return;
    }
    setError(null);
    setItems((list) => [...list, { url }]);
  }

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
      // Random name: collisions and personal names in filenames both go away.
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
      add(db.storage.from("asset-images").getPublicUrl(path).data.publicUrl);
      if (fileRef.current) fileRef.current.value = "";
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
    add(trimmed);
    setLinkDraft("");
  }

  return (
    <div className="space-y-3">
      <p className="text-[13px] font-medium">
        More photos{" "}
        <span className="font-normal text-faint">
          — shown as a carousel after the main one
        </span>
      </p>

      {items.map((it, i) => (
        <div key={it.url} className="space-y-2.5 rounded-xl bg-sunken p-3">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={it.url}
              alt=""
              className="h-16 w-24 shrink-0 rounded-lg bg-elevated object-contain"
            />
            <button
              type="button"
              onClick={() => setItems((l) => l.filter((_, j) => j !== i))}
              aria-label="Remove this photo"
              className="focus-ring ml-auto grid h-8 w-8 place-items-center rounded-full
                         text-faint transition-colors duration-150 ease-out-strong
                         hover:bg-elevated hover:text-ink"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          </div>

          <select
            value={it.license ?? ""}
            onChange={(e) => patch(i, { license: e.target.value })}
            className={input}
          >
            {LICENCES.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>
          <input
            value={it.author ?? ""}
            onChange={(e) => patch(i, { author: e.target.value })}
            placeholder={
              licenceNeedsAuthor(it.license ?? "")
                ? "Photographer (required)"
                : "Photographer"
            }
            className={input}
          />
          <input
            value={it.sourcePage ?? ""}
            onChange={(e) => patch(i, { sourcePage: e.target.value })}
            placeholder="Source page (optional)"
            inputMode="url"
            className={input}
          />
        </div>
      ))}

      {items.length < MAX_PHOTOS && (
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

          <div className="flex gap-2">
            <input
              value={linkDraft}
              onChange={(e) => setLinkDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  useLink();
                }
              }}
              placeholder="or paste a photo link: https://…"
              inputMode="url"
              className={input}
            />
            <button
              type="button"
              onClick={useLink}
              className="focus-ring shrink-0 rounded-xl border border-line px-4 text-[14px]
                         transition-colors duration-150 ease-out-strong hover:bg-sunken"
            >
              Add
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

      <input type="hidden" name="gallery" value={JSON.stringify(items)} />
    </div>
  );
}
