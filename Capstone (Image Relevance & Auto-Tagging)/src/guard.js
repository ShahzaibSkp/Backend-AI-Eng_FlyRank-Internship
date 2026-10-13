import { tokenize } from "./vector.js";

export function guardMatch({ post, image, similarity, confidenceThreshold, similarityThreshold }) {
  const postTokens = tokenize(`${post.title} ${post.content}`);
  const subject = image.tags?.subject?.toLowerCase() || "";
  const subjectTokens = tokenize(subject);
  const category = image.tags?.category?.toLowerCase() || "";
  const categoryMentioned = postTokens.has(category);
  const subjectMentioned = [...subjectTokens].some((token) => postTokens.has(token));

  if (!image.tags || image.status !== "classified") {
    return { accepted: false, reason: "Image has no accepted schema-valid classification" };
  }
  if (image.tags.confidence < confidenceThreshold) {
    return { accepted: false, reason: `Classification confidence ${image.tags.confidence.toFixed(2)} is below ${confidenceThreshold.toFixed(2)}` };
  }
  if (category === "animal" && /fox|wolf|dog|bear|deer/.test(subject) && !subjectMentioned) {
    return { accepted: false, reason: `Subject mismatch: detected ${image.tags.subject}, which is not supported by the post` };
  }
  if (categoryMentioned && !subjectMentioned) {
    return { accepted: false, reason: `Subject mismatch: detected ${image.tags.subject}` };
  }
  if (similarity < similarityThreshold) {
    return { accepted: false, reason: `Similarity ${similarity.toFixed(2)} is below ${similarityThreshold.toFixed(2)}` };
  }
  return { accepted: true, reason: "Schema-valid, confident classification passed similarity and mismatch checks" };
}
