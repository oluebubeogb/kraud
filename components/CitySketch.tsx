// Line-art mega-city skyline for the dark navy hero.
export default function CitySketch() {
  const s = { fill: "none", strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const win = (x: number, y: number, cols: number, rows: number, dx = 10, dy = 14) =>
    Array.from({ length: cols * rows }, (_, i) => <rect key={`${x}-${y}-${i}`} x={x + (i % cols) * dx} y={y + Math.floor(i / cols) * dy} width={5} height={7} rx={0.5} />);
  return (
    <svg viewBox="0 0 520 420" className="w-full h-auto" role="img" aria-label="City skyline sketch">
      <g {...s} stroke="#8A9199" strokeOpacity={0.35} strokeWidth={1} strokeDasharray="3 5">
        <path d="M20 380 L260 60 L500 380" /><path d="M60 380 L260 120 L460 380" />
      </g>
      <g {...s} stroke="#8A9199" strokeOpacity={0.55} strokeWidth={1.2}>
        <rect x="30" y="230" width="60" height="150" /><rect x="430" y="210" width="60" height="170" />
        <path d="M100 380 V260 L130 240 L160 260 V380" />
        <g strokeOpacity={0.4}>{win(40, 245, 4, 9, 12)}{win(440, 225, 4, 10, 12)}</g>
      </g>
      <g {...s} stroke="#F7F8FA" strokeWidth={1.6}>
        <path d="M170 380 V120 L200 90 L230 120 V380" /><path d="M200 90 V55" /><circle cx="200" cy="52" r="3" />
        <path d="M245 380 V70 H300 V380" /><path d="M255 70 V50 H290 V70" /><path d="M272 50 V22" />
        <path d="M315 380 V150 L345 135 L375 150 V380" /><path d="M385 380 V185 H420 V380" />
        <g strokeOpacity={0.7} strokeWidth={1}>{win(180, 135, 4, 17, 11)}{win(253, 85, 4, 20, 12)}{win(323, 165, 4, 15, 12)}{win(392, 200, 2, 12, 14)}</g>
      </g>
      <g {...s} stroke="#1F7A72" strokeWidth={2}>
        <path d="M120 380 Q260 300 400 380" /><path d="M150 380 V355 M190 380 V335 M230 380 V325 M290 380 V325 M330 380 V335 M370 380 V355" strokeWidth={1.2} />
        <path d="M245 140 H300 M245 220 H300 M170 200 H230" strokeOpacity={0.8} />
      </g>
      <path d="M10 380 H510" stroke="#F7F8FA" strokeWidth={1.6} strokeLinecap="round" />
      <g fill="#1F7A72"><circle cx="272" cy="22" r="3" /></g>
    </svg>
  );
}
