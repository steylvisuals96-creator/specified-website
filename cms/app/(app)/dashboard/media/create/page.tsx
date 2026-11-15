export const dynamic = "force-dynamic";
import { getPayload } from "payload";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import FormShell, { Field, FormSection, SaveBtn } from "@/components/FormShell";
import MediaUpload from "@/components/MediaUpload";

const configPromise = import("@payload-config").then((m) => m.default);

export default async function MediaCreatePage() {
  const config = await configPromise;
  const payload = await getPayload({ config: config as any });
  const { user } = await payload.auth({ headers: await headers() });
  if (!user) redirect("/admin/login");

  async function create(fd: FormData) {
    "use server";
    // The MediaUpload component already uploads the file via /api/upload-media
    // and puts the ID in the form. We just redirect to media overview.
    redirect("/dashboard/media");
  }

  return (
    <FormShell activePath="/dashboard/media" userName={(user as any).naam || user.email} rol={(user as any).rol} title="Bestand uploaden" backHref="/dashboard/media" actions={<SaveBtn form="main-form" label="Klaar" />}>
      <form id="main-form" action={create}>
        <FormSection title="Bestand">
          <div style={{ color: "var(--bone-400)", fontSize: "0.875rem", marginBottom: "1rem" }}>
            Klik op het vak om een bestand te selecteren. Het wordt direct geüpload.
          </div>
          <MediaUpload name="file" label="Bestand of afbeelding uploaden" />
          <Field label="Alternatieve tekst (alt)" name="alt" placeholder="Beschrijving van het bestand" />
        </FormSection>
        <SaveBtn label="Terug naar Media" />
      </form>
    </FormShell>
  );
}
