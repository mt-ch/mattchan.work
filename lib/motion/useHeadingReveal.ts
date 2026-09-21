"use client";

import { useCallback, useEffect, useRef } from "react";

import gsap from "gsap";
import { SplitText } from "gsap/SplitText";

import {
  REVEAL_DURATION_MS,
  REVEAL_EASE,
  REVEAL_RISE_PX,
  REVEAL_STAGGER_MS,
} from "./constants";
import { useMotionEnvironment } from "./environment";
import {
  hasFirstLoadHeadingRevealFired,
  onFirstLoadHeadingReveal,
} from "./headingRevealSignal";
import { planHeadingReveal, type HeadingRevealTrigger } from "./revealPlan";

gsap.registerPlugin(SplitText);

/**
 * The imperative shell for the h1 split-text reveal (#227). Attach the
 * returned ref to the heading. Splits it into lines with `SplitText`
 * (`aria: "auto"`, its default, keeps the full heading text as an
 * `aria-label` on the element and marks the split spans `aria-hidden`, so a
 * screen reader reads the heading intact) and fades + rises each line in with
 * a per-line stagger, using `planHeadingReveal` for whether and when.
 *
 * The trigger comes from `headingRevealSignal`: while the first-load signal
 * has not fired yet, this heading is under the still-covered first-load panel
 * and waits for it ("firstload", no extra delay — see
 * `PageTransitionProvider`); once it has fired, a later mount is a client
 * navigation and self-times the settle delay instead ("route"). Under OS
 * reduced motion the heading is left completely untouched — no split, no
 * animation, plain text.
 */
export function useHeadingReveal() {
  const { prefersReducedMotion } = useMotionEnvironment();
  const nodeRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = nodeRef.current;
    if (!el) return;

    const trigger: HeadingRevealTrigger = hasFirstLoadHeadingRevealFired()
      ? "route"
      : "firstload";
    const plan = planHeadingReveal({ trigger, env: { prefersReducedMotion } });
    if (!plan.enabled) return;

    let split: SplitText | null = null;
    let tween: gsap.core.Tween | null = null;
    let timeoutId: number | undefined;
    let cancelled = false;

    const reveal = () => {
      if (cancelled) return;
      split = SplitText.create(el, { type: "lines" });
      gsap.set(split.lines, { opacity: 0, y: REVEAL_RISE_PX });
      tween = gsap.to(split.lines, {
        opacity: 1,
        y: 0,
        duration: REVEAL_DURATION_MS / 1000,
        ease: REVEAL_EASE,
        stagger: REVEAL_STAGGER_MS / 1000,
      });
    };

    const start = () => {
      if (plan.delayMs > 0) {
        timeoutId = window.setTimeout(reveal, plan.delayMs) as unknown as number;
      } else {
        reveal();
      }
    };

    const unsubscribe =
      trigger === "firstload" ? onFirstLoadHeadingReveal(start) : undefined;
    if (trigger === "route") start();

    return () => {
      cancelled = true;
      unsubscribe?.();
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
      tween?.kill();
      split?.revert();
    };
  }, [prefersReducedMotion]);

  return useCallback((node: HTMLElement | null) => {
    nodeRef.current = node;
  }, []);
}
