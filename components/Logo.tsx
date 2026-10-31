// Dente branco com selo de "concluído" sobre fundo verde-petróleo.
// As mesmas formas geraram os ícones do app em public/icons.
export default function Logo({ size = 40 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect width="48" height="48" rx="14" fill="#2F6F73" />
      <path
        d="M17 11 C12.5 11 9.5 14.5 9.5 19 C9.5 23 12 25 13 29.5 C14 34 14.5 38 17.5 38 C20.5 38 20.5 31.5 24 31.5 C27.5 31.5 27.5 38 30.5 38 C33.5 38 34 34 35 29.5 C36 25 38.5 23 38.5 19 C38.5 14.5 35.5 11 31 11 C28 11 26 12.5 24 12.5 C22 12.5 20 11 17 11 Z"
        fill="#FFFFFF"
      />
      <circle cx="36" cy="36" r="9" fill="#F2A65A" />
      <path
        d="M32.2 36.2l2.7 2.7 5-5.4"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
