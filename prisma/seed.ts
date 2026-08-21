import { config } from "dotenv";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../src/generated/prisma/client";
import {
  journeyFileSchema,
  type JourneyFile,
  type PracticeFile,
} from "../content/schema";

config({
  path: ".env.local",
});

const connectionString =
  process.env.DIRECT_URL ??
  process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DIRECT_URL or DATABASE_URL is required to seed the database.",
  );
}

const pool = new Pool({
  connectionString,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
});

const JOURNEYS_DIRECTORY = path.join(
  process.cwd(),
  "content",
  "journeys",
);

async function loadJourneyFiles(): Promise<
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
        `Invalid JSON in ${fileName}: ${
          error instanceof Error
            ? error.message
            : String(error)
        }`,
      );
    }

    const result =
      journeyFileSchema.safeParse(json);

    if (!result.success) {
      const details = result.error.issues
        .map((issue) => {
          const location =
            issue.path.length > 0
              ? issue.path.join(".")
              : "root";

          return `${location}: ${issue.message}`;
        })
        .join("\n");

      throw new Error(
        `Content validation failed for ${fileName}:\n${details}`,
      );
    }

    journeys.push(result.data);
  }

  return journeys;
}

function getPracticeSpecificData(
  practice: PracticeFile,
) {
  switch (practice.type) {
    case "ACT":
      return {
        minutes: practice.minutes,
        requiresOther:
          practice.requiresOther ?? false,
      };

    case "SIT":
      return {
        suggestedMinutes:
          practice.suggestedMinutes,
        revisitAfterDays:
          practice.revisitAfterDays ?? null,
      };

    case "NOTICE":
      return {
        noticeFor: practice.noticeFor,
        tallyLabel:
          practice.tallyLabel ?? null,
      };

    case "KEEP":
      return {
        cue: practice.cue,
        behavior: practice.behavior,
        polarity: practice.polarity,
        targetDays: practice.targetDays,
      };
  }
}

async function main() {
  /*
   * Important:
   *
   * Parse EVERY content file before performing
   * ANY database write.
   *
   * Therefore one malformed file means:
   *
   *    zero database changes.
   */
  const journeys =
    await loadJourneyFiles();

  await prisma.$transaction(
    async (tx) => {
      for (const journeyFile of journeys) {
        const journey =
          await tx.journey.upsert({
            where: {
              slug: journeyFile.slug,
            },

            update: {
              kind: journeyFile.kind,
              title: journeyFile.title,
              outcomeStatement:
                journeyFile.outcomeStatement ??
                null,
              totalDays:
                journeyFile.totalDays,
              dailyMinutes:
                journeyFile.dailyMinutes,
              themeTags:
                journeyFile.themeTags,
              sourceTitle:
                journeyFile.sourceTitle ??
                null,
              sourceAuthor:
                journeyFile.sourceAuthor ??
                null,
              locale: journeyFile.locale,
            },

            create: {
              slug: journeyFile.slug,
              kind: journeyFile.kind,
              title: journeyFile.title,
              outcomeStatement:
                journeyFile.outcomeStatement ??
                null,
              totalDays:
                journeyFile.totalDays,
              dailyMinutes:
                journeyFile.dailyMinutes,
              themeTags:
                journeyFile.themeTags,
              sourceTitle:
                journeyFile.sourceTitle ??
                null,
              sourceAuthor:
                journeyFile.sourceAuthor ??
                null,
              locale: journeyFile.locale,
            },
          });

        /*
         * We rebuild children from the
         * version-controlled source.
         *
         * Practices must be removed before
         * phases because Practice can point
         * to Phase.
         */
        await tx.practice.deleteMany({
          where: {
            journeyId: journey.id,
          },
        });

        await tx.phase.deleteMany({
          where: {
            journeyId: journey.id,
          },
        });

        const phaseIds = new Map<
          number,
          string
        >();

        for (const phaseFile of [
          ...journeyFile.phases,
        ].sort(
          (a, b) =>
            a.index - b.index,
        )) {
          const phase =
            await tx.phase.create({
              data: {
                journeyId: journey.id,
                index: phaseFile.index,
                name: phaseFile.name,
                subtitle:
                  phaseFile.subtitle,
                startIndex:
                  phaseFile.startIndex,
                endIndex:
                  phaseFile.endIndex,
              },
            });

          phaseIds.set(
            phaseFile.index,
            phase.id,
          );
        }

        const practices = [
          ...journeyFile.practices,
        ].sort(
          (a, b) =>
            a.index - b.index,
        );

        for (const practice of practices) {
          const phaseFile =
            journeyFile.phases.find(
              (phase) =>
                practice.index >=
                  phase.startIndex &&
                practice.index <=
                  phase.endIndex,
            );

          if (!phaseFile) {
            throw new Error(
              `Practice ${practice.index} in "${journeyFile.slug}" does not belong to any phase.`,
            );
          }

          const phaseId =
            phaseIds.get(
              phaseFile.index,
            );

          if (!phaseId) {
            throw new Error(
              `Could not resolve phase ${phaseFile.index} for practice ${practice.index}.`,
            );
          }

          await tx.practice.create({
            data: {
              journeyId: journey.id,
              phaseId,

              index: practice.index,
              type: practice.type,

              title: practice.title,
              body: practice.body,

              themeTags:
                practice.themeTags,

              depth:
                practice.depth ?? null,

              sourceType:
                practice.sourceType ??
                null,

              sourceTitle:
                practice.sourceTitle ??
                null,

              sourceAuthor:
                practice.sourceAuthor ??
                null,

              ...getPracticeSpecificData(
                practice,
              ),
            },
          });
        }
      }
    },
  );

  console.log(
    `Seeded ${journeys.length} journey file(s).`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
  