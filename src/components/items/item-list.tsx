"use client";

import { useQuery } from "@tanstack/react-query";
import type { Item } from "@/lib/schemas/item";

async function fetchItems(): Promise<Item[]> {
  const res = await fetch("/api/items");
  if (!res.ok) {
    throw new Error("Failed to load items");
  }
  return res.json();
}

export function ItemList() {
  const { data, isPending, isError } = useQuery({
    queryKey: ["items"],
    queryFn: fetchItems,
  });

  if (isPending) {
    return <p className="text-sm text-muted-foreground">Loading items…</p>;
  }

  if (isError) {
    return (
      <p className="text-sm text-destructive">
        Something went wrong loading items.
      </p>
    );
  }

  if (data.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No items yet — create one above.
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {data.map((item) => (
        <li key={item.id} className="rounded-md border bg-card px-3 py-2">
          <p className="font-medium">{item.name}</p>
          {item.description ? (
            <p className="text-sm text-muted-foreground">{item.description}</p>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
