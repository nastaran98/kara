import { z } from "zod";

const attributionFields = {
  sourceType: z.string().min(1).optional(),
  sourceTitle: z.string().min(1).optional(),
  sourceAuthor: z.string().min(1).optional(),
};

const commonPracticeFields = {
  index: z.number().int().positive(),

  title: z.string().min(1),
  body: z.string().min(1),

  themeTags: z.array(z.string()).default([]),

  depth: z.number().int().min(1).max(3).optional(),

  ...attributionFields,
};

const actPracticeSchema = z.object({
  ...commonPracticeFields,

  type: z.literal("ACT"),

  minutes: z.number().int().min(1).max(20),
  requiresOther: z.boolean().optional(),
});

const sitPracticeSchema = z.object({
  ...commonPracticeFields,

  type: z.literal("SIT"),

  suggestedMinutes: z.union([
    z.literal(5),
    z.literal(10),
    z.literal(15),
    z.literal(20),
  ]),

  revisitAfterDays: z
    .union([
      z.literal(30),
      z.literal(60),
      z.literal(90),
    ])
    .nullable()
    .optional(),
});

const noticePracticeSchema = z.object({
  ...commonPracticeFields,

  type: z.literal("NOTICE"),

  noticeFor: z.string().min(1),
  tallyLabel: z.string().min(1).optional(),
});

const keepPracticeSchema = z.object({
  ...commonPracticeFields,

  type: z.literal("KEEP"),

  cue: z.string().min(1),
  behavior: z.string().min(1),

  polarity: z.enum(["do", "avoid"]),

  targetDays: z.union([
    z.literal(7),
    z.literal(14),
    z.literal(21),
    z.literal(30),
  ]),
});

export const practiceSchema = z.discriminatedUnion("type", [
  actPracticeSchema,
  sitPracticeSchema,
  noticePracticeSchema,
  keepPracticeSchema,
]);

export const phaseSchema = z
  .object({
    index: z.number().int().positive(),
    name: z.string().min(1),
    subtitle: z.string().min(1),
    startIndex: z.number().int().positive(),
    endIndex: z.number().int().positive(),
  })
  .refine(
    (phase) => phase.endIndex >= phase.startIndex,
    {
      message: "endIndex must be greater than or equal to startIndex",
      path: ["endIndex"],
    },
  );

export const journeyFileSchema = z
  .object({
    slug: z.string().min(1),

    kind: z.enum([
      "source",
      "theme",
      "pool",
    ]),

    title: z.string().min(1),

    outcomeStatement: z.string().min(1).optional(),

    totalDays: z.number().int().positive(),

    dailyMinutes: z.number().int().positive(),

    themeTags: z.array(z.string()).default([]),

    sourceTitle: z.string().min(1).optional(),
    sourceAuthor: z.string().min(1).optional(),

    locale: z.string().min(2),

    phases: z.array(phaseSchema),

    practices: z.array(practiceSchema),
  })
  .superRefine((journey, ctx) => {
    if (journey.kind !== "theme") {
      return;
    }

    journey.practices.forEach((practice, index) => {
      if (!practice.sourceType) {
        ctx.addIssue({
          code: "custom",
          message:
            "Theme-journey practices require sourceType attribution",
          path: [
            "practices",
            index,
            "sourceType",
          ],
        });
      }

      if (!practice.sourceTitle) {
        ctx.addIssue({
          code: "custom",
          message:
            "Theme-journey practices require sourceTitle attribution",
          path: [
            "practices",
            index,
            "sourceTitle",
          ],
        });
      }
    });
  });

export type JourneyFile = z.infer<
  typeof journeyFileSchema
>;

export type PracticeFile = z.infer<
  typeof practiceSchema
>;

// ======================================================
// QUOTE COLLECTIONS (KARA-46)
// ======================================================

export const quoteSourceTypeSchema = z.enum([
  "book",
  "fiction",
  "film",
  "podcast",
  "talk",
  "person",
  "unknown",
]);

export const quoteFileSchema = z.object({
  // Local suffix of the quote's stable identifier — the seed script
  // composes the full id as `${collection.slug}:${id}` and writes it
  // directly as the Quote row's primary key, upserting by it. That's what
  // makes re-seeding (or reordering quotes within a collection) never
  // create duplicates: identity comes from this id, not array position.
  id: z.string().min(1),

  text: z.string().min(1),
  author: z.string().min(1).optional(),
  sourceTitle: z.string().min(1).optional(),
  sourceType: quoteSourceTypeSchema.default("unknown"),
  themeTags: z.array(z.string()).default([]),
  clozeWords: z.array(z.string()).default([]),
});

export const quoteCollectionFileSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  themeTags: z.array(z.string()).default([]),
  quotes: z
    .array(quoteFileSchema)
    .min(1, "A collection must have at least one quote."),
});

export type QuoteFile = z.infer<typeof quoteFileSchema>;

export type QuoteCollectionFile = z.infer<
  typeof quoteCollectionFileSchema
>;