"use client";

import { MarkdownEditor } from "@/components/markdown-editor";
import { saveContenuMd, saveGuideMd } from "./actions";

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

export function GuideEditor({
  seanceId,
  initial,
}: {
  seanceId: number;
  initial: string;
}) {
  return (
    <MarkdownEditor
      initial={initial}
      save={async (value) => saveGuideMd(seanceId, value)}
      placeholder={`# Rappel + question ouverte (15')
…

# Théorie avec analogies santé (30')
…

# Démo live (45')
…

# Exercice guidé (30')
…

## Points à insister
- …

## Erreurs à provoquer volontairement
- …`}
    />
  );
}
