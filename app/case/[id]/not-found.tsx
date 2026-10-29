import Container from "@/components/layout/Container";
import CaseUnavailable from "@/components/ui/case-unavailable";

export default function CaseNotFound() {
  return (
    <main className="h-screen overflow-hidden">
      <Container>
        <CaseUnavailable
          title="Không tìm thấy case"
          message="Case này không tồn tại hoặc đã bị gỡ. Chọn một vụ án khác trong cửa hàng nhé."
        />
      </Container>
    </main>
  );
}
