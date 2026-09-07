import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

import {
  journeyFileSchema,
  quoteCollectionFileSchema,
  type JourneyFile,
  type QuoteCollectionFile,
} from "./schema";

const JOURNEYS_DIRECTORY = path.join(
  process.cwd(),
  "content",
  "journeys",
);

const QUOTE_COLLECTIONS_DIRECTORY = path.join(
  process.cwd(),
  "content",
  "quote-collections",
);

function validateNoConsecutiveSits(
  journey: JourneyFile,
): string[] {
  const errors: string[] = [];

  const practices = [
    ...journey.practices,
  ].sort(
    (a, b) =>
      a.index - b.index,
  );

  for (
    let index = 1;
    index < practices.length;
    index++
  ) {
    const previous =
      practices[index - 1];

    const current =
      practices[index];

    if (
      previous.type === "SIT" &&
      current.type === "SIT"
    ) {
      errors.push(
        `[${journey.slug}] SIT practices ${previous.index} and ${current.index} are consecutive. Two SIT practices may not appear back to back.`,
      );
    }
  }

  return errors;
}

function validatePhaseBoundaries(
  journey: JourneyFile,
): string[] {
  const errors: string[] = [];

  const phases = [
    ...journey.phases,
  ].sort(
    (a, b) =>
      a.startIndex - b.startIndex,
  );

  if (phases.length === 0) {
    errors.push(
      `[${journey.slug}] Journey must contain at least one phase.`,
    );

    return errors;
  }

  const firstPhase = phases[0];

  if (firstPhase.startIndex !== 1) {
    errors.push(
      `[${journey.slug}] Phase coverage must start at practice 1, but starts at ${firstPhase.startIndex}.`,
    );
  }

  for (
    let index = 1;
    index < phases.length;
    index++
  ) {
    const previous =
      phases[index - 1];

    const current =
      phases[index];

    const expectedStart =
      previous.endIndex + 1;

    if (
      current.startIndex !==
      expectedStart
    ) {
      errors.push(
        `[${journey.slug}] Phase gap/overlap between phase ${previous.index} and phase ${current.index}: expected phase ${current.index} to start at ${expectedStart}, but it starts at ${current.startIndex}.`,
      );
    }
  }

  const lastPhase =
    phases[phases.length - 1];

  if (
    lastPhase.endIndex !==
    journey.totalDays
  ) {
    errors.push(
      `[${journey.slug}] Phase coverage must end at practice ${journey.totalDays}, but ends at ${lastPhase.endIndex}.`,
    );
  }

  return errors;
}

async function loadJourneys(): Promise<
  JourneyFile[]
> {
  const fileNames = (
    await readdir(JOURNEYS_DIRECTORY)
  )
    .filter((fileName) =>
      fileName.endsWith(".json"),
    )
    .sort();

  const journeys: JourneyFile[] = [];

  for (const fileName of fileNames) {
    const filePath = path.join(
      JOURNEYS_DIRECTORY,
      fileName,
    );

    const raw = await readFile(
      filePath,
      "utf8",
    );

    let json: unknown;

    try {
      json = JSON.parse(raw);
    } catch (error) {
      throw new Error(
        `[${fileName}] Invalid JSON: ${
          error instanceof Error
            ? error.message
            : String(error)
        }`,
      );
    }

    const result =
      journeyFileSchema.safeParse(json);

    if (!result.success) {
      const details =
        result.error.issues
          .map((issue) => {
            const location =
              issue.path.length > 0
                ? issue.path.join(".")
                : "root";

            return `  ${location}: ${issue.message}`;
          })
          .join("\n");

      throw new Error(
        `[${fileName}] Schema validation failed:\n${details}`,
      );
    }

    journeys.push(result.data);
  }

  return journeys;
}

async function loadQuoteCollections(): Promise<
  QuoteCollectionFile[]
> {
  const fileNames = (
    await readdir(QUOTE_COLLECTIONS_DIRECTORY)
  )
    .filter((fileName) =>
      fileName.endsWith(".json"),
    )
    .sort();

  const collections: QuoteCollectionFile[] = [];

  for (const fileName of fileNames) {
    const filePath = path.join(
      QUOTE_COLLECTIONS_DIRECTORY,
      fileName,
    );

    const raw = await readFile(
      filePath,
      "utf8",
    );

    let json: unknown;

    try {
      json = JSON.parse(raw);
    } catch (error) {
      throw new Error(
        `[${fileName}] Invalid JSON: ${
          error instanceof Error
            ? error.message
            : String(error)
        }`,
      );
    }

    const result =
      quoteCollectionFileSchema.safeParse(
        json,
      );

    if (!result.success) {
      const details =
        result.error.issues
          .map((issue) => {
            const location =
              issue.path.length > 0
                ? issue.path.join(".")
                : "root";

            return `  ${location}: ${issue.message}`;
          })
          .join("\n");

      throw new Error(
        `[${fileName}] Schema validation failed:\n${details}`,
      );
    }

    collections.push(result.data);
  }

  return collections;
}

// The seed script writes `${collection.slug}:${quote.id}` as the Quote
// row's primary key, so that's the identifier that must be globally
// unique — not the bare `id`, which only needs to be unique per file.
function validateQuoteIdsAreUnique(
  collections: QuoteCollectionFile[],
): string[] {
  const errors: string[] = [];
  const seenIds = new Set<string>();

  for (const collection of collections) {
    for (const quote of collection.quotes) {
      const fullId = `${collection.slug}:${quote.id}`;

      if (seenIds.has(fullId)) {
        errors.push(
          `[${collection.slug}] Quote id "${quote.id}" is used more than once (resolves to "${fullId}").`,
        );
        continue;
      }

      seenIds.add(fullId);
    }
  }

  return errors;
}

function validateCollectionSlugsAreUnique(
  collections: QuoteCollectionFile[],
): string[] {
  const errors: string[] = [];
  const seenSlugs = new Set<string>();

  for (const collection of collections) {
    if (seenSlugs.has(collection.slug)) {
      errors.push(
        `Collection slug "${collection.slug}" is used more than once.`,
      );
      continue;
    }

    seenSlugs.add(collection.slug);
  }

  return errors;
}

async function main() {
  const journeys =
    await loadJourneys();

  const quoteCollections =
    await loadQuoteCollections();

  const errors: string[] = [];

  for (const journey of journeys) {
    errors.push(
      ...validateNoConsecutiveSits(
        journey,
      ),

      ...validatePhaseBoundaries(
        journey,
      ),
    );
  }

  errors.push(
    ...validateCollectionSlugsAreUnique(
      quoteCollections,
    ),

    ...validateQuoteIdsAreUnique(
      quoteCollections,
    ),
  );

  /*
   * TODO M1:
   *
   * - never two consecutive depth: 3 practices
   * - a Notice is never followed by another Notice
   * - max 2 Keeps introduced per journey
   * - both Keeps are never introduced in one phase
   * - a requiresOther Act is never the last practice of a phase
   * - every theme-journey practice has attribution
   *   (currently also enforced structurally in schema.ts)
   * - every user-facing string exists in both locales
   */

  if (errors.length > 0) {
    console.error(
      "\nContent validation failed:\n",
    );

    for (const error of errors) {
      console.error(`- ${error}`);
    }

    process.exitCode = 1;
    return;
  }

  console.log(
    `Content validation passed for ${journeys.length} journey file(s) and ${quoteCollections.length} quote collection(s).`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});