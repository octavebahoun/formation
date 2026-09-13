"use client";

import { MarkdownEditor } from "@/components/markdown-editor";
import { saveContenuMd } from "./actions";

export function ContenuEditor({
  seanceId,
  initial,
}: {
  seanceId: number;
  initial: string;
}) {
  return (
    <MarkdownEditor
      initial={initial}
      save={async (value) => saveContenuMd(seanceId, value)}
      placeholder={`# Ce qu'on va voir
- Notion 1
- Notion 2

## Ressources
[Ma vidéo YouTube](https://youtu.be/dQw4w9WgXcQ)

## Exemple`}
    />
  );
}
