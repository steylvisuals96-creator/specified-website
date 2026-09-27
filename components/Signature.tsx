// Placeholder tot Tom en Simon hun echte handtekening aanleveren (DESIGN.md).
// pathLength={1} laat de CSS het tekenen animeren zonder de padlengte te kennen.
export default function Signature({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 560 160"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        pathLength={1}
        d="M8 132 C 40 96, 70 40, 92 36 C 112 32, 104 96, 86 118 C 70 138, 60 104, 96 86
           C 128 70, 140 64, 150 76 C 160 90, 142 112, 150 116 C 160 120, 178 84, 194 70
           C 204 62, 206 84, 198 102 C 192 118, 206 118, 220 100 C 236 80, 246 62, 262 60
           C 276 58, 268 88, 280 92 C 294 96, 306 70, 322 62 C 336 56, 330 84, 344 86
           C 380 88, 460 52, 552 30"
      />
    </svg>
  );
}
