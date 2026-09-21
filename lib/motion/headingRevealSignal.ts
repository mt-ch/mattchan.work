"use client";

// One-shot signal that sequences the h1 split-text reveal (#227) into the
// existing first-load panel lift. `PageTransitionProvider` fires this once,
// the moment the panel starts uncovering — itself already gated on
// `document.fonts.ready` (see PageTransitionProvider) — so any heading
// mounted under the still-covered panel waits for it rather than timing
// itself.
//
// `useHeadingReveal` uses `hasFired` to decide which trigger a heading gets:
// while the signal has not fired yet, the heading is part of this first load
// and should wait for it ("firstload"); once it has fired, a later mount is a
// client navigation and self-times its own settle delay instead ("route").
//
// A window event rather than React context keeps PageTransitionProvider and
// the headings it does not render decoupled, mirroring the PAGE_COVERED_ATTR
// pattern it already uses for the custom cursor.

const EVENT_NAME = "motion:firstload-heading-reveal";

let fired = false;

/** Fire the signal once. Later calls are no-ops. */
export function fireFirstLoadHeadingReveal() {
  if (fired) return;
  fired = true;
  if (typeof window !== "undefined") window.dispatchEvent(new Event(EVENT_NAME));
}

/** Whether the signal has already fired this session. */
export function hasFirstLoadHeadingRevealFired(): boolean {
  return fired;
}

/** Subscribe to the signal. Returns an unsubscribe function. */
export function onFirstLoadHeadingReveal(listener: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(EVENT_NAME, listener);
  return () => window.removeEventListener(EVENT_NAME, listener);
}

/** Test-only: reset the module-level signal between tests. */
export function __resetFirstLoadHeadingRevealForTests() {
  fired = false;
}
