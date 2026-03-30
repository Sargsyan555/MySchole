import type { ComponentType, SVGProps } from 'react';

export type SiteIconComponent = ComponentType<SVGProps<SVGSVGElement>>;

const stroke = {
  fill: 'none' as const,
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

type IconProps = SVGProps<SVGSVGElement>;

function baseProps(props: IconProps) {
  const { className, ...rest } = props;
  return {
    className,
    viewBox: '0 0 24 24',
    xmlns: 'http://www.w3.org/2000/svg',
    'aria-hidden': true as const,
    ...stroke,
    ...rest,
  };
}

/** School building — about us, “our school” */
export function IconSchool(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="m4 6 8-4 8 4" />
      <path d="m18 10 4 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-8l4-2" />
      <path d="M10 6v7" />
      <path d="M14 6v7" />
    </svg>
  );
}

/** Teachers / staff — graduation cap */
export function IconGraduationCap(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12 3.11 2.58 9.084a1 1 0 0 0 0 1.832l9.006 5.054a2 2 0 0 0 1.958 0l9.006-5.054a1 1 0 0 0 0-1.838z" />
      <path d="M22 10v6" />
      <path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5" />
    </svg>
  );
}

/** Document / PDF */
export function IconFileText(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <path d="M10 9H8" />
      <path d="M16 13H8" />
      <path d="M16 17H8" />
    </svg>
  );
}

/** Events / calendar */
export function IconCalendar(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M3 10h18" />
    </svg>
  );
}

/** Announcements */
export function IconMegaphone(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="m3 11 18-5v12L3 14v-3z" />
      <path d="M11.6 16.8a3 3 0 1 1 5.8-1.6" />
    </svg>
  );
}

/** Attachment (admin) */
export function IconPaperclip(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 1 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
    </svg>
  );
}
