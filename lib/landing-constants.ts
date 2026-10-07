import { sampleIds } from "@/data/sample-ids";

export const SAMPLE_CASE_PATH = `/case/${sampleIds.game}`;

export const GUIDE_STEPS = [
  {
    num: "01",
    title: "Xem các chứng cứ",
    body: "Xem các tuyên bố, chứng cứ, và chi tiết nghi ngờ.",
  },
  {
    num: "02",
    title: "Kết nối các chứng cứ",
    body: "Xây dựng bảng điều tra của bạn và kiểm tra các mối quan hệ có thể.",
  },
  {
    num: "03",
    title: "Phán đoán",
    body: "Loại trừ các khả năng không thể, cho đến khi sự thật trở nên rõ ràng.",
  },
  {
    num: "04",
    title: "Phán đoán tội phạm",
    body: "Phán đoán tội phạm và tiết lộ những gì thực sự đã xảy ra.",
  },
] as const;
