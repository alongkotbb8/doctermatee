const props = (size: number, color: string) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: color,
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
});

export function IconSearch({ size = 20, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg {...props(size, color)}>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m15.5 15.5 4.5 4.5" />
    </svg>
  );
}

export function IconUser({ size = 22, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg {...props(size, color)}>
      <circle cx="12" cy="8" r="4" />
      <path d="M5 20c0-3.3 3.1-6 7-6s7 2.7 7 6" />
    </svg>
  );
}

export function IconCart({ size = 22, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg {...props(size, color)}>
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}

export function IconMenu({ size = 20, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg {...props(size, color)} strokeWidth={2}>
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

export function IconStethoscope({ size = 22, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg {...props(size, color)}>
      <path d="M6 2v6a6 6 0 0 0 12 0V2" />
      <circle cx="6" cy="2" r="1" fill={color} stroke="none" />
      <circle cx="18" cy="2" r="1" fill={color} stroke="none" />
      <path d="M12 14v3a4 4 0 0 0 8 0v-1" />
      <circle cx="20" cy="16" r="2" />
    </svg>
  );
}

export function IconPill({ size = 26, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg {...props(size, color)}>
      <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" />
      <line x1="8.5" y1="8.5" x2="15.5" y2="15.5" />
    </svg>
  );
}

export function IconFlask({ size = 26, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg {...props(size, color)}>
      <path d="M9 3h6" />
      <path d="M10 3v6l-4.5 8a1 1 0 0 0 .9 1.5h11.2a1 1 0 0 0 .9-1.5L14 9V3" />
      <path d="M7.5 14h9" />
    </svg>
  );
}

export function IconSparkles({ size = 26, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg {...props(size, color)}>
      <path d="M12 3v1m0 16v1M3 12h1m16 0h1m-2.64-6.36-.7.7M6.34 17.66l-.7.7m0-12.72.7.7m11.32 11.32.7.7" />
      <circle cx="12" cy="12" r="4" />
      <path d="m17 3 1 2 2 1-2 1-1 2-1-2-2-1 2-1Z" />
    </svg>
  );
}

export function IconBaby({ size = 26, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg {...props(size, color)}>
      <circle cx="12" cy="6" r="3" />
      <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" />
      <path d="M7 9c-1.5 0-3 1-3 3" />
      <path d="M17 9c1.5 0 3 1 3 3" />
    </svg>
  );
}

export function IconHeartPulse({ size = 26, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg {...props(size, color)}>
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
      <path d="M3.22 12H9.5l1.5-3 2 6 1.5-3h6.78" />
    </svg>
  );
}

export function IconLeaf({ size = 20, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg {...props(size, color)}>
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
    </svg>
  );
}

export function IconShield({ size = 20, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg {...props(size, color)}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

export function IconTruck({ size = 20, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg {...props(size, color)}>
      <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
      <path d="M15 18H9" />
      <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
      <circle cx="17" cy="18" r="2" />
      <circle cx="7" cy="18" r="2" />
    </svg>
  );
}

export function IconStar({ size = 16, color = "currentColor", filled = false }: { size?: number; color?: string; filled?: boolean }) {
  return (
    <svg {...props(size, color)} fill={filled ? color : "none"}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

export function IconArrowRight({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg {...props(size, color)} strokeWidth={2.5}>
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

export function IconTag({ size = 18, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg {...props(size, color)}>
      <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42Z" />
      <circle cx="7.5" cy="7.5" r="1.5" fill={color} stroke="none" />
    </svg>
  );
}

export function IconPhone({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg {...props(size, color)}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 6 6l.87-.87a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92Z" />
    </svg>
  );
}

export function IconMail({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg {...props(size, color)}>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

export function IconClock({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg {...props(size, color)}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  );
}

export function IconPlus({ size = 20, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg {...props(size, color)} strokeWidth={2.5}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function IconMinus({ size = 20, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg {...props(size, color)} strokeWidth={2.5}>
      <path d="M5 12h14" />
    </svg>
  );
}

export function IconTrash({ size = 18, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg {...props(size, color)}>
      <path d="M3 6h18" />
      <path d="M19 6 18 20a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

export function IconCreditCard({ size = 22, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg {...props(size, color)}>
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <line x1="2" y1="10" x2="22" y2="10" />
      <path d="M7 15h2M11 15h4" />
    </svg>
  );
}

export function IconQr({ size = 22, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg {...props(size, color)}>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="5" y="5" width="3" height="3" fill={color} stroke="none" />
      <rect x="16" y="5" width="3" height="3" fill={color} stroke="none" />
      <rect x="5" y="16" width="3" height="3" fill={color} stroke="none" />
      <path d="M14 14h2v2h-2zM18 14h2v2h-2zM16 16h2v2h-2zM14 18h2v2h-2zM18 18h2v2h-2z" fill={color} stroke="none" />
    </svg>
  );
}

export function IconCheck({ size = 20, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg {...props(size, color)} strokeWidth={2.5}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export function IconX({ size = 20, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg {...props(size, color)} strokeWidth={2.5}>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

export function IconPackage({ size = 20, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg {...props(size, color)}>
      <path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73Z" />
      <path d="M12 22V12" />
      <path d="m3.3 7 7.703 4.734a2 2 0 0 0 1.994 0L20.7 7" />
      <path d="m7.5 4.27 9 5.15" />
    </svg>
  );
}

export function IconChevronDown({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg {...props(size, color)} strokeWidth={2.5}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function IconBarChart({ size = 20, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg {...props(size, color)}>
      <line x1="12" y1="20" x2="12" y2="10" />
      <line x1="18" y1="20" x2="18" y2="4" />
      <line x1="6" y1="20" x2="6" y2="16" />
    </svg>
  );
}

export function IconSettings({ size = 20, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg {...props(size, color)}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
    </svg>
  );
}

export function IconEdit({ size = 18, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg {...props(size, color)}>
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4Z" />
    </svg>
  );
}

export function IconImage({ size = 20, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg {...props(size, color)}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="m21 15-5-5L5 21" />
    </svg>
  );
}

export function IconUpload({ size = 20, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg {...props(size, color)}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

export function IconLogOut({ size = 20, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg {...props(size, color)}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}
