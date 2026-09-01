"use client";

import { useActionState } from "react";
import { updateCelebrity, type EditState } from "@/lib/edit/actions";
import { CELEBRITY_CATEGORY_LABEL } from "@/lib/categories";
import { Field, TextArea, Select, EditFooter } from "@/components/EditFields";
import type { Celebrity } from "@/lib/types";

export function CelebrityForm({ celeb }: { celeb: Celebrity }) {
  const action = updateCelebrity.bind(null, celeb.id);
  const [state, formAction, pending] = useActionState<EditState, FormData>(
    action,
    null,
  );

  return (
    <form action={formAction} className="space-y-5">
      <Field label="Name" name="name" defaultValue={celeb.name} required maxLength={120} />
      <Field
        label="Real name"
        name="real_name"
        defaultValue={celeb.realName}
        maxLength={160}
        hint="Optional, if they are known publicly by another name."
      />
      <Select
        label="Category"
        name="category"
        defaultValue={celeb.category}
        options={Object.entries(CELEBRITY_CATEGORY_LABEL).map(([value, label]) => ({
          value,
          label,
        }))}
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Nationality"
          name="nationality"
          defaultValue={celeb.nationality}
          maxLength={80}
        />
        <Field
          label="Born"
          name="born_year"
          defaultValue={celeb.bornYear}
          inputMode="numeric"
          placeholder="1986"
        />
      </div>
      <TextArea
        label="Bio"
        name="bio"
        defaultValue={celeb.bio}
        maxLength={600}
        hint="A couple of sentences. Public, factual, and uncontroversial."
      />
      <Field
        label="Wikipedia"
        name="wikipedia"
        defaultValue={celeb.wikipedia}
        inputMode="url"
        placeholder="https://en.wikipedia.org/wiki/…"
      />

      <EditFooter
        pending={pending}
        error={state?.error}
        cancelHref={`/celebrities/${celeb.id}`}
      />
    </form>
  );
}
