"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { AssetCategory, Source } from "@/lib/types";
import { CATEGORY_SPECS } from "@/lib/specs";

export type EditState = { error?: string } | null;

/** Trimmed string, or null when the field was left blank. */
function text(form: FormData, key: string): string | null {
  const v = String(form.get(key) ?? "").trim();
  return v === "" ? null : v;
}

/**
 * Sources arrive as parallel arrays from the repeatable form rows. A row with
 * neither a title nor a URL is an empty slot the user never filled in.
 */
function sources(form: FormData): Source[] {
  const titles = form.getAll("source_title").map(String);
  const urls = form.getAll("source_url").map(String);
  const publishers = form.getAll("source_publisher").map(String);
  const retrieved = form.getAll("source_retrieved").map(String);

  return titles
    .map((t, i) => ({
      title: t.trim(),
      url: (urls[i] ?? "").trim(),
      publisher: (publishers[i] ?? "").trim() || undefined,
      retrieved: (retrieved[i] ?? "").trim() || undefined,
    }))
    .filter((s) => s.title !== "" || s.url !== "");
}

/**
 * Mirrors the database triggers so the user gets a readable message instead of
 * a raw Postgres exception. The triggers remain the authority — this is
 * courtesy, not enforcement.
 */
function editorialProblem(f: {
  status?: string | null;
  sources?: Source[];
  region?: string | null;
  summary?: string | null;
}): string | null {
  const real = (f.sources ?? []).filter(
    (s) => s.url && !s.url.trim().toUpperCase().startsWith("TODO"),
  );

  if ((f.status === "verified" || f.status === "reported") && real.length === 0) {
    return `An entry marked "${f.status}" needs at least one real source. Leave it as "unverified" until you have one.`;
  }

  const haystack = `${f.region ?? ""} ${f.summary ?? ""}`;
  if (
    /\b\d{1,5}\s+[A-Za-z][A-Za-z.]*\s*(street|st|road|rd|avenue|ave|drive|dr|lane|ln|boulevard|blvd|way|court|ct)\b/i.test(
      haystack,
    )
  ) {
    return "Street addresses are not allowed. Country or state is as precise as IceTrack goes.";
  }
  if (/-?\d{1,3}\.\d{4,}\s*,\s*-?\d{1,3}\.\d{4,}/.test(haystack)) {
    return "Coordinates are not allowed. Country or state is as precise as IceTrack goes.";
  }
  return null;
}

/** Turn a Postgres error into something a contributor can act on. */
function friendly(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("precise street addresses")) {
    return "Street addresses are not allowed. Country or state is as precise as IceTrack goes.";
  }
  if (m.includes("coordinates are not allowed")) {
    return "Coordinates are not allowed. Country or state is as precise as IceTrack goes.";
  }
  if (m.includes("published_needs_source")) {
    return "A verified or reported entry needs at least one source.";
  }
  if (m.includes("rate limit") || m.includes("too many edits")) {
    return "You have made a lot of edits in the last hour. Take a break and try again shortly.";
  }
  if (m.includes("row-level security") || m.includes("permission denied")) {
    return "Your account is not allowed to make that change.";
  }
  return message;
}


/**
 * Category-specific fields, namespaced `spec_<key>` by the form so they can be
 * told apart from the fields every asset shares. Only the keys that belong to
 * the chosen category are kept, so switching category mid-edit does not carry
 * a yacht's cabins onto a car.
 */
function specFields(form: FormData, category: string): Record<string, string> {
  const allowed = new Set(
    (CATEGORY_SPECS[category as AssetCategory] ?? []).map((f) => f.key),
  );

  const specs: Record<string, string> = {};
  for (const [name, value] of form.entries()) {
    if (!name.startsWith("spec_")) continue;
    const key = name.slice(5);
    if (!allowed.has(key)) continue;
    const v = String(value).trim();
    if (v !== "") specs[key] = v;
  }
  return specs;
}

/**
 * Image fields. The credit object is only built when a licence was chosen:
 * an image whose licence is unknown cannot be attributed, and the accepted
 * licences require attribution.
 */
