import type { About } from "@/lib/sanity";

import { TextReveal } from "@/components/features/motion/TextReveal";
import { TransitionLink } from "@/components/features/transition/TransitionLink";

export function SiteNav({ about }: { about: About }) {
  return (
    <header>
      <TransitionLink
        href="/"
        className="fixed z-10 top-md left-md text-brand type-body font-medium"
        data-cursor="link"
      >
        <TextReveal as="span">[{about.name}]</TextReveal>
      </TransitionLink>
    </header>
  );
}
