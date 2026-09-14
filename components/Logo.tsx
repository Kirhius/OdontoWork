export default function Logo({ size = 40 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect width="48" height="48" rx="14" fill="#A9DED2" />
      <rect x="14" y="12.5" width="20" height="11" rx="5.5" fill="#1F4A40" />
      <rect x="16.5" y="20" width="6" height="12" rx="3" fill="#1F4A40" />
      <rect x="25.5" y="20" width="6" height="12" rx="3" fill="#1F4A40" />
      <rect x="22.5" y="23.5" width="3" height="3.5" fill="#A9DED2" />
      <path
        d="M18.5 17.6l2.3 2.3 5.2-5.2"
        fill="none"
        stroke="#A9DED2"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
