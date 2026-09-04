"use client";

import { useActionState, useState } from "react";
import { updateAsset, type EditState } from "@/lib/edit/actions";
import { CATEGORY_META, CATEGORY_ORDER } from "@/lib/categories";
import {
  Field,
  TextArea,
  Select,
  SourceEditor,
  EditFooter,
} from "@/components/EditFields";
import { ImageUpload } from "@/components/ImageUpload";
import { GalleryUpload } from "@/components/GalleryUpload";
import { SpecFields } from "@/components/SpecFields";
import { REGISTRATION_HELP } from "@/lib/specs";
import type { Asset, AssetCategory } from "@/lib/types";

const STATUSES = [
  { value: "unverified", label: "Unverified — not yet sourced" },
  { value: "reported", label: "Reported — credible press" },
  { value: "verified", label: "Verified — registry or primary source" },
  { value: "former", label: "Former — since sold" },
  { value: "disputed", label: "Disputed — sources conflict" },
];

export function AssetForm({ asset }: { asset: Asset }) {
  const action = updateAsset.bind(null, asset.id);
  const [state, formAction, pending] = useActionState<EditState, FormData>(
    action,
    null,
  );
  // Tracked so the category-specific fields swap as soon as the select changes.
  const [category, setCategory] = useState<AssetCategory>(asset.category);

  return (
    <form action={formAction} className="space-y-5">
      <Field label="Name" name="name" defaultValue={asset.name} required maxLength={120} />

      <Select
        label="Category"
        name="category"
        defaultValue={asset.category}
        onChange={(v) => setCategory(v as AssetCategory)}
        options={CATEGORY_ORDER.map((c) => ({
          value: c,
          label: CATEGORY_META[c].label,
        }))}
      />

      <SpecFields category={category} current={asset.specs} />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Make" name="make" defaultValue={asset.make} maxLength={80} />
        <Field label="Model" name="model" defaultValue={asset.model} maxLength={80} />
        <Field
          label="Year"
          name="year"
          defaultValue={asset.year}
          inputMode="numeric"
        />
        <Field
          label="Acquired"
          name="acquired_year"
          defaultValue={asset.acquiredYear}
          inputMode="numeric"
        />
      </div>

      <Field
        label="Registration"
        name="registration"
        defaultValue={asset.registration}
        maxLength={40}
        placeholder={REGISTRATION_HELP[category].placeholder}
        hint={REGISTRATION_HELP[category].hint}
      />

      <Field
        label="Estimated value (USD)"
        name="estimated_value_usd"
        defaultValue={asset.estimatedValueUsd}
        inputMode="numeric"
        placeholder="185000000"
        hint="A press estimate, not an appraisal. Leave blank if unknown."
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <Select
          label="Status"
          name="status"
          defaultValue={asset.status}
          options={STATUSES}
        />
        <Select
          label="Confidence"
          name="confidence"
          defaultValue={asset.confidence ?? ""}
          options={[
            { value: "", label: "—" },
            { value: "high", label: "High" },
            { value: "medium", label: "Medium" },
            { value: "low", label: "Low" },
          ]}
        />
      </div>

      <Field
        label="Region"
        name="region"
        defaultValue={asset.region}
        maxLength={80}
        hint="Country or state only. Never an address, mooring, hangar or coordinates."
      />

      <TextArea
        label="Summary"
        name="summary"
        defaultValue={asset.summary}
        maxLength={600}
      />

      <ImageUpload
        currentUrl={asset.imageUrl}
        currentCredit={asset.imageCredit}
      />

      <GalleryUpload initial={asset.gallery} />

      <SourceEditor initial={asset.sources} />

      <EditFooter
        pending={pending}
        error={state?.error}
        cancelHref={`/assets/${asset.id}`}
      />
    </form>
  );
}
