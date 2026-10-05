import Container from "@/components/layout/Container";
import CaseUnavailable from "@/components/ui/case-unavailable";

export default function LoadingCase() {
  return (
    <main className="h-screen overflow-hidden">
      <Container>
        <CaseUnavailable
          title="Opening the case file"
          message="Fetching this mystery."
          showStoreLink={false}
        />
      </Container>
    </main>
  );
}
