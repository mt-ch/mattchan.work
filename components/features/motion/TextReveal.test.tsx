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

import { TextReveal } from "./TextReveal";
import {
  __resetFirstLoadTextRevealForTests,
  fireFirstLoadTextReveal,
} from "@/lib/motion/textRevealSignal";

beforeEach(() => {
  __resetFirstLoadTextRevealForTests();
  splitCreate.mockClear();
  gsapTo.mockClear();
  gsapSet.mockClear();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("TextReveal", () => {
  it("renders as an h1 by default with its children intact", () => {
    stubReducedMotion(false);

    render(<TextReveal>Hello world</TextReveal>);

    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveTextContent("Hello world");
  });

  it("renders as the given element", () => {
    stubReducedMotion(false);

    render(<TextReveal as="span">[Matt Chan]</TextReveal>);

    const span = screen.getByText("[Matt Chan]");
    expect(span.tagName).toBe("SPAN");
  });

  it("does not split under reduced motion, whatever the trigger", () => {
    stubReducedMotion(true);

    render(<TextReveal>Reduced</TextReveal>);
    fireFirstLoadTextReveal();

    expect(splitCreate).not.toHaveBeenCalled();
  });

  it("waits for the first-load signal before splitting when mounted before it fires", () => {
    stubReducedMotion(false);

    render(<TextReveal>Firstload heading</TextReveal>);

    expect(splitCreate).not.toHaveBeenCalled();

    fireFirstLoadTextReveal();

    expect(splitCreate).toHaveBeenCalledTimes(1);
    expect(gsapTo).toHaveBeenCalledTimes(1);
  });

  it("self-times a settle delay and splits without the signal once first load has already fired", () => {
    vi.useFakeTimers();
    stubReducedMotion(false);

    fireFirstLoadTextReveal();
    splitCreate.mockClear();

    render(<TextReveal>Project title</TextReveal>);

    expect(splitCreate).not.toHaveBeenCalled();

    vi.runAllTimers();

    expect(splitCreate).toHaveBeenCalledTimes(1);
    expect(gsapTo).toHaveBeenCalledTimes(1);
  });

  it("splits with the mask option so each line reveals from behind its own mask", () => {
    stubReducedMotion(false);

    render(<TextReveal>Masked line reveal</TextReveal>);
    fireFirstLoadTextReveal();

    expect(splitCreate).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ mask: "lines" }),
    );
  });
});
