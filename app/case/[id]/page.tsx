import type { Metadata } from "next";
import { cache } from "react";
import { notFound, unstable_rethrow } from "next/navigation";

import CaseSession from "@/components/case/case-session";
import { siteUrl } from "@/config/site";
import { bannerForDisplay } from "@/lib/case-banner-server";
import { pageMetadata, shareImage } from "@/lib/page-metadata";
import { isGameNotFound } from "@/features/game/game-errors";
import type { IGame } from "@/features/game/game.schemas";
import gameServices from "@/features/game/game.services";
import submissionRepositories from "@/features/submission/submission.repositories";
import {
  rankSubmissions,
  type LeaderboardRow,
} from "@/features/submission/submission.schemas";
import { getSessionUserId } from "@/features/user/user.auth";
import { applySamplePuzzles } from "@/features/puzzles/apply-sample-puzzles";
import { presentGameForPlayer } from "@/features/puzzles/present-game";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

const loadGame = cache(async (id: string): Promise<IGame | null> => {
  try {
    return await gameServices.getById(id);
  } catch (error) {
    unstable_rethrow(error);
    if (isGameNotFound(error)) return null;
    throw error;
  }
});

const loadCase = cache(
  async (
    id: string,
  ): Promise<{ game: IGame; leaderboard: LeaderboardRow[] } | null> => {
    const game = await loadGame(id);
    if (!game) return null;
    const viewerId = await getSessionUserId();
    const solves = await submissionRepositories.findByGame(game.id);
    return { game, leaderboard: rankSubmissions(solves, viewerId) };
  },
);

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const game = await loadGame(id);
  if (!game) {
    return { robots: { index: false, follow: false } };
  }

  const path = `/case/${game.id}`;
  return pageMetadata({
    title: game.title,
    description: game.description,
    path,
    openGraphType: "article",
    images: [shareImage(bannerForDisplay(game.banner), game.title)],
    robots:
      game.visibility === "private"
        ? { index: false, follow: false }
        : undefined,
  });
}

function breadcrumbJsonLd(game: IGame) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Trang chủ",
        item: siteUrl("/"),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Cửa hàng",
        item: siteUrl("/store"),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: game.title,
        item: siteUrl(`/case/${game.id}`),
      },
    ],
  };
}

export default async function CasePage({ params }: PageProps) {
  const { id } = await params;
  const loaded = await loadCase(id);
  if (!loaded) {
    notFound();
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd(loaded.game)),
        }}
      />
      <CaseSession
        key={loaded.game.id}
        game={presentGameForPlayer(applySamplePuzzles(loaded.game))}
        leaderboard={loaded.leaderboard}
      />
    </>
  );
}
