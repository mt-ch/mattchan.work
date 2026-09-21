"use client";

import type { ElementType, ReactNode } from "react";

import { useHeadingReveal } from "@/lib/motion/useHeadingReveal";

/**
 * Client boundary for the h1 split-text reveal (#227). Wrap a page's primary
 * heading so it splits into lines and fades + rises in — on first load,
 * sequenced into the panel lift; on a client navigation, ~800ms after mount.
 * Only ever wrap a heading with this — body copy is never split.
 *
 * Renders a single element (`as`, default `h1`) so it can stand in for the
 * heading it replaces. Carries no reveal markup or classes of its own; the
 * split and animation are driven imperatively by `useHeadingReveal`.
 */
export function HeadingReveal({
  as: Tag = "h1",
  className,
  children,
}: {
  as?: ElementType;
  className?: string;
  children: ReactNode;
}) {
  const ref = useHeadingReveal();

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
