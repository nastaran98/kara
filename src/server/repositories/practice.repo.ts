import { prisma, type Db } from '@/server/db';
import { CreatePracticeInput } from '@kara/domain'
import { insertPoolEntry } from '@/server/repositories/poolEntry.repo';

// Single-table write. `db` defaults to the shared client, but a caller
// composing this into a larger atomic write (see below) passes its `tx`.
export const insertPractice = (
  userId: string,
  payload: CreatePracticeInput,
  db: Db = prisma,
) => {
  return db.practice.create({
    data: {
      ...payload,
      authorUserId: userId,
      journeyId: null,
      phaseId: null,
    },
  })
}

export const getPracticeForJourneyIndex = (
  journeyId: string,
  index: number,
) => {
  return prisma.practice.findFirst({
    where: {
      journeyId,
      index,
    },
    include: {
      phase: true,
    },
  })
}

// Atomic write: a user-authored practice always lands in that user's pool,
// so both rows are created together or not at all. This is the only place
// that knows HOW that atomicity is achieved (a Prisma transaction) —
// services only know THAT it must happen.
export const createPracticeWithPoolEntry = (
  userId: string,
  payload: CreatePracticeInput,
) => {
  return prisma.$transaction(async (tx) => {
    const practice = await insertPractice(userId, payload, tx);
    const poolEntry = await insertPoolEntry(userId, practice.id, tx);

    return { practice, poolEntry };
  });
}
