import Page from "./page";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}
async function RootLayout({ params }: PageProps) {
  const { id } = await params;
  return <Page id={id} />;
}

export default RootLayout;
