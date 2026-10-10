"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useQueryClient } from "@tanstack/react-query";

import type { IShortGame } from "@/features/game/game.schemas";
import { gameApi } from "@/lib/api/game";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import { ModalShell } from "@/components/ui/modal-shell";

interface VisibilityFlagProps {
  gameId: string;
  visibility: IShortGame["visibility"];
}

export function VisibilityFlag({ gameId, visibility }: VisibilityFlagProps) {
  const queryClient = useQueryClient();
  const [current, setCurrent] = useState(visibility);
  const [open, setOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const publishing = current === "private";

  useEffect(() => {
    setCurrent(visibility);
  }, [visibility]);

  const handleOpen = () => {
    setError(null);
    setOpen(true);
  };

  const handleConfirm = async () => {
    const next = publishing ? "public" : "private";
    setIsSaving(true);
    setError(null);
    try {
      const saved = await gameApi.updateVisibility(gameId, next);
      setCurrent(saved);
      queryClient.setQueryData<IShortGame[]>(["games", "my"], (rows) =>
        rows?.map((row) =>
          row.id === gameId ? { ...row, visibility: saved } : row,
        ),
      );
      setOpen(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not update this case",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const dialog = (
    <ModalShell
      open
      title={publishing ? "Công khai case này?" : "Để case này riêng tư?"}
      onClose={() => {
        if (!isSaving) setOpen(false);
      }}
    >
      <p className="text-base text-pencil/80 leading-relaxed mb-6">
        {publishing
          ? "Case sẽ xuất hiện ở tab Public. Ai cũng mở được."
          : "Case sẽ rời tab Public. Người đã giải vẫn mở được."}
      </p>
      {error ? (
        <p className="mb-4 text-base text-marker" role="alert">
          {error}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-3">
        <Button
          type="button"
          size="sm"
          disabled={isSaving}
          onClick={handleConfirm}
        >
          Xác nhận
        </Button>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          disabled={isSaving}
          onClick={() => setOpen(false)}
        >
          Hủy
        </Button>
      </div>
    </ModalShell>
  );

  return (
    <>
      <button
        type="button"
        className={cn(
          "relative z-20 inline-block border-2 border-pencil px-3 py-1  hover:text-pen",
          "rounded-wobbly-sm text-sm shadow-hard-sm",
          current === "public"
            ? "bg-marker text-card"
            : "bg-postit text-pencil",
        )}
        aria-haspopup="dialog"
        aria-label={
          current === "public"
            ? "Public. Change visibility"
            : "Private. Change visibility"
        }
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          handleOpen();
        }}
      >
        {current === "public" ? "Public" : "Private"}
      </button>
      {open ? createPortal(dialog, document.body) : null}
    </>
  );
}
