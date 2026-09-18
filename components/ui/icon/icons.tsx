import { IconBase, type IconProps } from './IconBase';

export function MenuIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </IconBase>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M6 6l12 12M18 6L6 18" />
    </IconBase>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M5 13l4 4L19 7" />
    </IconBase>
  );
}

export function ChevronDownIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M6 9l6 6 6-6" />
    </IconBase>
  );
}

export function ChevronLeftIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M15 6l-6 6 6 6" />
    </IconBase>
  );
}

export function ChevronRightIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M9 6l6 6-6 6" />
    </IconBase>
  );
}

export function ChevronUpIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M6 15l6-6 6 6" />
    </IconBase>
  );
}

export function TrashIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4 7h16M10 4h4a1 1 0 011 1v2H9V5a1 1 0 011-1z" />
      <path d="M6 7l1 13a1 1 0 001 1h8a1 1 0 001-1l1-13" />
      <path d="M10 11v6M14 11v6" />
    </IconBase>
  );
}

export function PlusIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 5v14M5 12h14" />
    </IconBase>
  );
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </IconBase>
  );
}

export function InfoIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11.5v5M12 7.75h.01" />
    </IconBase>
  );
}

export function AlertCircleIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5v5.5M12 16.5h.01" />
    </IconBase>
  );
}

export function AlertTriangleIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 4.5L21 19.5H3z" />
      <path d="M12 10v4M12 17h.01" />
    </IconBase>
  );
}

export function ShieldCheckIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 3l7 3v5.5c0 4.3-2.9 8.3-7 9.5-4.1-1.2-7-5.2-7-9.5V6z" />
      <path d="M9 12l2 2 4-4" />
    </IconBase>
  );
}

export function UploadIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 16V4M7 9l5-5 5 5" />
      <path d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
    </IconBase>
  );
}

export function DownloadIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 4v12M7 11l5 5 5-5" />
      <path d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
    </IconBase>
  );
}

export function MergeIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4 6h2c3.5 0 3.5 6 7 6h7M4 18h2c3.5 0 3.5-6 7-6" />
      <path d="M17 9l3 3-3 3" />
    </IconBase>
  );
}

export function SplitIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4 12h7M11 12c3.5 0 3.5-6 7-6h2M11 12c3.5 0 3.5 6 7 6h2" />
      <path d="M17 3l3 3-3 3M17 15l3 3-3 3" />
    </IconBase>
  );
}

export function RotateIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M20.5 12a8.5 8.5 0 11-2.6-6.1" />
      <path d="M20.5 4v5h-5" />
    </IconBase>
  );
}

/** The mirror of `RotateIcon`, for turning anticlockwise. */
export function RotateCounterClockwiseIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M3.5 12a8.5 8.5 0 102.6-6.1" />
      <path d="M3.5 4v5h5" />
    </IconBase>
  );
}

export function ZoomInIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.8-3.8" />
      <path d="M11 8.5v5M8.5 11h5" />
    </IconBase>
  );
}

export function ZoomOutIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.8-3.8" />
      <path d="M8.5 11h5" />
    </IconBase>
  );
}

export function FitWidthIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M3 6v12M21 6v12" />
      <path d="M7 12h10M7 12l3-3M7 12l3 3M17 12l-3-3M17 12l-3 3" />
    </IconBase>
  );
}

export function CompressIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4 12h16" />
      <path d="M12 3v5M9 5.5l3 2.5 3-2.5" />
      <path d="M12 21v-5M9 18.5l3-2.5 3 2.5" />
    </IconBase>
  );
}

export function PenIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4 20h4L18.5 9.5a2.47 2.47 0 00-3.5-3.5L4.5 16.5V20z" />
      <path d="M13.5 7.5l3 3" />
    </IconBase>
  );
}

export function FileTextIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8z" />
      <path d="M14 3v5h5M9 13h6M9 17h4" />
    </IconBase>
  );
}

export function CursorIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M5 4l6.5 15 2-6.5L20 10.5 5 4z" />
    </IconBase>
  );
}

export function HighlighterIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4 18h16" />
      <path d="M7 15l3-9h4l3 9" />
      <path d="M9.5 12h5" />
    </IconBase>
  );
}

export function RectangleIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <rect x="5" y="6" width="14" height="12" rx="1" />
    </IconBase>
  );
}

export function EllipseIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <ellipse cx="12" cy="12" rx="8" ry="5.5" />
    </IconBase>
  );
}

export function LineIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M5 18L19 6" />
    </IconBase>
  );
}

export function SignatureIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4 17c2-1 3.5-4 5-4s2 3 4 3 3.5-4 5-4 2 1 2 1" />
      <path d="M4 20h16" />
    </IconBase>
  );
}

export function TypeIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M5 7V5h14v2" />
      <path d="M12 5v14M9 19h6" />
    </IconBase>
  );
}

export function UndoIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M9 14H5V10" />
      <path d="M5 12a7 7 0 117 7" />
    </IconBase>
  );
}

export function RedoIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M15 14h4V10" />
      <path d="M19 12a7 7 0 10-7 7" />
    </IconBase>
  );
}

export function SunIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 3v2M12 19v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M3 12h2M19 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
    </IconBase>
  );
}

export function MoonIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M20 14.5A7.5 7.5 0 119.5 4 6 6 0 0020 14.5z" />
    </IconBase>
  );
}

export function MonitorIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <rect x="3" y="4" width="18" height="13" rx="2" />
      <path d="M8 21h8M12 17v4" />
    </IconBase>
  );
}
