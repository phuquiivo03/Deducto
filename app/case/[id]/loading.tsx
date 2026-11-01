import Container from "@/components/layout/Container";
import CaseUnavailable from "@/components/ui/case-unavailable";

export default function LoadingCase() {
  return (
    <main className="h-screen overflow-hidden">
      <Container>
        <CaseUnavailable
          title="Đang mở hồ sơ vụ án"
          message="Đang tải vụ án này."
          showStoreLink={false}
          heading="p"
        />
      </Container>
    </main>
  );
}
