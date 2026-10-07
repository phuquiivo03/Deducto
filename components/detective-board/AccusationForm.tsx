"use client";

import { useEffect, useMemo, useState } from "react";

import AccusationResultModal from "@/components/detective-board/AccusationResultModal";
import { ACCUSATION_ATTEMPT_LIMIT } from "@/features/game/accusation-decision";
import type { IAnswerResponse } from "@/features/game/game.schemas";
import type { AppResponse } from "@/features/type";
import { useDetectiveBoardStore } from "@/store";
import { Entity, EntityType } from "@/types/detective";
import { useAuthUser } from "@/hooks/use-auth-user";
import { useGameStore } from "@/store/game.store";

const TYPE_LABELS: Record<EntityType, { title: string; hint: string }> = {
  suspect: {
    title: "Hung thủ",
    hint: "Ai là hung thủ?",
  },
  weapon: {
    title: "Hung khí",
    hint: "Hung khí gì đã được sử dụng?",
  },
  location: {
    title: "Hiện trường",
    hint: "Nơi nào đã xảy ra vụ án?",
  },
  motive: {
    title: "Động cơ",
    hint: "Động cơ tại sao vụ án đã xảy ra?",
  },
};

const TYPE_ORDER: EntityType[] = ["suspect", "weapon", "location", "motive"];

export type AccusationSelection = Record<EntityType, string>;

interface Props {
  entities: Record<string, Entity>;
  open: boolean;
  onClose: () => void;
}

function groupEntitiesByType(
  entities: Record<string, Entity>,
): Record<EntityType, Entity[]> {
  const grouped: Record<EntityType, Entity[]> = {
    suspect: [],
    weapon: [],
    location: [],
    motive: [],
  };

  for (const entity of Object.values(entities)) {
    grouped[entity.type].push(entity);
  }

  for (const type of TYPE_ORDER) {
    grouped[type].sort((a, b) => a.name.localeCompare(b.name));
  }

  return grouped;
}

