export default function TopoBackground({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 1200 800"
      fill="none"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="topoFade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.16" />
          <stop offset="55%" stopColor="#ffffff" stopOpacity="0.06" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <g stroke="url(#topoFade)" strokeWidth="1">
        <path d="M-50,120 C150,60 300,180 500,110 S850,40 1250,140" />
        <path d="M-50,190 C180,130 320,250 520,180 S870,110 1250,210" />
        <path d="M-50,260 C210,200 340,320 540,250 S890,180 1250,280" />
        <path d="M-50,330 C240,270 360,390 560,320 S910,250 1250,350" />
        <path d="M-50,400 C270,340 380,460 580,390 S930,320 1250,420" />
        <path d="M-50,470 C300,410 400,530 600,460 S950,390 1250,490" />
        <path d="M-80,540 C260,600 420,480 640,560 S960,620 1260,520" />
        <path d="M-80,610 C280,670 440,550 660,630 S980,690 1260,590" />
        <path d="M-80,680 C300,740 460,620 680,700 S1000,760 1260,660" />
      </g>
      <g stroke="url(#topoFade)" strokeWidth="1" opacity="0.6">
        <path d="M700,-50 C640,150 780,260 720,450 S660,700 740,850" />
        <path d="M770,-50 C710,150 850,260 790,450 S730,700 810,850" />
        <path d="M840,-50 C780,150 920,260 860,450 S800,700 880,850" />
      </g>
    </svg>
  );
}
