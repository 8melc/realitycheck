import { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

const createIcon = (paths: JSX.Element, viewBox = '0 0 24 24') => {
  const Icon = ({ className, ...props }: IconProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={viewBox}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      {paths}
    </svg>
  );
  return Icon;
};

export const CompassIcon = createIcon(
  <>
    <circle cx="12" cy="12" r="9" />
    <polygon points="10 14 11 11 14 10 13 13" />
  </>
);

export const UsersIcon = createIcon(
  <>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </>
);

export const TargetIcon = createIcon(
  <>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="5" />
    <circle cx="12" cy="12" r="1" />
  </>
);

export const FlameIcon = createIcon(
  <>
    <path d="M12 2c2 2 3 4 3 6 0 1-.5 2-1 3a4 4 0 1 1-6 0c-.5-1-1-2-1-3 0-2 1-4 3-6" />
    <path d="M9 12a3 3 0 1 0 6 0" />
  </>
);

export const SparklesIcon = createIcon(
  <>
    <path d="M12 3v4m0 10v4m6-10h4m-20 0h4M18.36 5.64l-2.83 2.83m-6.76 6.76L6 18M5.64 5.64l2.83 2.83m6.76 6.76L18 18" />
  </>
);

export const ClockIcon = createIcon(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 3" />
  </>
);

export const GlobeIcon = createIcon(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18" />
    <path d="M12 3a15.3 15.3 0 0 1 4 9 15.3 15.3 0 0 1-4 9 15.3 15.3 0 0 1-4-9 15.3 15.3 0 0 1 4-9" />
  </>
);

export const BarChartIcon = createIcon(
  <>
    <path d="M3 3v18h18" />
    <rect x="7" y="13" width="3" height="5" rx="0.5" />
    <rect x="12" y="9" width="3" height="9" rx="0.5" />
    <rect x="17" y="5" width="3" height="13" rx="0.5" />
  </>
);

export const PenSquareIcon = createIcon(
  <>
    <path d="M8 21h8" />
    <path d="M15.5 3.5a2.12 2.12 0 1 1 3 3L7 18l-4 1 1-4Z" />
  </>
);

export const LocateIcon = createIcon(
  <>
    <circle cx="12" cy="10" r="3" />
    <path d="M12 2C8 2 4 5 4 10c0 5.25 8 12 8 12s8-6.75 8-12c0-5-4-8-8-8Z" />
  </>
);

export const ChevronRightIcon = createIcon(
  <>
    <path d="m9 18 6-6-6-6" />
  </>
);

export const MusicIcon = createIcon(
  <>
    <path d="M9 18V5l12-2v13" />
    <circle cx="6" cy="18" r="3" />
    <circle cx="18" cy="16" r="3" />
  </>
);

export const LinkIcon = createIcon(
  <>
    <path d="M10 13a5 5 0 0 0 7.54.54l1-1a5 5 0 0 0-7.07-7.07l-1 1" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-1 1a5 5 0 0 0 7.07 7.07l1-1" />
  </>
);

export const ArrowUpRightIcon = createIcon(
  <>
    <path d="M7 17 17 7" />
    <path d="M7 7h10v10" />
  </>
);

export const ListIcon = createIcon(
  <>
    <path d="M8 6h13" />
    <path d="M8 12h13" />
    <path d="M8 18h13" />
    <path d="M3 6h.01" />
    <path d="M3 12h.01" />
    <path d="M3 18h.01" />
  </>
);

export const GaugeIcon = createIcon(
  <>
    <path d="M12 14V10" />
    <path d="M12 3a9 9 0 0 0-9 9v2a9 9 0 0 0 18 0v-2a9 9 0 0 0-9-9Z" />
    <path d="m19 10-7 4-7-4" />
  </>
);

export const MessageIcon = createIcon(
  <>
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5" />
  </>
);

export const PlayIcon = createIcon(
  <>
    <path d="m7 4 14 8-14 8V4Z" />
  </>
);

export const PauseIcon = createIcon(
  <>
    <path d="M10 22V2" />
    <path d="M18 22V2" />
  </>
);

export const BadgeCheckIcon = createIcon(
  <>
    <path d="m9 12 2 2 4-4" />
    <path d="M12 21a9 9 0 1 1 9-9 9 9 0 0 1-9 9Z" />
  </>
);

export const CoinsIcon = createIcon(
  <>
    <circle cx="8" cy="8" r="6" />
    <path d="M18.09 10.37A6 6 0 1 1 6.71 18" />
    <path d="M7 6h1v4" />
    <path d="M9.5 10a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" />
    <path d="M16 8h1v4" />
    <path d="M18.5 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" />
  </>
);

export const TrendingUpIcon = createIcon(
  <>
    <polyline points="22,7 13.5,15.5 8.5,10.5 2,17" />
    <polyline points="16,7 22,7 22,13" />
  </>
);

export const GiftIcon = createIcon(
  <>
    <path d="M20 12v10H4V12" />
    <path d="M2 7h20v5H2z" />
    <path d="M12 22V7" />
    <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
    <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
  </>
);

export const ChevronDownIcon = createIcon(
  <>
    <path d="m6 9 6 6 6-6" />
  </>
);

export const ChevronUpIcon = createIcon(
  <>
    <path d="m18 15-6-6-6 6" />
  </>
);