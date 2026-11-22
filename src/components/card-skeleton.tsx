"use client";

import type React from "react";
import { useId } from "react";

interface CardSkeletonProps {
  count?: number;
  isLoading: boolean;
  className?: string;
  style?: React.CSSProperties;
  cardHeight?: number | string;
  children: React.ReactNode;
}

function SingleCardSkeleton({ height = 260 }: { height?: number | string }) {
  const uid = useId();
  const maskId = `lendloop-card-mask-${uid}`;
  const gradientId = `lendloop-card-shimmer-${uid}`;

  return (
    <div
      className="card-skeleton-item rounded-2xl border border-white/8 bg-card/60 backdrop-blur-sm"
      style={{ height, overflow: "hidden" }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 320 260"
        preserveAspectRatio="none"
        width="100%"
        height="100%"
        xmlns="http://www.w3.org/2000/svg"
        role="presentation"
      >
        <defs>
          <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="320" height="260">
            <rect x="16" y="16" width="288" height="124" rx="12" fill="#fff" />
            <rect x="16" y="156" width="190" height="16" rx="6" fill="#fff" />
            <rect x="16" y="184" width="268" height="12" rx="5" fill="#fff" />
            <rect x="16" y="204" width="220" height="12" rx="5" fill="#fff" />
            <rect x="16" y="228" width="96" height="16" rx="8" fill="#fff" />
          </mask>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#fff" stopOpacity="0" />
            <stop offset="50%" stopColor="#fff" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
        </defs>
        <g opacity="0.22">
          <rect x="16" y="16" width="288" height="124" rx="12" fill="#05c2ff" />
          <rect x="16" y="156" width="190" height="16" rx="6" fill="#182799" />
          <rect x="16" y="184" width="268" height="12" rx="5" fill="#8b96c9" />
          <rect x="16" y="204" width="220" height="12" rx="5" fill="#8b96c9" />
          <rect x="16" y="228" width="96" height="16" rx="8" fill="#05c2ff" />
        </g>
        <g mask={`url(#${maskId})`}>
          <rect
            className="lendloop-card-shimmer-band"
            x="-180"
            y="0"
            width="180"
            height="260"
            fill={`url(#${gradientId})`}
          />
        </g>
        <style>{`
          .lendloop-card-shimmer-band {
            animation: lendloop-card-shimmer-sweep 1.8s ease-in-out infinite;
          }
          @keyframes lendloop-card-shimmer-sweep {
            0% { transform: translateX(0); }
            100% { transform: translateX(500px); }
          }
          @media (prefers-reduced-motion: reduce) {
            .lendloop-card-shimmer-band {
              animation: none;
              opacity: 0.6;
              transform: translateX(250px);
            }
          }
        `}</style>
      </svg>
    </div>
  );
}

export function CardSkeleton({
  count = 3,
  isLoading,
  className,
  style,
  cardHeight = 260,
  children,
}: CardSkeletonProps) {
  if (!isLoading) return <>{children}</>;

  return (
    <div
      className={className}
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
        gap: "1rem",
        ...style,
      }}
      role="status"
      aria-busy="true"
      aria-label="Loading cards"
    >
      {Array.from({ length: count }, (_, index) => (
        <SingleCardSkeleton key={index} height={cardHeight} />
      ))}
    </div>
  );
}