function imageFields(form: FormData) {
  const url = text(form, "image_url");
  const license = text(form, "image_license");
  const author = text(form, "image_author");
  const sourcePage = text(form, "image_source_page");

  return {
    image_url: url ?? "",
    image_credit: url
      ? {
          url,
          ...(author ? { author } : {}),
          ...(license ? { license } : {}),
          ...(sourcePage ? { sourcePage } : {}),
        }
      : null,
    image_is_representative: form.get("image_is_representative") === "on",
  };
}

/**
 * The gallery arrives as one JSON field. Parsed defensively: it comes from a
 * hidden input anyone can tamper with, so shape, size and every URL are
 * checked here rather than trusted. Returns the clean list or an error.
 */
function galleryField(
  form: FormData,
): { gallery: { url: string; author?: string; license?: string; sourcePage?: string }[] } | { problem: string } {
  const raw = text(form, "gallery");
  if (!raw) return { gallery: [] };

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { problem: "The photo list could not be read. Reload and retry." };
  }
  if (!Array.isArray(parsed) || parsed.length > 10) {
    return { problem: "At most 10 extra photos per entry." };
  }

  const clean: { url: string; author?: string; license?: string; sourcePage?: string }[] = [];
  for (const item of parsed) {
    if (typeof item !== "object" || item === null) continue;
    const it = item as Record<string, unknown>;
    const url = typeof it.url === "string" ? it.url.trim() : "";
    if (!/^https:\/\//i.test(url)) {
      return { problem: "Every extra photo needs a full https:// address." };
    }
    const license = typeof it.license === "string" ? it.license.trim() : "";
    const author = typeof it.author === "string" ? it.author.trim() : "";
    const sourcePage =
      typeof it.sourcePage === "string" ? it.sourcePage.trim() : "";
    if (!license) {
      return { problem: "Choose a licence for every extra photo." };
    }
    if (!["CC0", "Public domain"].includes(license) && !author) {
      return {
        problem: `${license} requires crediting the photographer on every photo.`,
      };
    }
    clean.push({
      url: url.slice(0, 500),
      ...(author ? { author: author.slice(0, 120) } : {}),
      license: license.slice(0, 60),
      ...(sourcePage ? { sourcePage: sourcePage.slice(0, 500) } : {}),
    });
  }
  return { gallery: clean };
}

/** Licences that oblige us to name the photographer. */
function creditProblem(form: FormData): string | null {
  const url = text(form, "image_url");
  if (!url) return null;

  const license = text(form, "image_license");
  if (!license) {
    return "Choose the licence the photo is published under.";
  }
  const needsAuthor = !["CC0", "Public domain"].includes(license);
  if (needsAuthor && !text(form, "image_author")) {
    return `${license} requires crediting the photographer. Add their name.`;
  }
  return null;
}

export async function updateCelebrity(
  slug: string,
  _prev: EditState,
  form: FormData,
): Promise<EditState> {
  const db = await createClient();
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) return { error: "You need to be signed in to edit." };

  const patch = {
    name: text(form, "name"),
    real_name: text(form, "real_name") ?? "",
    category: text(form, "category"),
    nationality: text(form, "nationality") ?? "",
    born_year: text(form, "born_year") ?? "",
    bio: text(form, "bio") ?? "",
    wikipedia: text(form, "wikipedia") ?? "",
    ...imageFields(form),
  };

  if (!patch.name) return { error: "Name is required." };
  if (!patch.category) return { error: "Category is required." };

  const { error } = await db.rpc("edit_celebrity", {
    target_slug: slug,
    patch,
    summary: text(form, "edit_summary"),
  });
  if (error) return { error: friendly(error.message) };

  revalidatePath(`/celebrities/${slug}`);
  revalidatePath("/celebrities");
  revalidatePath("/");
  redirect(`/celebrities/${slug}`);
}

