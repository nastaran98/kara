import { CreatePracticeInput } from '@/domain/types';
import { createPracticeWithPoolEntry } from '@/server/repositories/practice.repo';

// A user-authored practice always lands in that user's pool — the service's
// job is knowing these two writes must be atomic; the repository decides
// how (a Prisma transaction).
//
// Every practice is private for now (the `isPrivate` schema default) —
// once sharing ships, this is where we'll branch on a `visibility` input
// and decide whether the PoolEntry stays author-only or becomes discoverable.
export async function createPractice(
  userId: string,
  payload: CreatePracticeInput,
) {
  return createPracticeWithPoolEntry(userId, payload);
}
