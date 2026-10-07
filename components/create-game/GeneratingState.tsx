"use client";

import { useEffect, useState } from "react";

import Card from "@/components/ui/Card";
import { DoodleScribbleCircle } from "@/components/ui/doodles";

const MESSAGES = [
  "Đang đọc vụ án…",
  "Đang tạo các nghi phạm…",
  "Đang tạo các dấu vết…",
  "Đang kiểm tra lưới logic…",
  "Đang hoàn thiện câu chuyện…",
];

export default function GeneratingState({
  onCancel,
}: {
  onCancel: () => void;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % MESSAGES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  return (
    <Card decoration="tape" className="p-8 text-center space-y-6 mb-0">
      <DoodleScribbleCircle className="mx-auto block md:block" />
      <div
        className="
mx-auto h-12 w-12 rounded-wobbly-sm border-[3px] border-pencil
border-t-transparent animate-spin
"
      />
      <div>
        <h2 className="font-heading text-2xl text-pencil">
          Đang tạo vụ án của bạn
        </h2>
        <p className="text-base text-pencil/80 mt-2 min-h-[1.25rem]">
          {MESSAGES[index]}
        </p>
        <p className="text-sm text-pencil/60 mt-3">
          Điều này có thể mất từ 1 đến 2 phút.
        </p>
      </div>
      <button
        type="button"
        onClick={onCancel}
        className="text-base text-pencil/70 wavy-underline"
      >
        Hủy bỏ
      </button>
    </Card>
  );
}
