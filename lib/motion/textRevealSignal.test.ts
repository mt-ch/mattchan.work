import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  __resetFirstLoadTextRevealForTests,
  fireFirstLoadTextReveal,
  hasFirstLoadTextRevealFired,
  onFirstLoadTextReveal,
} from "./textRevealSignal";

beforeEach(() => {
  __resetFirstLoadTextRevealForTests();
});

afterEach(() => {
  __resetFirstLoadTextRevealForTests();
});

describe("textRevealSignal", () => {
  it("has not fired before anything calls fireFirstLoadTextReveal", () => {
    expect(hasFirstLoadTextRevealFired()).toBe(false);
  });

  it("notifies subscribers and flips hasFirstLoadTextRevealFired once fired", () => {
    const listener = vi.fn();
    const unsubscribe = onFirstLoadTextReveal(listener);

    fireFirstLoadTextReveal();

    expect(listener).toHaveBeenCalledTimes(1);
    expect(hasFirstLoadTextRevealFired()).toBe(true);

    unsubscribe();
  });

  it("is a one-shot signal: a second fire does not notify again", () => {
    const listener = vi.fn();
    const unsubscribe = onFirstLoadTextReveal(listener);

    fireFirstLoadTextReveal();
    fireFirstLoadTextReveal();

    expect(listener).toHaveBeenCalledTimes(1);
    unsubscribe();
  });

  it("stops notifying after unsubscribe", () => {
    const listener = vi.fn();
    const unsubscribe = onFirstLoadTextReveal(listener);
    unsubscribe();

    fireFirstLoadTextReveal();

    expect(listener).not.toHaveBeenCalled();
  });
});
