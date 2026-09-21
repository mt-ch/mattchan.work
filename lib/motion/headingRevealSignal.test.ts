import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  __resetFirstLoadHeadingRevealForTests,
  fireFirstLoadHeadingReveal,
  hasFirstLoadHeadingRevealFired,
  onFirstLoadHeadingReveal,
} from "./headingRevealSignal";

beforeEach(() => {
  __resetFirstLoadHeadingRevealForTests();
});

afterEach(() => {
  __resetFirstLoadHeadingRevealForTests();
});

describe("headingRevealSignal", () => {
  it("has not fired before anything calls fireFirstLoadHeadingReveal", () => {
    expect(hasFirstLoadHeadingRevealFired()).toBe(false);
  });

  it("notifies subscribers and flips hasFirstLoadHeadingRevealFired once fired", () => {
    const listener = vi.fn();
    const unsubscribe = onFirstLoadHeadingReveal(listener);

    fireFirstLoadHeadingReveal();

    expect(listener).toHaveBeenCalledTimes(1);
    expect(hasFirstLoadHeadingRevealFired()).toBe(true);

    unsubscribe();
  });

  it("is a one-shot signal: a second fire does not notify again", () => {
    const listener = vi.fn();
    const unsubscribe = onFirstLoadHeadingReveal(listener);

    fireFirstLoadHeadingReveal();
    fireFirstLoadHeadingReveal();

    expect(listener).toHaveBeenCalledTimes(1);
    unsubscribe();
  });

  it("stops notifying after unsubscribe", () => {
    const listener = vi.fn();
    const unsubscribe = onFirstLoadHeadingReveal(listener);
    unsubscribe();

    fireFirstLoadHeadingReveal();

    expect(listener).not.toHaveBeenCalled();
  });
});
