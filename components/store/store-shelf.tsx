"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import type { IShortGame } from "@/features/game/game.schemas";
import type { StoreTab } from "@/lib/store-constants";
import { Input } from "@/components/ui/input";

import { CaseCard } from "./case-card";
import { useQuery } from "@tanstack/react-query";
import { gameApi } from "@/lib/api/game";

interface StoreShelfProps {
  initialQuery: string;
  tab: StoreTab;
}

function matchesQuery(game: IShortGame, query: string): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  const haystack = [game.title, game.description, String(game.creator)]
    .join(" ")
    .toLowerCase();
  return haystack.includes(needle);
}

const EMPTY_BY_TAB: Record<StoreTab, string> = {
  public: "No public cases yet. Check back soon or create one.",
  solved:
    "You have not solved any cases yet. Open a case and accuse the killer.",
  my: "You have not created any cases yet.",
};

export function StoreShelf({ initialQuery, tab }: StoreShelfProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [priceFreeOnly, setPriceFreeOnly] = useState(false);
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const { data: games, isLoading } = useQuery({
    queryKey: ["games", tab],
    queryFn: () => gameApi.getGames(tab),
  });
  const syncQueryToUrl = useCallback(
    (nextQuery: string) => {
      const params = new URLSearchParams({ tab });
      const trimmed = nextQuery.trim();
      if (trimmed) {
        params.set("q", trimmed);
      }
      router.replace(`/store?${params.toString()}`, { scroll: false });
    },
    [router, tab],
  );

  const filtered = useMemo(
    () => games?.filter((game) => matchesQuery(game, query)) ?? [],
    [games, query],
  );

  const handleQueryChange = (value: string) => {
    setQuery(value);
    syncQueryToUrl(value);
  };

  if (games?.length === 0) {
    return (
      <p className="text-center text-lg text-pencil/70 py-16 max-w-md mx-auto">
        {EMPTY_BY_TAB[tab]}
      </p>
    );
  }

  return (
    <div className="space-y-8">
      <div
        className="
grid gap-8 md:grid-cols-[1fr_auto]
md:items-end
"
      >
        <div className="flex flex-col gap-2">
          <label
            htmlFor="store-search"
            className="text-lg font-heading text-pencil"
          >
            Search
          </label>
          <Input
            id="store-search"
            type="search"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="Title, description, or creator"
          />
        </div>

        <fieldset
          className="
flex flex-col gap-3 min-w-0 md:min-w-[280px]
border-2 border-dashed border-pencil rounded-wobbly-md p-4
"
        >
          <legend className="text-lg font-heading text-pencil px-1">
            Price
          </legend>
          <label className="flex items-center gap-2 text-base text-pencil">
            <input
              type="checkbox"
              checked={priceFreeOnly}
              onChange={(e) => setPriceFreeOnly(e.target.checked)}
              className="h-4 w-4 border-2 border-pencil"
            />
            Free only
          </label>
          <div className="flex gap-2">
            <Input
              type="number"
              min={0}
              placeholder="Min"
              value={priceMin}
              onChange={(e) => setPriceMin(e.target.value)}
              className="flex-1 text-base"
              aria-label="Minimum price"
            />
            <Input
              type="number"
              min={0}
              placeholder="Max"
              value={priceMax}
              onChange={(e) => setPriceMax(e.target.value)}
              className="flex-1 text-base"
              aria-label="Maximum price"
            />
          </div>
          <p className="text-sm text-pencil/60 leading-relaxed">
            Price filtering will apply when cases list a price in the catalog.
          </p>
        </fieldset>
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-lg text-pencil/70 py-12">
          No cases match your search. Try different words or clear the search
          field.
        </p>
      ) : (
        <ul
          className="
grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8
list-none p-0 m-0
"
        >
          {filtered.map((game, index) => (
            <li key={index}>
              <CaseCard game={game} index={index} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
