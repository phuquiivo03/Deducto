import type { Metadata } from "next";
import { Suspense } from "react";

import Header from "@/components/layout/Header";
import { SiteFooter } from "@/components/layout/site-footer";
import { StoreBrowser } from "@/components/store/store-browser";
import { StoreShelf } from "@/components/store/store-shelf";
import { StoreTabs } from "@/components/store/store-tabs";
import type { IShortGame } from "@/features/game/game.schemas";
import gameServices from "@/features/game/game.services";
import { withDisplayBanners } from "@/lib/case-banner-server";
import { pageMetadata } from "@/lib/page-metadata";

const STORE_DESCRIPTION =
  "Duyệt các case trinh sát công khai, case bạn đã phá và case bạn đã tạo. Chọn một case và bắt đầu điều tra trong Deducto.";

export const metadata: Metadata = pageMetadata({
  title: "Cửa hàng case trinh sát",
  description: STORE_DESCRIPTION,
  path: "/store",
});

// Public catalog does not read cookies, so the HTML can be cached.
export const revalidate = 60;

async function loadPublicGames(): Promise<IShortGame[]> {
  try {
    return withDisplayBanners(await gameServices.listPublic());
  } catch (error) {
    console.error("store: public catalog", error);
    return [];
  }
}

function PublicCatalog({ games }: { games: IShortGame[] }) {
  return (
    <>
      <div className="mb-10">
        <StoreTabs activeTab="public" />
      </div>
      <StoreShelf initialQuery="" tab="public" publicGames={games} />
    </>
  );
}

export default async function StorePage() {
  const games = await loadPublicGames();

  return (
    <div className="min-h-dvh bg-paper text-pencil">
      <Header />
      <main className="max-w-5xl mx-auto px-6 py-20">
        <header className="mb-10 -rotate-1">
          <h1 className="font-heading text-4xl md:text-5xl text-pencil">
            Cửa hàng
          </h1>
          <p className="mt-4 text-lg md:text-xl text-pencil/80 max-w-[65ch] leading-relaxed">
            Chọn một case, mở bảng điều tra, và lần theo các chứng cứ cho đến
            khi tìm ra sự thật.
          </p>
        </header>

        <Suspense fallback={<PublicCatalog games={games} />}>
          <StoreBrowser games={games} />
        </Suspense>
      </main>
      <SiteFooter />
    </div>
  );
}
