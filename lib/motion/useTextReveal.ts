"use client";

import { useCallback, useEffect, useRef } from "react";

import gsap from "gsap";
import { SplitText } from "gsap/SplitText";

import {
  TEXT_REVEAL_DURATION_MS,
  TEXT_REVEAL_EASE,
  TEXT_REVEAL_STAGGER_MS,
} from "./constants";
import { useMotionEnvironment } from "./environment";
import {
  hasFirstLoadTextRevealFired,
  onFirstLoadTextReveal,
} from "./textRevealSignal";
import { planTextReveal, type TextRevealTrigger } from "./revealPlan";

gsap.registerPlugin(SplitText);

/**
 * The imperative shell for the masked line-reveal shared by primary headings
 * and the nav's `[name]` text (#227, refined by #233). Attach the returned
 * ref to the element. Splits it into lines with `SplitText`'s `mask: "lines"`
 * option — which wraps each line in its own `overflow: clip` box, the
 * masking mechanism itself, no hand-rolled wrapper markup — and slides each
 * line up its own full height into place with a per-line stagger, using
 * `planTextReveal` for whether and when. No opacity is set or animated at any
 * point: this is a hard-masked slide, not a fade.
 *
 * `aria: "auto"` (SplitText's default) keeps the full text as an
 * `aria-label` on the element and marks every split line `aria-hidden`, so a
 * screen reader reads the element intact regardless of the split.
 *
 * The trigger comes from `textRevealSignal`: while the first-load signal has
 * not fired yet, this element is under the still-covered first-load panel
 * and waits for it ("firstload", no extra delay — see
 * `PageTransitionProvider`); once it has fired, a later mount is a client
 * navigation and self-times the settle delay instead ("route"). Under OS
 * reduced motion the element is left completely untouched — no split, no
 * animation, plain text.
 */
export function useTextReveal() {
  const { prefersReducedMotion } = useMotionEnvironment();
  const nodeRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = nodeRef.current;
    if (!el) return;

    const trigger: TextRevealTrigger = hasFirstLoadTextRevealFired()
      ? "route"
      : "firstload";
    const plan = planTextReveal({ trigger, env: { prefersReducedMotion } });
    if (!plan.enabled) return;

    let split: SplitText | null = null;
    let tween: gsap.core.Tween | null = null;
    let timeoutId: number | undefined;
    let cancelled = false;

    const reveal = () => {
      if (cancelled) return;
      split = SplitText.create(el, { type: "lines", mask: "lines" });
      gsap.set(split.lines, { yPercent: 100 });
      tween = gsap.to(split.lines, {
        yPercent: 0,
        duration: TEXT_REVEAL_DURATION_MS / 1000,
        ease: TEXT_REVEAL_EASE,
        stagger: TEXT_REVEAL_STAGGER_MS / 1000,
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
      trigger === "firstload" ? onFirstLoadTextReveal(start) : undefined;
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
