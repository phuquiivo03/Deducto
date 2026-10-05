import Container from "@/components/layout/Container";
import CaseUnavailable from "@/components/ui/case-unavailable";

export default function CaseNotFound() {
  return (
    <main className="h-screen overflow-hidden">
      <Container>
        <CaseUnavailable
          title="Case not found"
          message="This case is missing or is no longer available. Pick another mystery from the store."
        />
      </Container>
    </main>
  );
}
