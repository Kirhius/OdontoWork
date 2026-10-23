"use client";

export default function PaidButton({
  pago,
  onClick,
}: {
  pago: boolean;
  onClick: () => void;
}) {
  const rotulo = pago ? "Desfazer pagamento" : "Marcar como pago";

  return (
    <button
      onClick={onClick}
      aria-label={rotulo}
      title={rotulo}
      className={`w-8 h-8 flex items-center justify-center rounded-full shrink-0 ${
        pago
          ? "bg-mint text-mint-ink"
          : "text-muted hover:bg-mint/40 hover:text-mint-ink"
      }`}
    >
      <span className="text-base font-semibold leading-none">$</span>
    </button>
  );
}
