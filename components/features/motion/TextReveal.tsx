"use client";

import type { ElementType, ReactNode } from "react";

import { useTextReveal } from "@/lib/motion/useTextReveal";

/**
 * Client boundary for the masked line-reveal shared by primary headings and
 * the nav's `[name]` text (#227, refined by #233). Wrap an element so it
 * splits into lines and slides up from behind a hard mask — on first load,
 * sequenced into the panel lift; on a client navigation, ~800ms after mount.
 * Only ever wrap a primary heading or the nav text with this — body copy is
 * never split.
 *
 * Renders a single element (`as`, default `h1`) so it can stand in for
 * whatever it replaces. Carries no reveal markup or classes of its own; the
 * split and animation are driven imperatively by `useTextReveal`.
 */
export function TextReveal({
  as: Tag = "h1",
  className,
  children,
}: {
  as?: ElementType;
  className?: string;
  children: ReactNode;
}) {
  const ref = useTextReveal();

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
