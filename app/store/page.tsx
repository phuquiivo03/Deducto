import Header from "@/components/layout/Header";
import { SiteFooter } from "@/components/layout/site-footer";
import { StoreShelf } from "@/components/store/store-shelf";
import { StoreSignInEmpty } from "@/components/store/store-sign-in-empty";
import { StoreTabs } from "@/components/store/store-tabs";
import type { IShortGame } from "@/features/game/game.schemas";
import gameServices from "@/features/game/game.services";
import { getSessionUserId } from "@/features/user/user.auth";
import { withDisplayBanners } from "@/lib/case-banner-server";
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
  const requireLogin = tab !== "public" && !sessionUserId;

  return (
    <div className="min-h-dvh bg-paper text-pencil">
      <Header />
      <main className="max-w-5xl mx-auto px-6 py-20">
        <header className="mb-10 -rotate-1">
          <h1 className="font-heading text-4xl md:text-5xl text-pencil">
            Case store
          </h1>
          <p className="mt-4 text-lg md:text-xl text-pencil/80 max-w-[65ch] leading-relaxed">
            Pick a mystery, open the board, and work the clues until the
            accusation holds up.
          </p>
        </header>

        <div className="mb-10">
          <StoreTabs activeTab={tab} query={initialQuery} />
        </div>

        {requireLogin ? (
          <StoreSignInEmpty tab={tab as Exclude<StoreTab, "public">} />
        ) : (
          <StoreShelf initialQuery={initialQuery} tab={tab} />
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
