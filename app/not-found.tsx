import Container from "@/components/layout/Container";
import CaseUnavailable from "@/components/ui/case-unavailable";

export default function NotFound() {
  return (
    <main className="min-h-dvh bg-paper text-pencil flex items-center justify-center px-6">
      <Container>
        <CaseUnavailable
          title="Không tìm thấy trang"
          message="Trang bạn đang tìm không tồn tại hoặc đã bị di chuyển. Quay lại cửa hàng để chọn một vụ án khác nhé."
        />
      </Container>
    </main>
  );
}
