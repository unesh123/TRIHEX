import { redirect } from "next/navigation";

export default async function ProductInventoryRedirect({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/admin/products/${id}`);
}
