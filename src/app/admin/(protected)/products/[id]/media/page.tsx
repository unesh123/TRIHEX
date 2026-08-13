import { redirect } from "next/navigation";

/** Legacy media route → main product editor (image upload lives there). */
export default async function ProductMediaRedirect({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/admin/products/${id}`);
}
