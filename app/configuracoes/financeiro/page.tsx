import PageHeader from "@/components/PageHeader";

export default function FinanceiroPage() {
  return (
    <div>
      <PageHeader title="Financeiro" backHref="/configuracoes" />
      <div className="rounded-xl2 border border-dashed border-line px-5 py-10 text-center">
        <p className="text-sm text-muted">
          Em construção. Esse módulo será definido em uma próxima versão do app.
        </p>
      </div>
    </div>
  );
}