export default function AccusationForm({ entities, open, onClose }: Props) {
  const grouped = useMemo(() => groupEntitiesByType(entities), [entities]);

  const [selection, setSelection] = useState<AccusationSelection>({
    suspect: "",
    weapon: "",
    location: "",
    motive: "",
  });
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResultOpen, setIsResultOpen] = useState(false);

  const { setAnswer, answer, resultResponse, setResultResponse } =
    useDetectiveBoardStore();
  const { game } = useGameStore();
  const { user, isLoading: isAuthLoading } = useAuthUser();

  const resultCards = useMemo(() => {
    const allSelected = TYPE_ORDER.every((type) => selection[type]);
    if (!allSelected) {
      return null;
    }

    return TYPE_ORDER.map((type) => ({
      type,
      title: TYPE_LABELS[type].title,
      name: entities[selection[type]]?.name ?? "Unknown",
    }));
  }, [selection, entities]);

  useEffect(() => {
    if (!submitSuccess || answer === null || game === null) {
      return;
    }

    let cancelled = false;

    fetch(`/api/game/${game.id}/result`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...answer,
      }),
    })
      .then(async (response) => {
        let data: AppResponse<IAnswerResponse> | null = null;
        try {
          data = (await response.json()) as AppResponse<IAnswerResponse>;
        } catch {
          throw new Error("Không thể ghi nhận cáo buộc. Vui lòng thử lại.");
        }
        if (
          !response.ok ||
          !data?.success ||
          data.data == null ||
          typeof data.data.solved !== "boolean"
        ) {
          throw new Error(
            data?.message ?? "Không thể ghi nhận cáo buộc. Vui lòng thử lại.",
          );
        }
        return data;
      })
      .then((data) => {
        if (cancelled) {
          return;
        }
        setResultResponse(data.data);
        setIsResultOpen(true);
        setIsSubmitting(false);
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          const message =
            error instanceof Error && error.message
              ? error.message
              : "Không thể ghi nhận cáo buộc. Vui lòng thử lại.";
          setSubmitError(message);
          setSubmitSuccess(false);
          setIsSubmitting(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [submitSuccess, answer, game, setResultResponse]);

  const handleSelect = (type: EntityType, id: string) => {
    setSelection((prev) => ({ ...prev, [type]: id }));
    setSubmitError(null);
    setSubmitSuccess(false);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (isAuthLoading) {
      setSubmitError("Đang kiểm tra đăng nhập. Vui lòng thử lại sau.");
      setSubmitSuccess(false);
      return;
    }

    if (!user) {
      setSubmitError("Đăng nhập với Google trước khi gửi cáo buộc.");
      setSubmitSuccess(false);
      return;
    }

    const missing = TYPE_ORDER.filter((type) => !selection[type]);
    if (missing.length > 0) {
      setSubmitError(
        "Chọn một người bị tội, vũ khí, nơi xảy ra và lý do trước khi gửi cáo buộc.",
      );
      setSubmitSuccess(false);
      return;
    }

    setSubmitError(null);
    setSubmitSuccess(true);
    if (game) {
      setIsSubmitting(true);
      setAnswer({
        game_id: game.id,
        user_id: user.id,
        time_taken: 1000,
        answer: {
          murder_id: selection.suspect,
          weapon_id: selection.weapon,
          motive_id: selection.motive,
          location_id: selection.location,
        },
      });
    }
  };

  const handleClose = () => {
    setSubmitError(null);
    setSubmitSuccess(false);
    setIsSubmitting(false);
    setIsResultOpen(false);
    setResultResponse(null);
    onClose();
  };

  const handleResultRetry = () => {
    setIsResultOpen(false);
    setSubmitSuccess(false);
    setIsSubmitting(false);
  };

  if (!open) {
    return null;
  }

  if (isResultOpen && resultResponse && resultCards) {
    return (
      <AccusationResultModal
        result={resultResponse}
        cards={resultCards}
        onClose={handleClose}
        onRetry={handleResultRetry}
      />
    );
  }

  return (
    <div
      className="
fixed
inset-0
z-50
flex
items-center
justify-center
p-4
"
      role="presentation"
    >
      <button
        type="button"
        className="
absolute
inset-0
bg-pencil/55

"
        aria-label="Close accusation form"
        onClick={handleClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="accusation-form-title"
        className="
relative
w-full
max-w-lg
max-h-[90vh]
overflow-y-auto
rounded-2xl
border
border-erased
bg-card
shadow-xl
"
      >
        <div
          className="
sticky
top-0
z-10
flex
items-start
justify-between
gap-3
border-b
border-erased
bg-paper/95
px-5
py-4

"
        >
          <div>
            <p
              className="
text-[11px]
font-semibold
uppercase
tracking-wide
text-pen
"
            >
              Cáo buộc cuối cùng
            </p>
            <h2
              id="accusation-form-title"
              className="
mt-1
font-heading
text-lg
font-semibold
text-pencil
"
            >
              Đoán hung thủ
            </h2>
            <p className="mt-1 text-xs text-pencil/70">
              Chọn một người bị tội, vũ khí, nơi xảy ra và lý do.
            </p>
            <p className="mt-1 text-xs text-pencil/70">
              Còn {ACCUSATION_ATTEMPT_LIMIT} cáo buộc cho mỗi trường hợp. Quyết
              định chỉ nói xem cáo buộc của bạn có đúng hay không.
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="
shrink-0
rounded-wobbly-sm
border
border-erased
bg-card
px-2.5
py-1.5
text-xs
font-semibold
text-pencil/70
hover:bg-paper
"
          >
            Đóng
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 px-5 py-5">
          {TYPE_ORDER.map((type) => {
            const { title, hint } = TYPE_LABELS[type];
            const options = grouped[type];

            return (
              <fieldset key={type} className="space-y-2">
                <legend className="mb-2 block w-full">
                  <span className="text-sm font-semibold text-pencil">
                    {title}
                  </span>
                  <span className="mt-0.5 block text-xs text-pencil/70">
                    {hint}
                  </span>
                </legend>

                <div className="grid gap-2">
                  {options.map((entity) => {
                    const isSelected = selection[type] === entity.id;

                    return (
                      <label
                        key={entity.id}
                        className={`
flex
cursor-pointer
items-center
gap-3
rounded-wobbly-md
border
p-3
transition
${
  isSelected
    ? "border-pen bg-postit/60 shadow-sm"
    : "border-erased bg-card hover:border-pencil"
}
`}
                      >
                        <input
                          type="radio"
                          name={`accusation-${type}`}
                          value={entity.id}
                          checked={isSelected}
                          onChange={() => handleSelect(type, entity.id)}
                          disabled={isSubmitting}
                          className="
size-4
accent-pen
"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-semibold">
                            {entity.name}
                          </span>
                          <span className="block text-xs text-pencil/70">
                            {entity.meta}
                          </span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            );
          })}

          {submitError && (
            <p
              role="alert"
              className="
rounded-wobbly-sm
border
border-marker/40
bg-marker/10
px-3
py-2
text-xs
font-semibold
text-marker
"
            >
              {submitError}
            </p>
          )}

          {isSubmitting && (
            <p
              role="status"
              className="
rounded-wobbly-sm
border
border-erased
bg-paper/80
px-3
py-2
text-xs
font-semibold
text-pencil/70
"
            >
              Gửi cáo buộc...
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="
w-full
rounded-wobbly-md
bg-gradient-to-br
from-pencil
to-pen
py-3.5
text-sm
font-bold
text-card
shadow-hard
transition
hover:brightness-105
active:brightness-95
disabled:cursor-not-allowed
disabled:opacity-60
"
          >
            {isSubmitting ? "Gửi cáo buộc..." : "Gửi cáo buộc"}
          </button>
        </form>
      </div>
    </div>
  );
}
