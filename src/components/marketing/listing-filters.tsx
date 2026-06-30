"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Search, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BUILDING_SORTS,
  type BuildingSort,
} from "@/lib/cms/filter-buildings";
import { cn } from "@/lib/utils";

type Props = {
  /** Distinct neighborhoods to offer as filter chips. */
  neighborhoods: string[];
  /** Current filter state, derived server-side from the URL. */
  current: { neighborhood: string; q: string; sort: BuildingSort };
};

const SEARCH_DEBOUNCE_MS = 300;

/**
 * URL-driven filter/sort/search bar for the listing. The server page reads the
 * same params and does the actual filtering, so this only mutates the URL
 * (`replace`, so filter churn stays out of the back-button history).
 */
export function ListingFilters({ neighborhoods, current }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(current.q);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    },
    [],
  );

  function navigate(next: {
    neighborhood?: string;
    q?: string;
    sort?: BuildingSort;
  }) {
    const params = new URLSearchParams();
    const neighborhood = next.neighborhood ?? current.neighborhood;
    const q = (next.q ?? search).trim();
    const sort = next.sort ?? current.sort;
    if (neighborhood) params.set("neighborhood", neighborhood);
    if (q) params.set("q", q);
    if (sort !== "featured") params.set("sort", sort);
    const qs = params.toString();
    startTransition(() => {
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    });
  }

  function onSearchChange(value: string) {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(
      () => navigate({ q: value }),
      SEARCH_DEBOUNCE_MS,
    );
  }

  function clearSearch() {
    setSearch("");
    if (debounceRef.current) clearTimeout(debounceRef.current);
    navigate({ q: "" });
  }

  const chips = [{ value: "", label: "All neighborhoods" }].concat(
    neighborhoods.map((n) => ({ value: n, label: n })),
  );

  return (
    <div className="flex flex-col gap-4" aria-busy={isPending}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            type="search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by name, neighborhood, or address"
            aria-label="Search buildings"
            className="h-9 pr-8 pl-8"
          />
          {search ? (
            <button
              type="button"
              onClick={clearSearch}
              aria-label="Clear search"
              className="absolute top-1/2 right-2 grid size-5 -translate-y-1/2 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X aria-hidden className="size-3.5" />
            </button>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          <label
            htmlFor="building-sort"
            className="text-sm whitespace-nowrap text-muted-foreground"
          >
            Sort by
          </label>
          <Select
            value={current.sort}
            onValueChange={(value) =>
              navigate({ sort: value as BuildingSort })
            }
          >
            <SelectTrigger id="building-sort" className="h-9 w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {BUILDING_SORTS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {neighborhoods.length > 0 ? (
        <div
          role="group"
          aria-label="Filter by neighborhood"
          className="flex flex-wrap gap-2"
        >
          {chips.map((chip) => {
            const isActive = current.neighborhood === chip.value;
            return (
              <button
                key={chip.value || "all"}
                type="button"
                aria-pressed={isActive}
                onClick={() => navigate({ neighborhood: chip.value })}
                className={cn(
                  "inline-flex h-8 items-center rounded-full border px-3 text-sm transition-colors",
                  isActive
                    ? "border-transparent bg-primary text-primary-foreground"
                    : "border-border bg-transparent text-foreground hover:bg-muted",
                )}
              >
                {chip.label}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
