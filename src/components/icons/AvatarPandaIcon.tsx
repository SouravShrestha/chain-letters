import type { SVGProps } from "react";

type Props = SVGProps<SVGSVGElement>;

export function AvatarPandaIcon({ ...props }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      aria-hidden="true"
      {...props}
    >
      {/* Face background */}
      <rect x="2" y="2" width="96" height="96" fill="var(--background)" stroke="currentColor" strokeWidth="3" />

      {/* Ears (pointy triangles in corners) */}
      <polygon points="2,2 2,30 24,2" fill="currentColor" />
      <polygon points="98,2 98,30 76,2" fill="currentColor" />

      {/* Ear inner detail */}
      <polygon points="4,4 4,22 18,4" fill="var(--background)" opacity="0.35" />
      <polygon points="96,4 96,22 82,4" fill="var(--background)" opacity="0.35" />

      {/* Left eyebrow */}
      <path d="M28 32 Q34 26 42 30" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      {/* Right eyebrow */}
      <path d="M58 30 Q66 26 72 32" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />

      {/* Left eye */}
      <circle cx="35" cy="44" r="3" fill="currentColor" />
      {/* Right eye */}
      <circle cx="65" cy="44" r="3" fill="currentColor" />

      {/* Nose bridge */}
      <path d="M50 52 L50 62" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      {/* Nose */}
      <path d="M46 62 Q50 65 54 62" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />

      {/* Mustache */}
      <path
        d="M22 72 Q32 64 44 70 Q50 74 56 70 Q68 64 78 72 Q68 82 56 77 Q50 74 44 77 Q32 82 22 72 Z"
        fill="currentColor"
      />
    </svg>
  );
}
