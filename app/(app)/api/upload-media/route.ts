import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import { headers } from "next/headers";

const configPromise = import("@payload-config").then((m) => m.default);

export async function POST(req: NextRequest) {
  try {
    const config = await configPromise;
    const payload = await getPayload({ config: config as any });
    const { user } = await payload.auth({ headers: await headers() });
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const alt = (formData.get("alt") as string) || file?.name || "";

    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await payload.create({
      collection: "media",
      // Als de ingelogde gebruiker, zodat de toegangsregels en het bestandstype gelden.
      user,
      overrideAccess: false,
      data: { alt } as any,
      file: {
        data: buffer,
        mimetype: file.type,
        name: file.name,
        size: file.size,
      },
    });

    return NextResponse.json({ id: result.id, url: (result as any).url });
  } catch (err) {
    console.error("[upload-media]", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
