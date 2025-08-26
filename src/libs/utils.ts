import { IMedia } from "../types/Project";

export const sortedMedia = ({
  media,
  setPreviewInFirstPlace = false,
}: {
  media: IMedia[];
  setPreviewInFirstPlace?: boolean;
}) => {
  const previews: IMedia[] = media.filter((item) => item.isPreview);
  const nonPreviews: IMedia[] = media.filter((item) => !item.isPreview);

  const grouped: Record<string, IMedia[]> = nonPreviews.reduce((acc, item) => {
    const tags =
      item.type === "image" ? item.image?.tags || [] : item.video?.tags || [];

    if (tags.length > 0) {
      tags.forEach((tag) => {
        if (!acc[tag]) {
          acc[tag] = [];
        }
        acc[tag].push(item);
      });
    } else {
      if (!acc["untagged"]) {
        acc["untagged"] = [];
      }
      acc["untagged"].push(item);
    }
    return acc;
  }, {} as Record<string, IMedia[]>);

  const sortedArray: IMedia[] = Object.keys(grouped)
    .sort()
    .reduce((acc, tag) => acc.concat(grouped[tag]), [] as IMedia[]);

  // If setPreviewInFirstPlace, prepend previews; otherwise, interleave previews based on tags
  if (setPreviewInFirstPlace) {
    return [...previews, ...sortedArray];
  }

  // If not prioritizing previews, insert them into the sorted array based on tags
  const result: IMedia[] = [];

  const addedTags = new Set<string>();

  for (const tag of Object.keys(grouped).sort()) {
    result.push(...grouped[tag]);

    // Insert preview items that share the current tag
    const tagPreviews = previews.filter((preview) =>
      (preview.type === "image"
        ? preview.image?.tags
        : preview.video?.tags
      )?.includes(tag)
    );

    result.push(...tagPreviews);
    tagPreviews.forEach(() => addedTags.add(tag));
  }

  const remainingPreviews = previews.filter((preview) => {
    const tags =
      preview.type === "image" ? preview.image?.tags : preview.video?.tags;
    return !tags || tags.length === 0 || !addedTags.has(tags[0]);
  });

  return [...result, ...remainingPreviews];
};
