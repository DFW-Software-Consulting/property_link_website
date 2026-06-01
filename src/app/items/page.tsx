import Link from "next/link";
import { CreateItemForm } from "@/components/items/create-item-form";
import { ItemList } from "@/components/items/item-list";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ItemsPage() {
  return (
    <main className="mx-auto w-full max-w-2xl space-y-6 p-8">
      <div className="space-y-1">
        <Link href="/" className="text-sm text-muted-foreground hover:underline">
          ← Home
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Items</h1>
        <p className="text-muted-foreground">
          A demo feature wiring Prisma, TanStack Query, Zod, and ShadCN together.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create an item</CardTitle>
          <CardDescription>
            Validated with the same Zod schema on the client and the server.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CreateItemForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Items</CardTitle>
          <CardDescription>
            Fetched from <code>/api/items</code> via TanStack Query.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ItemList />
        </CardContent>
      </Card>
    </main>
  );
}
