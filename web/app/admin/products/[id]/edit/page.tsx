import AdminProductForm from "@/components/AdminProductForm";

export default async function AdminEditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AdminProductForm id={id} />;
}
