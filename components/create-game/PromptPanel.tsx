"use client";

import type { GameLevelStrict } from "@/features/game/game.schemas";
import { useCreateGameStore } from "@/store/create-game.store";
import Card from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { cn } from "@/lib/cn";

const EXAMPLES = [
  "Ngôi nhà cổ từ thời phong kiến trong một cơn bão, 4 khách mời, người thừa kế căng thẳng",
  "Đêm mở màn của bộ sưu tập nghệ thuật, tác phẩm đắt giá bị ăn cắp, bốn nghi phạm",
  "Tàu du lịch sang trọng, thuyền trưởng bị tìm thấy chết, năm hành khách",
];

const LEVELS: {
  level: GameLevelStrict;
  label: string;
  hint: string;
  enabled: boolean;
}[] = [
  { level: "easy", label: "Dễ", hint: "3 nghi phạm", enabled: false },
  { level: "medium", label: "Trung bình", hint: "4 nghi phạm", enabled: true },
  { level: "hard", label: "Khó", hint: "5 nghi phạm", enabled: false },
];

export default function PromptPanel({
  onGenerate,
  disabled,
}: {
  onGenerate: () => void;
  disabled?: boolean;
}) {
  const prompt = useCreateGameStore((s) => s.prompt);
  const level = useCreateGameStore((s) => s.level);
  const setPrompt = useCreateGameStore((s) => s.setPrompt);
  const setLevel = useCreateGameStore((s) => s.setLevel);

  return (
    <Card decoration="tack" className="space-y-6 mb-0">
      <div>
        <h1 className="font-heading text-3xl text-pencil">
          Thiết kế một case mới
        </h1>
        <p className="text-base text-pencil/80 mt-2">
          Mô tả cảnh, người bị hại, và tính cách. AI xây dựng một bài toán suy
          luận đầy đủ mà bạn có thể chỉnh sửa trước khi đăng.
        </p>
      </div>

      <div className="space-y-2 border-b-2 border-dashed border-pencil pb-6">
        <label htmlFor="case-prompt" className="font-heading text-lg">
          Nội dung của bạn
        </label>
        <Textarea
          id="case-prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={5}
          maxLength={1000}
          placeholder="Một câu chuyện thầm kín ở một khách sạn biển…"
        />
        <p className="text-sm text-pencil/60 text-right">
          {prompt.length}/1000
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {EXAMPLES.map((ex) => (
          <button
            key={ex}
            type="button"
            onClick={() => setPrompt(ex)}
            className="
text-sm border-2 border-pencil px-3 py-1 rounded-wobbly-sm
text-pencil/70 hover:bg-postit hover:text-pencil transition-colors
"
          >
            {ex.slice(0, 42)}…
          </button>
        ))}
      </div>

      <fieldset className="space-y-3">
        <legend className="font-heading text-lg text-pencil">Độ khó</legend>
        <div className="grid grid-cols-3 gap-3">
          {LEVELS.map((item) => (
            <button
              disabled={!item.enabled}
              key={item.level}
              type="button"
              onClick={() => setLevel(item.level)}
              className={cn(
                "border-2 py-3 text-base rounded-wobbly-sm shadow-paper",
                "transition-transform duration-100",
                level === item.level
                  ? "border-pencil bg-postit -rotate-1 shadow-hard-sm"
                  : "border-pencil bg-card text-pencil/70 hover:-rotate-1",
              )}
            >
              {item.label}
              <span className="block text-sm text-pencil/60 mt-0.5">
                {item.hint}
              </span>
            </button>
          ))}
        </div>
      </fieldset>

      <Button
        type="button"
        onClick={onGenerate}
        disabled={disabled || prompt.trim().length < 10}
        className="w-full"
      >
        Tạo case
      </Button>
    </Card>
  );
}
