"use client";

import { useActionState, useState } from "react";
import { createAsset, type EditState } from "@/lib/edit/actions";
import { CATEGORY_META, CATEGORY_ORDER } from "@/lib/categories";
import {
  Field,
  TextArea,
  Select,
  SourceEditor,
  EditFooter,
} from "@/components/EditFields";
import { ImageUpload } from "@/components/ImageUpload";
import { SpecFields } from "@/components/SpecFields";
import type { AssetCategory } from "@/lib/types";

const STATUSES = [
  { value: "unverified", label: "Unverified — not yet sourced" },
  { value: "reported", label: "Reported — credible press" },
  { value: "verified", label: "Verified — registry or primary source" },
  { value: "former", label: "Former — since sold" },
  { value: "disputed", label: "Disputed — sources conflict" },
];

export function NewAssetForm({
  owners,
  defaultOwner,
}: {
  owners: { slug: string; name: string }[];
  defaultOwner?: string;
}) {
  const [state, formAction, pending] = useActionState<EditState, FormData>(
    createAsset,
    null,
  );
  const [category, setCategory] = useState<AssetCategory>(CATEGORY_ORDER[0]);

  return (
    <form action={formAction} className="space-y-5">
      <Select
        label="Owner"
        name="owner_slug"
        defaultValue={defaultOwner}
        options={owners.map((o) => ({ value: o.slug, label: o.name }))}
        hint="Not listed? Add the person first, then come back."
      />

      <Field
        label="Name"
        name="name"
        required
        maxLength={120}
        placeholder="Gulfstream G650"
      />

      <Select
        label="Category"
        name="category"
        onChange={(v) => setCategory(v as AssetCategory)}
        options={CATEGORY_ORDER.map((c) => ({
          value: c,
          label: CATEGORY_META[c].label,
        }))}
      />

      <SpecFields category={category} />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Make" name="make" maxLength={80} />
        <Field label="Model" name="model" maxLength={80} />
        <Field label="Year" name="year" inputMode="numeric" />
        <Field label="Acquired" name="acquired_year" inputMode="numeric" />
      </div>

      <Field
        label="Registration"
        name="registration"
        maxLength={40}
        hint="Public registry identifiers only — an aircraft tail number, say. Never a VIN or a deed number."
      />

      <Field
        label="Estimated value (USD)"
        name="estimated_value_usd"
        inputMode="numeric"
        placeholder="185000000"
        hint="A press estimate, not an appraisal. Leave blank if unknown."
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <Select
          label="Status"
          name="status"
          defaultValue="unverified"
          options={STATUSES}
        />
        <Select
          label="Confidence"
          name="confidence"
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
        maxLength={80}
        hint="Country or state only. Never an address, mooring, hangar or coordinates."
      />

      <TextArea label="Summary" name="summary" maxLength={600} />

      <ImageUpload />

      <SourceEditor initial={[]} />

      <EditFooter pending={pending} error={state?.error} cancelHref="/assets" />
    </form>
  );
}
