import {
  REVEAL_DURATION_MS,
  REVEAL_EASE,
  REVEAL_RISE_PX,
  REVEAL_STAGGER_MS,
  REVEAL_THRESHOLD_RATIO,
  TEXT_REVEAL_ROUTE_DELAY_MS,
} from "./constants";
import type { MotionEnvironment } from "./environment";

export interface SectionRevealPlan {
  /** Whether the reveal animates at all. `false` under OS "reduce motion". */
  enabled: boolean;
  /** Per-child delay for a multi-item group; `0` for a single element. */
  staggerMs: number;
  /** How far, in px, the content rises into place. */
  risePx: number;
  /** How long the fade/rise runs, in ms. */
  durationMs: number;
  /** The transition easing (a CSS timing function). */
  ease: string;
  /** Viewport-height fraction the section's top crosses before it reveals. */
  thresholdRatio: number;
}

/**
 * The pure decision seam for reveal-on-scroll (#226). Given how many items a
 * section reveals and the motion environment, returns whether to animate and
 * the timing to animate with. The IntersectionObserver wiring is the
 * imperative shell around this — see `useSectionReveal`.
 *
 * A single element (`childCount <= 1`) animates as one block with no stagger.
 * A multi-item group cascades its children by `REVEAL_STAGGER_MS` each. Under
 * reduced motion nothing animates and content is simply present.
 */
export function planSectionReveal({
  childCount,
  env,
}: {
  childCount: number;
  env: Pick<MotionEnvironment, "prefersReducedMotion">;
}): SectionRevealPlan {
  const enabled = !env.prefersReducedMotion;

  return {
    enabled,
    staggerMs: enabled && childCount > 1 ? REVEAL_STAGGER_MS : 0,
    risePx: REVEAL_RISE_PX,
    durationMs: REVEAL_DURATION_MS,
    ease: REVEAL_EASE,
    thresholdRatio: REVEAL_THRESHOLD_RATIO,
  };
}

/** How a text reveal was set off. See `planTextReveal`. */
export type TextRevealTrigger = "firstload" | "route";

export interface TextRevealPlan {
  /** Whether the split/reveal runs at all. `false` under OS "reduce motion" —
   * the element renders plain, with no split and no animation. */
  enabled: boolean;
  /** How long to wait, in ms, before the reveal starts. */
  delayMs: number;
}

/**
 * The pure decision seam for the masked line-reveal shared by primary
 * headings and the nav's `[name]` text (#227, refined by #233). Given how the
 * reveal was set off and the motion environment, returns whether to animate
 * and how long to wait first. The SplitText/GSAP wiring is the imperative
 * shell around this — see `useTextReveal`.
 *
 * `"firstload"` needs no extra delay: it is already sequenced into the
 * first-load panel lift in `PageTransitionProvider`, itself gated on
 * `document.fonts.ready`. `"route"` — an element arriving via client
 * navigation — waits `TEXT_REVEAL_ROUTE_DELAY_MS` so it plays once the page
 * has settled rather than during the view-transition page push. Under
 * reduced motion nothing splits and the element is simply present, exactly as
 * `planSectionReveal` leaves scroll-reveal content present.
 */
export function planTextReveal({
  trigger,
  env,
}: {
  trigger: TextRevealTrigger;
  env: Pick<MotionEnvironment, "prefersReducedMotion">;
}): TextRevealPlan {
  return {
    enabled: !env.prefersReducedMotion,
    delayMs: trigger === "route" ? TEXT_REVEAL_ROUTE_DELAY_MS : 0,
  };
}
