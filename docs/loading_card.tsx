import type React from "react";
import { useId } from "react";

interface CardSkeletonProps {
  /** Number of skeleton cards to render when loading (default: 3) */
  count?: number;
  /** Controls whether skeletons or children are rendered */
  isLoading: boolean;
  /** Optional className for the outer container */
  className?: string;
  /** Optional inline styles for the outer container */
  style?: React.CSSProperties;
  /** Height of each skeleton card (default: 260) */
  cardHeight?: number | string;
  /** Actual cards to render once loading completes */
  children: React.ReactNode;
}

function SingleCardSkeleton({ height = 260 }: { height?: number | string }) {
  const uid = useId();
  const maskId = `card-mask-${uid}`;
  const gradientId = `card-shimmer-${uid}`;

  return (
    <div
      className="card-skeleton-item"
      style={{
        height,
        borderRadius: 12,
        overflow: "hidden",
        backgroundColor: "rgba(9, 87, 41, 0.08)",
        border: "1px solid rgba(9, 87, 41, 0.12)",
      }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 320 260"
        preserveAspectRatio="none"
        width="100%"
        height="100%"
        xmlns="http://www.w3.org/2000/svg"
        className="card-shimmer-svg"
        role="presentation"
      >
        <defs>
          {/* Card layout silhouette mask */}
          <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="320" height="260">
            {/* Media / header block */}
            <rect x="16" y="16" width="288" height="124" rx="8" fill="#ffffff" />
            {/* Title bar */}
            <rect x="16" y="156" width="190" height="16" rx="4" fill="#ffffff" />
            {/* Subtitle lines */}
            <rect x="16" y="184" width="268" height="12" rx="4" fill="#ffffff" />
            <rect x="16" y="204" width="220" height="12" rx="4" fill="#ffffff" />
            {/* Footer pill */}
            <rect x="16" y="228" width="96" height="16" rx="6" fill="#ffffff" />
          </mask>

          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Dim base shapes */}
        <g opacity="0.22">
          <rect x="16" y="16" width="288" height="124" rx="8" fill="#095729" />
          <rect x="16" y="156" width="190" height="16" rx="4" fill="#1E663B" />
          <rect x="16" y="184" width="268" height="12" rx="4" fill="#5FA819" />
          <rect x="16" y="204" width="220" height="12" rx="4" fill="#5FA819" />
          <rect x="16" y="228" width="96" height="16" rx="6" fill="#095729" />
        </g>

        {/* Sliding shimmer band clipped to the card silhouette */}
        <g mask={`url(#${maskId})`}>
          <rect
            className="card-shimmer-band"
            x="-180"
            y="0"
            width="180"
            height="260"
            fill={`url(#${gradientId})`}
          />
        </g>

        <style>{`
          .card-shimmer-svg .card-shimmer-band {
            animation: card-shimmer-sweep 1.8s ease-in-out infinite;
          }
          @keyframes card-shimmer-sweep {
            0%   { transform: translateX(0); }
            100% { transform: translateX(500px); }
          }
          @media (prefers-reduced-motion: reduce) {
            .card-shimmer-svg .card-shimmer-band {
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
  if (!isLoading) {
    return <>{children}</>;
  }

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
      {Array.from({ length: count }, (_, idx) => (
        <SingleCardSkeleton key={idx} height={cardHeight} />
      ))}
    </div>
  );
}
