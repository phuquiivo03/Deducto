import Header from "@/components/layout/Header";
import { StoreShelf } from "@/components/store/store-shelf";
import { StoreSignInEmpty } from "@/components/store/store-sign-in-empty";
import { StoreTabs } from "@/components/store/store-tabs";
import type { IShortGame } from "@/features/game/game.schemas";
import gameServices from "@/features/game/game.services";
import { getSessionUserId } from "@/features/user/user.auth";
import { parseStoreTab, type StoreTab } from "@/lib/store-constants";

interface StorePageProps {
  searchParams: Promise<{ tab?: string; q?: string }>;
}

async function loadGames(
  tab: StoreTab,
  userId: string | null,
): Promise<IShortGame[] | "sign-in"> {
  if (tab === "public") {
    return gameServices.findPublic();
  }
  if (!userId) {
    return "sign-in";
  }
  if (tab === "solved") {
    return gameServices.findSolved(userId);
  }
  return gameServices.findByUserId(userId);
}

export const metadata = {
  title: "Case store | Deducto",
  description:
    "Browse public detective cases, your solves, and cases you created.",
};

export default async function StorePage({ searchParams }: StorePageProps) {
  const params = await searchParams;
  const tab = parseStoreTab(params.tab);
  const initialQuery = params.q ?? "";
  const sessionUserId = await getSessionUserId();
  const gamesResult = await loadGames(tab, sessionUserId);

  return (
    <div className="min-h-dvh bg-paper text-ink">
      <Header />
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-10">
        <header className="mb-8 md:mb-10">
          <h1 className="font-display text-3xl md:text-4xl text-ink tracking-tight">
            Case store
          </h1>
          <p className="mt-2 text-base text-soft max-w-[65ch] leading-relaxed">
            Pick a mystery, open the board, and work the clues until the
            accusation holds up.
          </p>
        </header>

        <div className="mb-8">
          <StoreTabs activeTab={tab} query={initialQuery} />
        </div>

        {gamesResult === "sign-in" ? (
          <StoreSignInEmpty tab={tab as Exclude<StoreTab, "public">} />
        ) : (
          <StoreShelf
            games={gamesResult}
            initialQuery={initialQuery}
            tab={tab}
          />
        )}
      </main>
      <footer className="py-8 text-center text-xs text-soft border-t border-line">
        Deducto
      </footer>
    </div>
  );
}
