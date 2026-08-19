-- CreateEnum
CREATE TYPE "PracticeType" AS ENUM ('ACT', 'SIT', 'NOTICE', 'KEEP');

-- CreateEnum
CREATE TYPE "JourneyKind" AS ENUM ('source', 'theme', 'pool');

-- CreateEnum
CREATE TYPE "UserJourneyStatus" AS ENUM ('active', 'completed', 'abandoned', 'queued');

-- CreateEnum
CREATE TYPE "PracticeLogStatus" AS ENUM ('done', 'skipped', 'waiting', 'closed');

-- CreateEnum
CREATE TYPE "CommitmentStatus" AS ENUM ('active', 'graduated', 'retired');

-- CreateEnum
CREATE TYPE "QuoteSourceType" AS ENUM ('book', 'fiction', 'film', 'podcast', 'talk', 'person', 'unknown');

-- CreateEnum
CREATE TYPE "CommitmentPolarity" AS ENUM ('do', 'avoid');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "locale" TEXT NOT NULL DEFAULT 'en',
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "reminderTime" TEXT,
    "eveningReminderTime" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Journey" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "kind" "JourneyKind" NOT NULL,
    "title" TEXT NOT NULL,
    "outcomeStatement" TEXT,
    "totalDays" INTEGER NOT NULL,
    "dailyMinutes" INTEGER NOT NULL,
    "themeTags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "sourceTitle" TEXT,
    "sourceAuthor" TEXT,
    "locale" TEXT NOT NULL,

    CONSTRAINT "Journey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Phase" (
    "id" TEXT NOT NULL,
    "journeyId" TEXT NOT NULL,
    "index" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "subtitle" TEXT NOT NULL,
    "startIndex" INTEGER NOT NULL,
    "endIndex" INTEGER NOT NULL,

    CONSTRAINT "Phase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Practice" (
    "id" TEXT NOT NULL,
    "journeyId" TEXT,
    "phaseId" TEXT,
    "authorUserId" TEXT,
    "index" INTEGER,
    "type" "PracticeType" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "themeTags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "depth" INTEGER,
    "sourceType" TEXT,
    "sourceTitle" TEXT,
    "sourceAuthor" TEXT,
    "minutes" INTEGER,
    "requiresOther" BOOLEAN,
    "suggestedMinutes" INTEGER,
    "revisitAfterDays" INTEGER,
    "noticeFor" TEXT,
    "tallyLabel" TEXT,
    "cue" TEXT,
    "behavior" TEXT,
    "polarity" "CommitmentPolarity",
    "targetDays" INTEGER,

    CONSTRAINT "Practice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserJourney" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "journeyId" TEXT NOT NULL,
    "status" "UserJourneyStatus" NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "currentIndex" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "UserJourney_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PracticeLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userJourneyId" TEXT,
    "practiceId" TEXT NOT NULL,
    "status" "PracticeLogStatus" NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "PracticeLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Entry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "practiceLogId" TEXT,
    "question" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "elapsedSeconds" INTEGER NOT NULL DEFAULT 0,
    "themeTags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "parentEntryId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Entry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SitSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "practiceId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "plannedSeconds" INTEGER NOT NULL,
    "endedAt" TIMESTAMP(3),
    "draftBody" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "SitSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Resurfacing" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "entryId" TEXT NOT NULL,
    "dueAt" TIMESTAMP(3) NOT NULL,
    "servedAt" TIMESTAMP(3),

    CONSTRAINT "Resurfacing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NoticeDay" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "practiceId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "tally" INTEGER NOT NULL DEFAULT 0,
    "reportEntryId" TEXT,

    CONSTRAINT "NoticeDay_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Commitment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userJourneyId" TEXT,
    "practiceId" TEXT NOT NULL,
    "status" "CommitmentStatus" NOT NULL,
    "reps" INTEGER NOT NULL DEFAULT 0,
    "targetDays" INTEGER NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Commitment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HabitCheck" (
    "id" TEXT NOT NULL,
    "commitmentId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "done" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "HabitCheck_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Collection" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "themeTags" TEXT[] DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "Collection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quote" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "collectionId" TEXT,
    "text" TEXT NOT NULL,
    "author" TEXT,
    "sourceTitle" TEXT,
    "sourceType" "QuoteSourceType" NOT NULL,
    "themeTags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "note" TEXT,
    "clozeWords" TEXT[] DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "Quote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuoteCard" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "quoteId" TEXT NOT NULL,
    "box" INTEGER NOT NULL DEFAULT 1,
    "dueAt" TIMESTAMP(3) NOT NULL,
    "lastReviewedAt" TIMESTAMP(3),
    "clearedCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "QuoteCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DayActivity" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "hadActivity" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "DayActivity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Journey_slug_key" ON "Journey"("slug");

-- CreateIndex
CREATE INDEX "Phase_journeyId_idx" ON "Phase"("journeyId");

-- CreateIndex
CREATE INDEX "UserJourney_userId_idx" ON "UserJourney"("userId");

-- CreateIndex
CREATE INDEX "UserJourney_journeyId_idx" ON "UserJourney"("journeyId");

-- CreateIndex
CREATE INDEX "PracticeLog_userId_practiceId_idx" ON "PracticeLog"("userId", "practiceId");

-- CreateIndex
CREATE INDEX "Resurfacing_userId_dueAt_servedAt_idx" ON "Resurfacing"("userId", "dueAt", "servedAt");

-- CreateIndex
CREATE UNIQUE INDEX "NoticeDay_reportEntryId_key" ON "NoticeDay"("reportEntryId");

-- CreateIndex
CREATE UNIQUE INDEX "Collection_slug_key" ON "Collection"("slug");

-- CreateIndex
CREATE INDEX "QuoteCard_userId_dueAt_idx" ON "QuoteCard"("userId", "dueAt");

-- CreateIndex
CREATE UNIQUE INDEX "DayActivity_userId_date_key" ON "DayActivity"("userId", "date");

-- AddForeignKey
ALTER TABLE "Phase" ADD CONSTRAINT "Phase_journeyId_fkey" FOREIGN KEY ("journeyId") REFERENCES "Journey"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Practice" ADD CONSTRAINT "Practice_journeyId_fkey" FOREIGN KEY ("journeyId") REFERENCES "Journey"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Practice" ADD CONSTRAINT "Practice_phaseId_fkey" FOREIGN KEY ("phaseId") REFERENCES "Phase"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Practice" ADD CONSTRAINT "Practice_authorUserId_fkey" FOREIGN KEY ("authorUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserJourney" ADD CONSTRAINT "UserJourney_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserJourney" ADD CONSTRAINT "UserJourney_journeyId_fkey" FOREIGN KEY ("journeyId") REFERENCES "Journey"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PracticeLog" ADD CONSTRAINT "PracticeLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PracticeLog" ADD CONSTRAINT "PracticeLog_userJourneyId_fkey" FOREIGN KEY ("userJourneyId") REFERENCES "UserJourney"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PracticeLog" ADD CONSTRAINT "PracticeLog_practiceId_fkey" FOREIGN KEY ("practiceId") REFERENCES "Practice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Entry" ADD CONSTRAINT "Entry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Entry" ADD CONSTRAINT "Entry_practiceLogId_fkey" FOREIGN KEY ("practiceLogId") REFERENCES "PracticeLog"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Entry" ADD CONSTRAINT "Entry_parentEntryId_fkey" FOREIGN KEY ("parentEntryId") REFERENCES "Entry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SitSession" ADD CONSTRAINT "SitSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SitSession" ADD CONSTRAINT "SitSession_practiceId_fkey" FOREIGN KEY ("practiceId") REFERENCES "Practice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resurfacing" ADD CONSTRAINT "Resurfacing_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resurfacing" ADD CONSTRAINT "Resurfacing_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "Entry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NoticeDay" ADD CONSTRAINT "NoticeDay_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NoticeDay" ADD CONSTRAINT "NoticeDay_practiceId_fkey" FOREIGN KEY ("practiceId") REFERENCES "Practice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NoticeDay" ADD CONSTRAINT "NoticeDay_reportEntryId_fkey" FOREIGN KEY ("reportEntryId") REFERENCES "Entry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Commitment" ADD CONSTRAINT "Commitment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Commitment" ADD CONSTRAINT "Commitment_userJourneyId_fkey" FOREIGN KEY ("userJourneyId") REFERENCES "UserJourney"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Commitment" ADD CONSTRAINT "Commitment_practiceId_fkey" FOREIGN KEY ("practiceId") REFERENCES "Practice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HabitCheck" ADD CONSTRAINT "HabitCheck_commitmentId_fkey" FOREIGN KEY ("commitmentId") REFERENCES "Commitment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "Collection"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuoteCard" ADD CONSTRAINT "QuoteCard_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuoteCard" ADD CONSTRAINT "QuoteCard_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "Quote"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DayActivity" ADD CONSTRAINT "DayActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
