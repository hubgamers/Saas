-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "BroadcastPlatform" AS ENUM ('TWITCH', 'YOUTUBE', 'KICK', 'CUSTOM');

-- CreateEnum
CREATE TYPE "BroadcastStatus" AS ENUM ('PLANNED', 'LIVE', 'ENDED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('ONLINE', 'LAN', 'HYBRID');

-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'LIVE', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "MatchStatus" AS ENUM ('SCHEDULED', 'LIVE', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "OverlayDataSourceType" AS ENUM ('MATCH', 'BRACKET', 'STANDINGS', 'CUSTOM');

-- CreateEnum
CREATE TYPE "OverlaySceneKind" AS ENUM ('STARTING_SOON', 'SCOREBOARD', 'BRACKET', 'STANDINGS', 'LOWER_THIRD', 'INTERMISSION', 'ENDING', 'CUSTOM');

-- CreateEnum
CREATE TYPE "OverlaySceneStatus" AS ENUM ('DRAFT', 'READY', 'LIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "RegistrationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TeamStatus" AS ENUM ('INVITED', 'ACTIVE', 'DISQUALIFIED');

-- CreateEnum
CREATE TYPE "TournamentPhaseType" AS ENUM ('GROUP_STAGE', 'BRACKET', 'SWISS', 'FINAL');

-- CreateEnum
CREATE TYPE "TournamentPhaseStatus" AS ENUM ('PLANNED', 'LIVE', 'COMPLETED');

-- CreateEnum
CREATE TYPE "TournamentFormat" AS ENUM ('SINGLE_ELIMINATION', 'DOUBLE_ELIMINATION', 'ROUND_ROBIN', 'SWISS', 'LEAGUE');

-- CreateEnum
CREATE TYPE "TournamentStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'REGISTRATION_OPEN', 'REGISTRATION_CLOSED', 'LIVE', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "OrganizationMemberRole" AS ENUM ('OWNER', 'ADMIN', 'STAFF', 'CASTER', 'REFEREE', 'VIEWER');

-- CreateEnum
CREATE TYPE "ParticipantType" AS ENUM ('TEAM', 'USER');

-- CreateEnum
CREATE TYPE "ParticipantStatus" AS ENUM ('INVITED', 'REGISTERED', 'CHECKED_IN', 'DISQUALIFIED');

-- CreateEnum
CREATE TYPE "SubscriptionPlan" AS ENUM ('FREE', 'STARTER', 'PRO', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('TRIALING', 'ACTIVE', 'PAST_DUE', 'CANCELED');

-- CreateTable
CREATE TABLE "Game" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Match" (
    "id" TEXT NOT NULL,
    "phaseId" TEXT NOT NULL,
    "roundNumber" INTEGER NOT NULL,
    "teamOneId" TEXT NOT NULL,
    "teamTwoId" TEXT NOT NULL,
    "winnerId" TEXT,
    "scheduledAt" TIMESTAMPTZ(3) NOT NULL,
    "startedAt" TIMESTAMPTZ(3),
    "endedAt" TIMESTAMPTZ(3),
    "status" "MatchStatus" NOT NULL,
    "scoreTeamOne" INTEGER,
    "scoreTeamTwo" INTEGER,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "logoUrl" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Player" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "nickname" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Registration" (
    "id" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "registeredById" TEXT NOT NULL,
    "status" "RegistrationStatus" NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Registration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Team" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT,
    "name" TEXT NOT NULL,
    "logoUrl" TEXT,
    "managerId" TEXT NOT NULL,
    "status" "TeamStatus" NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tournament" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "description" TEXT,
    "format" "TournamentFormat" NOT NULL,
    "maxTeams" INTEGER NOT NULL,
    "maxPlayerPerTeam" INTEGER NOT NULL,
    "registrationStart" TIMESTAMPTZ(3) NOT NULL,
    "registrationEnd" TIMESTAMPTZ(3) NOT NULL,
    "startDate" TIMESTAMPTZ(3) NOT NULL,
    "endDate" TIMESTAMPTZ(3) NOT NULL,
    "status" "TournamentStatus" NOT NULL,
    "bannerUrl" TEXT,
    "rules" TEXT,
    "prizePool" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Tournament_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TournamentPhase" (
    "id" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "TournamentPhaseType" NOT NULL,
    "order" INTEGER NOT NULL,
    "startsAt" TIMESTAMPTZ(3) NOT NULL,
    "endsAt" TIMESTAMPTZ(3),
    "status" "TournamentPhaseStatus" NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "TournamentPhase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "email" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Broadcast" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "tournamentId" TEXT,
    "platform" "BroadcastPlatform" NOT NULL,
    "channelName" TEXT NOT NULL,
    "streamUrl" TEXT NOT NULL,
    "status" "BroadcastStatus" NOT NULL,
    "recordingUrl" TEXT,
    "startedAt" TIMESTAMPTZ(3),
    "endedAt" TIMESTAMPTZ(3),
    "delaySeconds" INTEGER,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Broadcast_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventTournament" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "EventTournament_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "type" "EventType" NOT NULL,
    "startDate" TIMESTAMPTZ(3) NOT NULL,
    "endDate" TIMESTAMPTZ(3) NOT NULL,
    "status" "EventStatus" NOT NULL,
    "venueName" TEXT,
    "venueAddress" TEXT,
    "bannerUrl" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OverlayAccessToken" (
    "id" TEXT NOT NULL,
    "sceneId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMPTZ(3),
    "revokedAt" TIMESTAMPTZ(3),
    "lastUsedAt" TIMESTAMPTZ(3) NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "OverlayAccessToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OverlayDataSource" (
    "id" TEXT NOT NULL,
    "sceneId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "OverlayDataSourceType" NOT NULL,
    "endpointUrl" TEXT NOT NULL,
    "refreshIntervalSeconds" INTEGER NOT NULL,
    "payloadMappingJson" JSONB,
    "isEnabled" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "OverlayDataSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OverlayScene" (
    "id" TEXT NOT NULL,
    "broadcastId" TEXT NOT NULL,
    "themeId" TEXT,
    "name" TEXT NOT NULL,
    "kind" "OverlaySceneKind" NOT NULL,
    "status" "OverlaySceneStatus" NOT NULL,
    "isActive" BOOLEAN NOT NULL,
    "configJson" JSONB,
    "customCss" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "OverlayScene_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OverlayTheme" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "primaryColor" TEXT NOT NULL,
    "secondaryColor" TEXT NOT NULL,
    "accentColor" TEXT NOT NULL,
    "fontFamily" TEXT,
    "logoUrl" TEXT,
    "backgroundUrl" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "OverlayTheme_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "metadataJson" JSONB,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MatchParticipant" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "teamId" TEXT,
    "userId" TEXT,
    "score" INTEGER,
    "placement" INTEGER,
    "isWinner" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "MatchParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationMember" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "OrganizationMemberRole" NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "OrganizationMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Participant" (
    "id" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "teamId" TEXT,
    "userId" TEXT,
    "type" "ParticipantType" NOT NULL,
    "status" "ParticipantStatus" NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Participant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "plan" "SubscriptionPlan" NOT NULL,
    "status" "SubscriptionStatus" NOT NULL,
    "stripeCustomerId" TEXT NOT NULL,
    "stripeSubscriptionId" TEXT,
    "currentPeriodStart" TIMESTAMPTZ(3) NOT NULL,
    "currentPeriodEnd" TIMESTAMPTZ(3) NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Match_phaseId_idx" ON "Match"("phaseId");

-- CreateIndex
CREATE INDEX "Match_teamOneId_idx" ON "Match"("teamOneId");

-- CreateIndex
CREATE INDEX "Match_teamTwoId_idx" ON "Match"("teamTwoId");

-- CreateIndex
CREATE INDEX "Match_winnerId_idx" ON "Match"("winnerId");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_slug_key" ON "Organization"("slug");

-- CreateIndex
CREATE INDEX "Organization_ownerId_idx" ON "Organization"("ownerId");

-- CreateIndex
CREATE INDEX "Player_teamId_idx" ON "Player"("teamId");

-- CreateIndex
CREATE INDEX "Player_userId_idx" ON "Player"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Player_teamId_userId_key" ON "Player"("teamId", "userId");

-- CreateIndex
CREATE INDEX "Registration_tournamentId_idx" ON "Registration"("tournamentId");

-- CreateIndex
CREATE INDEX "Registration_teamId_idx" ON "Registration"("teamId");

-- CreateIndex
CREATE INDEX "Registration_registeredById_idx" ON "Registration"("registeredById");

-- CreateIndex
CREATE UNIQUE INDEX "Registration_tournamentId_teamId_key" ON "Registration"("tournamentId", "teamId");

-- CreateIndex
CREATE INDEX "Team_organizationId_idx" ON "Team"("organizationId");

-- CreateIndex
CREATE INDEX "Team_managerId_idx" ON "Team"("managerId");

-- CreateIndex
CREATE INDEX "Tournament_gameId_idx" ON "Tournament"("gameId");

-- CreateIndex
CREATE INDEX "Tournament_organizationId_idx" ON "Tournament"("organizationId");

-- CreateIndex
CREATE INDEX "TournamentPhase_tournamentId_idx" ON "TournamentPhase"("tournamentId");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Broadcast_eventId_idx" ON "Broadcast"("eventId");

-- CreateIndex
CREATE INDEX "Broadcast_tournamentId_idx" ON "Broadcast"("tournamentId");

-- CreateIndex
CREATE INDEX "EventTournament_eventId_idx" ON "EventTournament"("eventId");

-- CreateIndex
CREATE INDEX "EventTournament_tournamentId_idx" ON "EventTournament"("tournamentId");

-- CreateIndex
CREATE UNIQUE INDEX "EventTournament_eventId_tournamentId_key" ON "EventTournament"("eventId", "tournamentId");

-- CreateIndex
CREATE INDEX "Event_organizationId_idx" ON "Event"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Event_organizationId_slug_key" ON "Event"("organizationId", "slug");

-- CreateIndex
CREATE INDEX "OverlayAccessToken_sceneId_idx" ON "OverlayAccessToken"("sceneId");

-- CreateIndex
CREATE UNIQUE INDEX "OverlayAccessToken_tokenHash_key" ON "OverlayAccessToken"("tokenHash");

-- CreateIndex
CREATE INDEX "OverlayDataSource_sceneId_idx" ON "OverlayDataSource"("sceneId");

-- CreateIndex
CREATE INDEX "OverlayScene_broadcastId_idx" ON "OverlayScene"("broadcastId");

-- CreateIndex
CREATE INDEX "OverlayScene_themeId_idx" ON "OverlayScene"("themeId");

-- CreateIndex
CREATE UNIQUE INDEX "OverlayScene_broadcastId_name_key" ON "OverlayScene"("broadcastId", "name");

-- CreateIndex
CREATE INDEX "OverlayTheme_organizationId_idx" ON "OverlayTheme"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "OverlayTheme_organizationId_name_key" ON "OverlayTheme"("organizationId", "name");

-- CreateIndex
CREATE INDEX "AuditLog_organizationId_idx" ON "AuditLog"("organizationId");

-- CreateIndex
CREATE INDEX "AuditLog_actorId_idx" ON "AuditLog"("actorId");

-- CreateIndex
CREATE INDEX "AuditLog_entityId_idx" ON "AuditLog"("entityId");

-- CreateIndex
CREATE INDEX "MatchParticipant_matchId_idx" ON "MatchParticipant"("matchId");

-- CreateIndex
CREATE INDEX "MatchParticipant_participantId_idx" ON "MatchParticipant"("participantId");

-- CreateIndex
CREATE INDEX "MatchParticipant_teamId_idx" ON "MatchParticipant"("teamId");

-- CreateIndex
CREATE INDEX "MatchParticipant_userId_idx" ON "MatchParticipant"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "MatchParticipant_matchId_participantId_key" ON "MatchParticipant"("matchId", "participantId");

-- CreateIndex
CREATE INDEX "OrganizationMember_organizationId_idx" ON "OrganizationMember"("organizationId");

-- CreateIndex
CREATE INDEX "OrganizationMember_userId_idx" ON "OrganizationMember"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationMember_organizationId_userId_key" ON "OrganizationMember"("organizationId", "userId");

-- CreateIndex
CREATE INDEX "Participant_tournamentId_idx" ON "Participant"("tournamentId");

-- CreateIndex
CREATE INDEX "Participant_teamId_idx" ON "Participant"("teamId");

-- CreateIndex
CREATE INDEX "Participant_userId_idx" ON "Participant"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Participant_tournamentId_teamId_key" ON "Participant"("tournamentId", "teamId");

-- CreateIndex
CREATE UNIQUE INDEX "Participant_tournamentId_userId_key" ON "Participant"("tournamentId", "userId");

-- CreateIndex
CREATE INDEX "Subscription_organizationId_idx" ON "Subscription"("organizationId");

-- CreateIndex
CREATE INDEX "Subscription_stripeCustomerId_idx" ON "Subscription"("stripeCustomerId");

-- CreateIndex
CREATE INDEX "Subscription_stripeSubscriptionId_idx" ON "Subscription"("stripeSubscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_organizationId_key" ON "Subscription"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_stripeCustomerId_key" ON "Subscription"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_stripeSubscriptionId_key" ON "Subscription"("stripeSubscriptionId");

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_phaseId_fkey" FOREIGN KEY ("phaseId") REFERENCES "TournamentPhase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_teamOneId_fkey" FOREIGN KEY ("teamOneId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_teamTwoId_fkey" FOREIGN KEY ("teamTwoId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_winnerId_fkey" FOREIGN KEY ("winnerId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Organization" ADD CONSTRAINT "Organization_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Player_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Player_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Registration" ADD CONSTRAINT "Registration_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Registration" ADD CONSTRAINT "Registration_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Registration" ADD CONSTRAINT "Registration_registeredById_fkey" FOREIGN KEY ("registeredById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tournament" ADD CONSTRAINT "Tournament_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tournament" ADD CONSTRAINT "Tournament_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentPhase" ADD CONSTRAINT "TournamentPhase_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Broadcast" ADD CONSTRAINT "Broadcast_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Broadcast" ADD CONSTRAINT "Broadcast_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventTournament" ADD CONSTRAINT "EventTournament_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventTournament" ADD CONSTRAINT "EventTournament_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OverlayAccessToken" ADD CONSTRAINT "OverlayAccessToken_sceneId_fkey" FOREIGN KEY ("sceneId") REFERENCES "OverlayScene"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OverlayDataSource" ADD CONSTRAINT "OverlayDataSource_sceneId_fkey" FOREIGN KEY ("sceneId") REFERENCES "OverlayScene"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OverlayScene" ADD CONSTRAINT "OverlayScene_broadcastId_fkey" FOREIGN KEY ("broadcastId") REFERENCES "Broadcast"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OverlayScene" ADD CONSTRAINT "OverlayScene_themeId_fkey" FOREIGN KEY ("themeId") REFERENCES "OverlayTheme"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OverlayTheme" ADD CONSTRAINT "OverlayTheme_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchParticipant" ADD CONSTRAINT "MatchParticipant_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchParticipant" ADD CONSTRAINT "MatchParticipant_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "Participant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchParticipant" ADD CONSTRAINT "MatchParticipant_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchParticipant" ADD CONSTRAINT "MatchParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationMember" ADD CONSTRAINT "OrganizationMember_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationMember" ADD CONSTRAINT "OrganizationMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Participant" ADD CONSTRAINT "Participant_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Participant" ADD CONSTRAINT "Participant_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Participant" ADD CONSTRAINT "Participant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddCheckConstraint
ALTER TABLE "Match" ADD CONSTRAINT "Match_roundNumber_positive_check" CHECK ("roundNumber" > 0);

-- AddCheckConstraint
ALTER TABLE "Match" ADD CONSTRAINT "Match_scores_non_negative_check" CHECK (("scoreTeamOne" IS NULL OR "scoreTeamOne" >= 0) AND ("scoreTeamTwo" IS NULL OR "scoreTeamTwo" >= 0));

-- AddCheckConstraint
ALTER TABLE "Match" ADD CONSTRAINT "Match_winner_is_participant_check" CHECK ("winnerId" IS NULL OR "winnerId" = "teamOneId" OR "winnerId" = "teamTwoId");

-- AddCheckConstraint
ALTER TABLE "Match" ADD CONSTRAINT "Match_time_order_check" CHECK (("startedAt" IS NULL OR "scheduledAt" <= "startedAt") AND ("endedAt" IS NULL OR COALESCE("startedAt", "scheduledAt") <= "endedAt"));

-- AddCheckConstraint
ALTER TABLE "Tournament" ADD CONSTRAINT "Tournament_team_limits_positive_check" CHECK ("maxTeams" > 0 AND "maxPlayerPerTeam" > 0);

-- AddCheckConstraint
ALTER TABLE "Tournament" ADD CONSTRAINT "Tournament_registration_window_check" CHECK ("registrationStart" < "registrationEnd");

-- AddCheckConstraint
ALTER TABLE "Tournament" ADD CONSTRAINT "Tournament_date_window_check" CHECK ("startDate" < "endDate");

-- AddCheckConstraint
ALTER TABLE "TournamentPhase" ADD CONSTRAINT "TournamentPhase_order_positive_check" CHECK ("order" > 0);

-- AddCheckConstraint
ALTER TABLE "TournamentPhase" ADD CONSTRAINT "TournamentPhase_date_window_check" CHECK ("endsAt" IS NULL OR "startsAt" < "endsAt");

-- AddCheckConstraint
ALTER TABLE "Broadcast" ADD CONSTRAINT "Broadcast_delay_non_negative_check" CHECK ("delaySeconds" IS NULL OR "delaySeconds" >= 0);

-- AddCheckConstraint
ALTER TABLE "Broadcast" ADD CONSTRAINT "Broadcast_time_order_check" CHECK ("startedAt" IS NULL OR "endedAt" IS NULL OR "startedAt" <= "endedAt");

-- AddCheckConstraint
ALTER TABLE "EventTournament" ADD CONSTRAINT "EventTournament_sort_order_positive_check" CHECK ("sortOrder" > 0);

-- AddCheckConstraint
ALTER TABLE "Event" ADD CONSTRAINT "Event_date_window_check" CHECK ("startDate" < "endDate");

-- AddCheckConstraint
ALTER TABLE "OverlayDataSource" ADD CONSTRAINT "OverlayDataSource_refresh_positive_check" CHECK ("refreshIntervalSeconds" > 0);

-- AddCheckConstraint
ALTER TABLE "MatchParticipant" ADD CONSTRAINT "MatchParticipant_score_non_negative_check" CHECK ("score" IS NULL OR "score" >= 0);

-- AddCheckConstraint
ALTER TABLE "MatchParticipant" ADD CONSTRAINT "MatchParticipant_placement_positive_check" CHECK ("placement" IS NULL OR "placement" > 0);

-- AddCheckConstraint
ALTER TABLE "MatchParticipant" ADD CONSTRAINT "MatchParticipant_single_subject_check" CHECK (("teamId" IS NOT NULL AND "userId" IS NULL) OR ("teamId" IS NULL AND "userId" IS NOT NULL));

-- AddCheckConstraint
ALTER TABLE "Participant" ADD CONSTRAINT "Participant_single_subject_check" CHECK (("teamId" IS NOT NULL AND "userId" IS NULL AND "type" = 'TEAM') OR ("teamId" IS NULL AND "userId" IS NOT NULL AND "type" = 'USER'));

-- AddCheckConstraint
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_period_window_check" CHECK ("currentPeriodStart" < "currentPeriodEnd");
