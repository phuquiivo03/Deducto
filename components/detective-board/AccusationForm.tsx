"use client";

import { useEffect, useMemo, useState } from "react";

import AccusationResultModal from "@/components/detective-board/AccusationResultModal";
import type { IAnswerResponse } from "@/features/game/game.schemas";
import type { AppResponse } from "@/features/type";
import { useDetectiveBoardStore } from "@/store";
import { Entity, EntityType } from "@/types/detective";
import { useGameStore } from "@/store/game.store";

const TYPE_LABELS: Record<EntityType, { title: string; hint: string }> = {
  suspect: {
    title: "Suspect",
    hint: "Who committed the crime?",
  },
  weapon: {
    title: "Weapon",
    hint: "What was used?",
  },
  location: {
    title: "Location",
    hint: "Where did it happen?",
  },
  motive: {
    title: "Motive",
    hint: "Why did it happen?",
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
    setIsSubmitting(true);

    fetch(`/api/game/${game.id}/result`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...answer,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to submit result");
        }
        return response.json() as Promise<AppResponse<IAnswerResponse>>;
      })
      .then((data) => {
        if (cancelled) {
          return;
        }
        if (!data.success || data.data === undefined || data.data === null) {
          throw new Error(data.message ?? "Failed to submit result");
        }
        setResultResponse(data.data);
        setIsResultOpen(true);
        setIsSubmitting(false);
      })
      .catch(() => {
        if (!cancelled) {
          setSubmitError("Could not submit the accusation. Try again.");
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

    const missing = TYPE_ORDER.filter((type) => !selection[type]);
    if (missing.length > 0) {
      setSubmitError(
        "Select a suspect, weapon, location, and motive before submitting.",
      );
      setSubmitSuccess(false);
      return;
    }

    setSubmitError(null);
    setSubmitSuccess(true);
    if (game) {
      setAnswer({
        game_id: game.id,
        user_id: "sampleIds",
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
bg-[#1A1814]/55
backdrop-blur-[2px]
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
border-[#E7DFCC]
bg-[#FDFCF9]
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
border-[#E7DFCC]
bg-[#F5F0E4]/95
px-5
py-4
backdrop-blur-sm
"
        >
          <div>
            <p
              className="
text-[11px]
font-semibold
uppercase
tracking-wide
text-[#B08328]
"
            >
              Final accusation
            </p>
            <h2
              id="accusation-form-title"
              className="
mt-1
font-display
text-lg
font-semibold
text-[#23211C]
"
            >
              Name the culprit
            </h2>
            <p className="mt-1 text-xs text-[#6F6858]">
              Choose one suspect, weapon, location, and motive.
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="
shrink-0
rounded-lg
border
border-[#E7DFCC]
bg-white
px-2.5
py-1.5
text-xs
font-semibold
text-[#6F6858]
hover:bg-[#F5F0E4]
"
          >
            Close
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 px-5 py-5">
          {TYPE_ORDER.map((type) => {
            const { title, hint } = TYPE_LABELS[type];
            const options = grouped[type];

            return (
              <fieldset key={type} className="space-y-2">
                <legend className="mb-2 block w-full">
                  <span className="text-sm font-semibold text-[#23211C]">
                    {title}
                  </span>
                  <span className="mt-0.5 block text-xs text-[#6F6858]">
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
rounded-xl
border
p-3
transition
${
  isSelected
    ? "border-[#B08328] bg-[#F4E7C6]/60 shadow-sm"
    : "border-[#E7DFCC] bg-white hover:border-[#D4C9A8]"
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
accent-[#B08328]
"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-semibold">
                            {entity.name}
                          </span>
                          <span className="block text-xs text-[#6F6858]">
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
rounded-lg
border
border-[#E8C4C4]
bg-[#FDF2F2]
px-3
py-2
text-xs
font-semibold
text-[#9B2C2C]
"
            >
              {submitError}
            </p>
          )}

          {isSubmitting && (
            <p
              role="status"
              className="
rounded-lg
border
border-[#E7DFCC]
bg-[#F5F0E4]/80
px-3
py-2
text-xs
font-semibold
text-[#6F6858]
"
            >
              Submitting your accusation…
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="
w-full
rounded-xl
bg-gradient-to-br
from-[#8C6A1E]
to-[#B08328]
py-3.5
text-sm
font-bold
text-[#FDFCF9]
shadow-md
transition
hover:brightness-105
active:brightness-95
disabled:cursor-not-allowed
disabled:opacity-60
"
          >
            {isSubmitting ? "Submitting…" : "Submit accusation"}
          </button>
        </form>
      </div>
    </div>
  );
}
