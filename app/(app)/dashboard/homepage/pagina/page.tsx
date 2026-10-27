export const dynamic = "force-dynamic";
import { getPayload } from "payload";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { isBeheerder } from "@/lib/access";
import PaginaEditor from "@/components/PaginaEditor";
import { bewaarHomepage } from "../actions";

const configPromise = import("@payload-config").then((m) => m.default);

export default async function HomepageOpDePagina() {
  const config = await configPromise;
  const payload = await getPayload({ config: config as any });
  const { user } = await payload.auth({ headers: await headers() });
  if (!user) redirect("/admin/login");
  if (!isBeheerder(user)) redirect("/dashboard");

  const w: any = await (payload as any).findGlobal({ slug: "website" }).catch(() => ({}));
  const { id: _id, createdAt: _c, updatedAt: _u, globalType: _g, ...begin } = w ?? {};

  return <PaginaEditor begin={begin} userName={(user as any).naam || user.email} rol={(user as any).rol} opslaan={bewaarHomepage} />;
}
