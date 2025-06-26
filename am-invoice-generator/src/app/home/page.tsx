import InvoiceGenerator from "@/components/invoice-generator";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <InvoiceGenerator />
    </main>
  );
}
