import { redirect } from "next/navigation";

/** Live product editor is the single source — no seed redirects. */
export default async function ProductComplianceRedirect({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/admin/products/${id}`);
}
