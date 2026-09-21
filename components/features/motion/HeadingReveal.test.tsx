import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const splitCreate = vi.fn();
const gsapTo = vi.fn();
const gsapSet = vi.fn();

vi.mock("gsap", () => ({
  default: {
    registerPlugin: vi.fn(),
    set: (...args: unknown[]) => gsapSet(...args),
    to: (...args: unknown[]) => {
      gsapTo(...args);
      return { kill: vi.fn() };
    },
  },
}));

vi.mock("gsap/SplitText", () => ({
  SplitText: {
    create: (...args: unknown[]) => {
      splitCreate(...args);
      return { lines: ["line-stub"], revert: vi.fn() };
    },
  },
}));

function stubReducedMotion(matches: boolean) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockImplementation((query: string) => ({
      matches: query.includes("reduced-motion") ? matches : false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
}

import { HeadingReveal } from "./HeadingReveal";
import {
  __resetFirstLoadHeadingRevealForTests,
  fireFirstLoadHeadingReveal,
} from "@/lib/motion/headingRevealSignal";

beforeEach(() => {
  __resetFirstLoadHeadingRevealForTests();
  splitCreate.mockClear();
  gsapTo.mockClear();
  gsapSet.mockClear();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("HeadingReveal", () => {
  it("renders as an h1 by default with its children intact", () => {
    stubReducedMotion(false);

    render(<HeadingReveal>Hello world</HeadingReveal>);

    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveTextContent("Hello world");
  });

  it("does not split under reduced motion, whatever the trigger", () => {
    stubReducedMotion(true);

    render(<HeadingReveal>Reduced</HeadingReveal>);
    fireFirstLoadHeadingReveal();

    expect(splitCreate).not.toHaveBeenCalled();
  });

  it("waits for the first-load signal before splitting when mounted before it fires", () => {
    stubReducedMotion(false);

    render(<HeadingReveal>Firstload heading</HeadingReveal>);

    expect(splitCreate).not.toHaveBeenCalled();

    fireFirstLoadHeadingReveal();

    expect(splitCreate).toHaveBeenCalledTimes(1);
    expect(gsapTo).toHaveBeenCalledTimes(1);
  });

  it("self-times a settle delay and splits without the signal once first load has already fired", () => {
    vi.useFakeTimers();
    stubReducedMotion(false);

    fireFirstLoadHeadingReveal();
    splitCreate.mockClear();

    render(<HeadingReveal>Project title</HeadingReveal>);

    expect(splitCreate).not.toHaveBeenCalled();

    vi.runAllTimers();

    expect(splitCreate).toHaveBeenCalledTimes(1);
    expect(gsapTo).toHaveBeenCalledTimes(1);
  });
});
