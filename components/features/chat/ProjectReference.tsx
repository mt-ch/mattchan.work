import type { ProjectReference as ProjectReferenceData } from "@/lib/assistant/chat/types";

interface ProjectReferenceProps {
  reference: ProjectReferenceData;
}

// Variant B — stacked poster: a full-width 16:9 cover, then title, one-line
// summary, and a "View the project →" affordance. The whole block is one link
// to the Project page. When there's no cover image it degrades to just the
// title, summary, and link.
export function ProjectReference({ reference }: ProjectReferenceProps) {
  const { slug, title, summary, imageUrl } = reference;

  return (
    <a
      href={`/projects/${slug}`}
      data-cursor="label"
      data-cursor-label="View Project"
      data-cursor-icon="eye"
      className="group bg-background border-grey-200 dark:border-grey-700 block border"
      data-testid="project-reference"
    >
      {imageUrl && (
        // A plain <img>: the src is a pre-sized Sanity CDN URL baked into the
        // chunk metadata at index time, and the card is a small decorative
        // element in the chat drawer, not an LCP candidate.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt=""
          aria-hidden="true"
          className="aspect-video w-full object-cover"
        />
      )}
      <span className="gap-2xs p-sm flex flex-col">
        <span className="type-small font-medium text-black dark:text-white">
          [{title}]
        </span>
        {summary && (
          <span className="type-small text-grey-500 dark:text-grey-400 font-medium">
            {summary}
          </span>
        )}
      </span>
    </a>
  );
}
