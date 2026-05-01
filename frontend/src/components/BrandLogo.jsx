export default function BrandLogo({ size = 36 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="lg1" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6366f1"/>
          <stop offset="100%" stopColor="#a855f7"/>
        </linearGradient>
      </defs>

      <rect width="40" height="40" rx="10" fill="url(#lg1)"/>

      <circle cx="12" cy="13.5" r="3.5" fill="rgba(255,255,255,0.55)"/>
      <path d="M5 25c0-3.5 3.1-6.5 7-6.5" stroke="rgba(255,255,255,0.55)" strokeWidth="2" strokeLinecap="round"/>

      <circle cx="24" cy="13.5" r="3.5" fill="rgba(255,255,255,0.55)"/>
      <path d="M31 25c0-3.5-3.1-6.5-7-6.5" stroke="rgba(255,255,255,0.55)" strokeWidth="2" strokeLinecap="round"/>

      <circle cx="18" cy="12" r="4.5" fill="white"/>
      <path d="M10 26c0-4.4 3.6-8 8-8s8 3.6 8 8" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>

      <rect x="23" y="23" width="15" height="14" rx="3" fill="white"/>
      <rect x="27.5" y="21.5" width="6" height="3.5" rx="1.5" fill="white"/>
      <rect x="28.5" y="21" width="4" height="3" rx="1" fill="#6366f1"/>

      <polyline points="25.5,28 26.8,29.3 29,27" stroke="#6366f1" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="30" y1="28" x2="36" y2="28" stroke="#a0a0b8" strokeWidth="1.2" strokeLinecap="round"/>

      <polyline points="25.5,31.5 26.8,32.8 29,30.5" stroke="#a855f7" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="30" y1="31.5" x2="36" y2="31.5" stroke="#a0a0b8" strokeWidth="1.2" strokeLinecap="round"/>

      <rect x="25" y="33.5" width="3" height="2.5" rx="0.8" stroke="#c4c4d4" strokeWidth="1" fill="none"/>
      <line x1="30" y1="34.8" x2="35" y2="34.8" stroke="#c4c4d4" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  );
}
