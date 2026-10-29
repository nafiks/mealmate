// Inline SVG icon set — stroke inherits currentColor.
const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

const Svg = ({ size = 16, children, ...rest }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" {...base} {...rest}>
    {children}
  </svg>
)

export const IconClock = (p) => (
  <Svg {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></Svg>
)
export const IconFlame = (p) => (
  <Svg {...p}><path d="M12 3s5 4.5 5 9a5 5 0 0 1-10 0c0-1.5.5-3 1.5-4.5.3 1.2 1 2 2 2.5C10 8 10.5 5 12 3z" /></Svg>
)
export const IconServings = (p) => (
  <Svg {...p}><path d="M4 21v-5a8 8 0 0 1 16 0v5" /><path d="M4 21h16" /></Svg>
)
export const IconSearch = (p) => (
  <Svg {...p}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></Svg>
)
export const IconArrowRight = (p) => (
  <Svg {...p}><path d="M4 12h15" /><path d="m13 6 6 6-6 6" /></Svg>
)
export const IconArrowLeft = (p) => (
  <Svg {...p}><path d="M20 12H5" /><path d="m11 6-6 6 6 6" /></Svg>
)
export const IconCheck = (p) => (
  <Svg {...p} strokeWidth={3}><path d="m4.5 12.5 5 5 10-11" /></Svg>
)
export const IconPlus = (p) => (
  <Svg {...p}><path d="M12 5v14" /><path d="M5 12h14" /></Svg>
)
export const IconX = (p) => (
  <Svg {...p}><path d="m6 6 12 12" /><path d="m18 6-12 12" /></Svg>
)
export const IconCamera = (p) => (
  <Svg {...p}><path d="M4 8h3l2-3h6l2 3h3v12H4z" /><circle cx="12" cy="13" r="3.5" /></Svg>
)
export const IconHeart = ({ filled, ...p }) => (
  <Svg {...p} fill={filled ? 'currentColor' : 'none'}>
    <path d="M12 20s-7-4.6-9-9c-1.2-2.7.4-6 3.5-6 2 0 3.5 1.2 4.5 3 1-1.8 2.5-3 4.5-3 3.1 0 4.7 3.3 3.5 6-2 4.4-7 9-7 9z" />
  </Svg>
)
export const IconUser = (p) => (
  <Svg {...p}><circle cx="12" cy="8" r="4" /><path d="M4 21c1.5-4 5-6 8-6s6.5 2 8 6" /></Svg>
)
export const IconLogout = (p) => (
  <Svg {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="m16 17 5-5-5-5" /><path d="M21 12H9" /></Svg>
)
export const IconCopy = (p) => (
  <Svg {...p}><rect x="9" y="9" width="12" height="12" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></Svg>
)
export const IconTrash = (p) => (
  <Svg {...p}><path d="M4 7h16" /><path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /><path d="M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13" /></Svg>
)
export const IconChevron = (p) => (
  <Svg {...p}><path d="m6 9 6 6 6-6" /></Svg>
)
export const IconSpark = (p) => (
  <Svg {...p}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8" /></Svg>
)
