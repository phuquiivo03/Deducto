"use client";

import { useSearchParams } from "next/navigation";

import { StoreShelf } from "@/components/store/store-shelf";
import { StoreSignInEmpty } from "@/components/store/store-sign-in-empty";
import { StoreTabs } from "@/components/store/store-tabs";
import type { IShortGame } from "@/features/game/game.schemas";
import { useAuthUser } from "@/hooks/use-auth-user";
import { parseStoreTab, type StoreTab } from "@/lib/store-constants";

function UserCases({
  tab,
  initialQuery,
}: {
  tab: Exclude<StoreTab, "public">;
  initialQuery: string;
}) {
  const { user, isLoading } = useAuthUser();

  if (isLoading) {
    return (
      <p className="text-center text-lg text-pencil/70 py-16">
        Đang kiểm tra đăng nhập…
      </p>
    );
  }

  if (!user) {
    return <StoreSignInEmpty tab={tab} />;
  }

  return <StoreShelf initialQuery={initialQuery} tab={tab} />;
}

export function StoreBrowser({ games }: { games: IShortGame[] }) {
  const params = useSearchParams();
  const tab = parseStoreTab(params.get("tab") ?? undefined);
  const query = params.get("q") ?? "";

  return (
    <>
      <div className="mb-10">
        <StoreTabs activeTab={tab} query={query} />
      </div>
      {tab === "public" ? (
        <StoreShelf
          initialQuery={query}
          tab="public"
          publicGames={games}
        />
      ) : (
        <UserCases tab={tab} initialQuery={query} />
      )}
    </>
  );
}
