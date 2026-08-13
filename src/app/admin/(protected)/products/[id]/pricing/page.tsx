import { redirect } from "next/navigation";

export default async function ProductPricingRedirect({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/admin/products/${id}`);
}
