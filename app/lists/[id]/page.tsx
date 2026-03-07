import { ListDetailClient } from "@/components/lists/ListDetailClient";

export default async function ListDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}): Promise<React.JSX.Element> {
  const { id } = await params;
  return <ListDetailClient listId={id} />;
}
