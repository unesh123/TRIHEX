import { redirect } from "next/navigation";

/** Legacy edit route → main product editor. */
export default async function ProductEditRedirect({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/admin/products/${id}`);
}