export async function updateAsset(
  slug: string,
  _prev: EditState,
  form: FormData,
): Promise<EditState> {
  const db = await createClient();
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) return { error: "You need to be signed in to edit." };

  const srcs = sources(form);
  const status = text(form, "status");
  const region = text(form, "region");
  const summaryText = text(form, "summary");

  const galleryResult = galleryField(form);
  if ("problem" in galleryResult) return { error: galleryResult.problem };

  const patch = {
    name: text(form, "name"),
    category: text(form, "category"),
    make: text(form, "make") ?? "",
    model: text(form, "model") ?? "",
    year: text(form, "year") ?? "",
    registration: text(form, "registration") ?? "",
    estimated_value_usd: (text(form, "estimated_value_usd") ?? "").replace(
      /[^\d]/g,
      "",
    ),
    acquired_year: text(form, "acquired_year") ?? "",
    status,
    confidence: text(form, "confidence") ?? "",
    region: region ?? "",
    summary: summaryText ?? "",
    sources: srcs,
    specs: specFields(form, text(form, "category") ?? ""),
    gallery: galleryResult.gallery,
    ...imageFields(form),
  };

  if (!patch.name) return { error: "Name is required." };
  if (!patch.category) return { error: "Category is required." };
  if (!status) return { error: "Status is required." };

  const creditIssue = creditProblem(form);
  if (creditIssue) return { error: creditIssue };

  const problem = editorialProblem({
    status,
    sources: srcs,
    region,
    summary: summaryText,
  });
  if (problem) return { error: problem };

  const { error } = await db.rpc("edit_asset", {
    target_slug: slug,
    patch,
    summary: text(form, "edit_summary"),
  });
  if (error) return { error: friendly(error.message) };

  revalidatePath(`/assets/${slug}`);
  revalidatePath("/assets");
  revalidatePath("/");
  redirect(`/assets/${slug}`);
}

export async function createCelebrity(
  _prev: EditState,
  form: FormData,
): Promise<EditState> {
  const db = await createClient();
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) return { error: "You need to be signed in to add an entry." };

  const patch = {
    name: text(form, "name"),
    real_name: text(form, "real_name") ?? "",
    category: text(form, "category"),
    nationality: text(form, "nationality") ?? "",
    born_year: text(form, "born_year") ?? "",
    bio: text(form, "bio") ?? "",
    wikipedia: text(form, "wikipedia") ?? "",
    ...imageFields(form),
  };

  if (!patch.name) return { error: "Name is required." };
  if (!patch.category) return { error: "Category is required." };

  const { data, error } = await db.rpc("create_celebrity", {
    patch,
    summary: text(form, "edit_summary") ?? "Created entry",
  });
  if (error) return { error: friendly(error.message) };

  revalidatePath("/celebrities");
  revalidatePath("/");
  redirect(`/celebrities/${data as string}`);
}

export async function createAsset(
  _prev: EditState,
  form: FormData,
): Promise<EditState> {
  const db = await createClient();
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) return { error: "You need to be signed in to add an entry." };

  const srcs = sources(form);
  const status = text(form, "status") ?? "unverified";
  const region = text(form, "region");
  const summaryText = text(form, "summary");

  const patch = {
    owner_slug: text(form, "owner_slug"),
    name: text(form, "name"),
    category: text(form, "category"),
    make: text(form, "make") ?? "",
    model: text(form, "model") ?? "",
    year: text(form, "year") ?? "",
    registration: text(form, "registration") ?? "",
    estimated_value_usd: (text(form, "estimated_value_usd") ?? "").replace(
      /[^\d]/g,
      "",
    ),
    acquired_year: text(form, "acquired_year") ?? "",
    status,
    confidence: text(form, "confidence") ?? "",
    region: region ?? "",
    summary: summaryText ?? "",
    sources: srcs,
    specs: specFields(form, text(form, "category") ?? ""),
    ...imageFields(form),
  };

  if (!patch.owner_slug) return { error: "Choose who owns this asset." };
  if (!patch.name) return { error: "Name is required." };
  if (!patch.category) return { error: "Category is required." };

  const creditIssue = creditProblem(form);
  if (creditIssue) return { error: creditIssue };

  const problem = editorialProblem({
    status,
    sources: srcs,
    region,
    summary: summaryText,
  });
  if (problem) return { error: problem };

  const { data, error } = await db.rpc("create_asset", {
    patch,
    summary: text(form, "edit_summary") ?? "Created entry",
  });
  if (error) return { error: friendly(error.message) };

  revalidatePath("/assets");
  revalidatePath(`/celebrities/${patch.owner_slug}`);
  revalidatePath("/");
  redirect(`/assets/${data as string}`);
}
