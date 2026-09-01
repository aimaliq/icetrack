"use client";

import { useActionState } from "react";
import { createCelebrity, type EditState } from "@/lib/edit/actions";
import { CELEBRITY_CATEGORY_LABEL } from "@/lib/categories";
import { Field, TextArea, Select, EditFooter } from "@/components/EditFields";
import { ImageUpload } from "@/components/ImageUpload";

export function NewCelebrityForm() {
  const [state, formAction, pending] = useActionState<EditState, FormData>(
    createCelebrity,
    null,
  );

  return (
    <form action={formAction} className="space-y-5">
      <Field
        label="Name"
        name="name"
        required
        maxLength={120}
        placeholder="Drake"
        hint="The name they are publicly known by. The page address is generated from it."
      />
      <Field label="Real name" name="real_name" maxLength={160} />
      <Select
        label="Category"
        name="category"
        options={Object.entries(CELEBRITY_CATEGORY_LABEL).map(([value, label]) => ({
          value,
          label,
        }))}
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Nationality" name="nationality" maxLength={80} />
        <Field label="Born" name="born_year" inputMode="numeric" placeholder="1986" />
      </div>
      <TextArea
        label="Bio"
        name="bio"
        maxLength={600}
        hint="A couple of sentences. Public, factual, and uncontroversial."
      />
      <Field
        label="Wikipedia"
        name="wikipedia"
        inputMode="url"
        placeholder="https://en.wikipedia.org/wiki/…"
      />

      <ImageUpload />

      <EditFooter pending={pending} error={state?.error} cancelHref="/celebrities" />
    </form>
  );
}
