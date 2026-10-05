"use client";

import Container from "@/components/layout/Container";
import CaseUnavailable from "@/components/ui/case-unavailable";

export default function CaseError({
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <main className="h-screen overflow-hidden">
      <Container>
        <CaseUnavailable
          title="Could not open this case"
          message="The case file did not load. Try again, or pick another mystery from the store."
          onRetry={retry}
        />
      </Container>
    </main>
  );
}
