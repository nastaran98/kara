import { prisma } from "@/server/db";

export async function startJourney(
  userId: string,
  journeyId: string
) {
  const existingJourney =
    await prisma.userJourney.findFirst({
      where: {
        userId: userId,
        journeyId: journeyId
      },
    });


  if (existingJourney) {
    return existingJourney;
  }


  return prisma.userJourney.create({
    data: {
      userId,
      journeyId,
      currentIndex: 1,
      status: "active",
    },
  });
}