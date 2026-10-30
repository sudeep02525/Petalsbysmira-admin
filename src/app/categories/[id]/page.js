import { redirect } from "next/navigation";

export default async function CategoryRedirect({ params }) {
  const { id } = await params;
  redirect(`/categories/${id}/edit`);
}

