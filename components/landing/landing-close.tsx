import { buttonClassName } from "@/components/ui/button";

import { OpenCaseLink } from "./open-case-link";

export default function LandingClose() {
  return (
    <section className="border-t-2 border-dashed border-pencil py-20">
      <div className="max-w-5xl mx-auto px-6 text-center">
        <p className="font-heading text-2xl md:text-4xl text-pencil max-w-2xl mx-auto -rotate-1">
          Bảng điều tra của bạn đang chờ. Hãy mở một case và bắt đầu kết nối
          những manh mối và suy luận những điều mà họ không nói ra.
        </p>

        <OpenCaseLink
          className={buttonClassName({
            size: "lg",
            className: "mt-10",
          })}
        />
      </div>
    </section>
  );
}
