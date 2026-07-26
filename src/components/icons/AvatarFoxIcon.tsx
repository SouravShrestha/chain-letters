import type { SVGProps } from "react";

type Props = SVGProps<SVGSVGElement>;

export function AvatarFoxIcon({ ...props }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      aria-hidden="true"
      {...props}
    >
      {/* Face background */}
      <rect x="2" y="2" width="96" height="96" fill="var(--background)" stroke="currentColor" strokeWidth="3" />

      {/* Pointy ears (triangles in corners) */}
      <polygon points="2,2 2,30 24,2" fill="currentColor" />
      <polygon points="98,2 98,30 76,2" fill="currentColor" />

      {/* Ear inner detail */}
      <polygon points="4,4 4,22 18,4" fill="var(--background)" opacity="0.35" />
      <polygon points="96,4 96,22 82,4" fill="var(--background)" opacity="0.35" />

      {/* Left eye — angular / almond shaped */}
      <path d="M24 42 L35 38 L46 42 L35 48 Z" fill="currentColor" />
      <circle cx="35" cy="43" r="2.5" fill="var(--background)" />

      {/* Right eye */}
      <path d="M54 42 L65 38 L76 42 L65 48 Z" fill="currentColor" />
      <circle cx="65" cy="43" r="2.5" fill="var(--background)" />

      {/* Snout — rounded rectangle lower-centre */}
      <rect x="36" y="56" width="28" height="18" rx="9" ry="9" fill="currentColor" />

      {/* Nose */}
      <ellipse cx="50" cy="58" rx="5" ry="3.5" fill="var(--background)" />

      {/* Mouth */}
      <path d="M44 66 Q50 72 56 66" fill="none" stroke="var(--background)" strokeWidth="2" strokeLinecap="round" />

      {/* Cheek stripes */}
      <path d="M14 58 Q22 55 28 60" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M14 64 Q22 61 28 66" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M86 58 Q78 55 72 60" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M86 64 Q78 61 72 66" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}
