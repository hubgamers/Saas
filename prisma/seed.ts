import "dotenv/config";
import { scryptSync } from "node:crypto";
import { PrismaClient, type Participant, type Team } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const day = 24 * 60 * 60 * 1000;

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL ?? "",
});

const prisma = new PrismaClient({ adapter });

function demoPasswordHash(password: string) {
  // Demo-only hash for local seed data. Use Argon2 or bcrypt in production auth flows.
  return `scrypt$demo$${scryptSync(password, "hubgamers-demo", 64).toString("hex")}`;
}

async function resetDatabase() {
  await prisma.overlayAccessToken.deleteMany();
  await prisma.overlayDataSource.deleteMany();
  await prisma.overlayScene.deleteMany();
  await prisma.overlayTheme.deleteMany();
  await prisma.broadcast.deleteMany();
  await prisma.matchParticipant.deleteMany();
  await prisma.match.deleteMany();
  await prisma.participant.deleteMany();
  await prisma.registration.deleteMany();
  await prisma.player.deleteMany();
  await prisma.team.deleteMany();
  await prisma.eventTournament.deleteMany();
  await prisma.tournamentPhase.deleteMany();
  await prisma.tournament.deleteMany();
  await prisma.event.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.organizationMember.deleteMany();
  await prisma.organization.deleteMany();
  await prisma.game.deleteMany();
  await prisma.user.deleteMany();
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL est requis pour lancer le seed.");
  }

  const passwordHash = demoPasswordHash("demo123");

  await resetDatabase();

  const owner = await prisma.user.create({
    data: {
      username: "admin",
      email: "admin@demo.gg",
      passwordHash,
      firstName: "Alexis",
      lastName: "Briet",
      avatarUrl: "https://api.dicebear.com/7.x/initials/svg?seed=Admin",
    },
  });

  const [caster, referee, organizer] = await Promise.all(
    [
      ["caster", "Caster"],
      ["referee", "Referee"],
      ["organizer", "Organizer"],
    ].map(([username, firstName]) =>
      prisma.user.create({
        data: {
          username,
          email: `${username}@demo.gg`,
          passwordHash,
          firstName,
          lastName: "Demo",
          avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${username}`,
        },
      }),
    ),
  );

  const organization = await prisma.organization.create({
    data: {
      name: "Nova Esport",
      slug: "nova-esport",
      ownerId: owner.id,
      logoUrl: "https://placehold.co/400x400?text=Nova",
    },
  });

  await prisma.organizationMember.createMany({
    data: [
      { organizationId: organization.id, userId: owner.id, role: "OWNER" },
      { organizationId: organization.id, userId: caster.id, role: "CASTER" },
      { organizationId: organization.id, userId: referee.id, role: "REFEREE" },
      { organizationId: organization.id, userId: organizer.id, role: "ADMIN" },
    ],
  });

  await prisma.subscription.create({
    data: {
      organizationId: organization.id,
      plan: "PRO",
      status: "ACTIVE",
      stripeCustomerId: "cus_demo_nova_esport",
      stripeSubscriptionId: "sub_demo_nova_esport",
      currentPeriodStart: new Date("2026-07-01T00:00:00Z"),
      currentPeriodEnd: new Date("2026-08-01T00:00:00Z"),
    },
  });

  const game = await prisma.game.create({
    data: {
      name: "Valorant",
      platform: "PC",
    },
  });

  const event = await prisma.event.create({
    data: {
      organizationId: organization.id,
      name: "Nova Summer LAN 2026",
      slug: "nova-summer-lan-2026",
      description:
        "Evenement esport avec tournoi Valorant, retransmission Twitch et overlays dynamiques.",
      type: "LAN",
      status: "PUBLISHED",
      startDate: new Date("2026-08-01T08:00:00Z"),
      endDate: new Date("2026-08-03T22:00:00Z"),
      venueName: "Rouen Expo",
      venueAddress: "Rouen, France",
      bannerUrl: "https://placehold.co/1600x600?text=Nova+Summer+LAN",
    },
  });

  const tournament = await prisma.tournament.create({
    data: {
      organizationId: organization.id,
      gameId: game.id,
      name: "Valorant Champions Open",
      description: "Tournoi Valorant en elimination directe avec 16 equipes.",
      format: "SINGLE_ELIMINATION",
      maxTeams: 16,
      maxPlayerPerTeam: 5,
      registrationStart: new Date("2026-07-01T08:00:00Z"),
      registrationEnd: new Date("2026-07-30T23:59:00Z"),
      startDate: new Date("2026-08-01T10:00:00Z"),
      endDate: new Date("2026-08-03T20:00:00Z"),
      status: "LIVE",
      bannerUrl: "https://placehold.co/1600x600?text=Valorant+Open",
      rules: "BO1 jusqu'aux demi-finales, finale en BO3. Fair-play obligatoire.",
      prizePool: "5000 EUR",
    },
  });

  await prisma.eventTournament.create({
    data: {
      eventId: event.id,
      tournamentId: tournament.id,
      sortOrder: 1,
    },
  });

  const teamNames = [
    "Nova Alpha",
    "Crimson Wolves",
    "Blue Phoenix",
    "Shadow Hawks",
    "Iron Titans",
    "Cyber Lynx",
    "Storm Riders",
    "Frost Vipers",
    "Solar Kings",
    "Neon Bears",
    "Quantum Foxes",
    "Rapid Owls",
    "Night Ravens",
    "Golden Sharks",
    "Pixel Dragons",
    "Echo Panthers",
  ];

  const teams: Team[] = [];

  for (const [teamIndex, teamName] of teamNames.entries()) {
    const manager = await prisma.user.create({
      data: {
        username: `manager_${teamIndex + 1}`,
        email: `manager${teamIndex + 1}@demo.gg`,
        passwordHash,
        firstName: "Manager",
        lastName: `${teamIndex + 1}`,
        avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=Manager${teamIndex + 1}`,
      },
    });

    const team = await prisma.team.create({
      data: {
        organizationId: organization.id,
        name: teamName,
        logoUrl: `https://placehold.co/300x300?text=${encodeURIComponent(teamName)}`,
        managerId: manager.id,
        status: "ACTIVE",
      },
    });

    teams.push(team);

    for (let playerIndex = 1; playerIndex <= 5; playerIndex += 1) {
      const playerUser = await prisma.user.create({
        data: {
          username: `team${teamIndex + 1}_player${playerIndex}`,
          email: `team${teamIndex + 1}_player${playerIndex}@demo.gg`,
          passwordHash,
          firstName: "Player",
          lastName: `${teamIndex + 1}-${playerIndex}`,
          avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=T${teamIndex + 1}P${playerIndex}`,
        },
      });

      await prisma.player.create({
        data: {
          teamId: team.id,
          userId: playerUser.id,
          nickname: `${team.name.split(" ")[0]}_${playerIndex}`,
        },
      });
    }
  }

  const participants: Participant[] = [];

  for (const team of teams) {
    await prisma.registration.create({
      data: {
        tournamentId: tournament.id,
        teamId: team.id,
        registeredById: owner.id,
        status: "APPROVED",
      },
    });

    const participant = await prisma.participant.create({
      data: {
        tournamentId: tournament.id,
        teamId: team.id,
        type: "TEAM",
        status: "CHECKED_IN",
      },
    });

    participants.push(participant);
  }

  const phase = await prisma.tournamentPhase.create({
    data: {
      tournamentId: tournament.id,
      name: "Playoffs",
      type: "BRACKET",
      order: 1,
      startsAt: new Date("2026-08-01T10:00:00Z"),
      endsAt: new Date("2026-08-03T20:00:00Z"),
      status: "LIVE",
    },
  });

  async function createMatch(
    roundNumber: number,
    teamOneIndex: number,
    teamTwoIndex: number,
    scheduledAt: string,
    scoreOne?: number,
    scoreTwo?: number,
  ) {
    const teamOne = teams[teamOneIndex];
    const teamTwo = teams[teamTwoIndex];
    const hasResult = scoreOne !== undefined && scoreTwo !== undefined;
    const winner = hasResult ? (scoreOne > scoreTwo ? teamOne : teamTwo) : null;
    const startedAt = hasResult ? new Date(scheduledAt) : undefined;

    const match = await prisma.match.create({
      data: {
        phaseId: phase.id,
        roundNumber,
        teamOneId: teamOne.id,
        teamTwoId: teamTwo.id,
        winnerId: winner?.id,
        scheduledAt: new Date(scheduledAt),
        startedAt,
        endedAt: startedAt ? new Date(startedAt.getTime() + 60 * 60 * 1000) : undefined,
        status: hasResult ? "COMPLETED" : "SCHEDULED",
        scoreTeamOne: scoreOne,
        scoreTeamTwo: scoreTwo,
      },
    });

    await prisma.matchParticipant.createMany({
      data: [
        {
          matchId: match.id,
          participantId: participants[teamOneIndex].id,
          teamId: teamOne.id,
          score: scoreOne,
          placement: hasResult ? (scoreOne > scoreTwo ? 1 : 2) : undefined,
          isWinner: winner?.id === teamOne.id,
        },
        {
          matchId: match.id,
          participantId: participants[teamTwoIndex].id,
          teamId: teamTwo.id,
          score: scoreTwo,
          placement: hasResult ? (scoreTwo > scoreOne ? 1 : 2) : undefined,
          isWinner: winner?.id === teamTwo.id,
        },
      ],
    });

    return match;
  }

  await createMatch(1, 0, 1, "2026-08-01T10:00:00Z", 13, 8);
  await createMatch(1, 2, 3, "2026-08-01T11:30:00Z", 10, 13);
  await createMatch(1, 4, 5, "2026-08-01T13:00:00Z", 13, 6);
  await createMatch(1, 6, 7, "2026-08-01T14:30:00Z", 13, 11);
  await createMatch(1, 8, 9, "2026-08-01T16:00:00Z", 7, 13);
  await createMatch(1, 10, 11, "2026-08-01T17:30:00Z", 13, 9);
  await createMatch(1, 12, 13, "2026-08-01T19:00:00Z", 5, 13);
  await createMatch(1, 14, 15, "2026-08-01T20:30:00Z", 13, 12);
  await createMatch(2, 0, 3, "2026-08-02T10:00:00Z", 13, 9);
  await createMatch(2, 4, 6, "2026-08-02T12:00:00Z", 11, 13);
  await createMatch(2, 9, 10, "2026-08-02T14:00:00Z", 13, 10);
  await createMatch(2, 13, 14, "2026-08-02T16:00:00Z", 8, 13);
  await createMatch(3, 0, 6, "2026-08-03T10:00:00Z", 13, 7);
  await createMatch(3, 9, 14, "2026-08-03T12:00:00Z", 14, 12);
  const finalMatch = await createMatch(4, 0, 9, "2026-08-03T18:00:00Z", 16, 14);

  const mainBroadcast = await prisma.broadcast.create({
    data: {
      eventId: event.id,
      tournamentId: tournament.id,
      platform: "TWITCH",
      channelName: "novaesport",
      streamUrl: "https://twitch.tv/novaesport",
      status: "LIVE",
      recordingUrl: "https://youtube.com/@novaesport",
      startedAt: new Date("2026-08-01T09:30:00Z"),
      delaySeconds: 90,
    },
  });

  const secondaryBroadcast = await prisma.broadcast.create({
    data: {
      eventId: event.id,
      tournamentId: tournament.id,
      platform: "YOUTUBE",
      channelName: "Nova Esport FR",
      streamUrl: "https://youtube.com/@novaesport/live",
      status: "PLANNED",
      delaySeconds: 120,
    },
  });

  const [darkTheme, finalTheme] = await Promise.all([
    prisma.overlayTheme.create({
      data: {
        organizationId: organization.id,
        name: "Nova Dark",
        primaryColor: "#2563eb",
        secondaryColor: "#020617",
        accentColor: "#f59e0b",
        fontFamily: "Inter",
        logoUrl: "https://placehold.co/400x400?text=Nova",
        backgroundUrl: "https://placehold.co/1920x1080?text=Nova+Dark",
      },
    }),
    prisma.overlayTheme.create({
      data: {
        organizationId: organization.id,
        name: "Final Neon",
        primaryColor: "#7c3aed",
        secondaryColor: "#111827",
        accentColor: "#22d3ee",
        fontFamily: "Montserrat",
        logoUrl: "https://placehold.co/400x400?text=Final",
        backgroundUrl: "https://placehold.co/1920x1080?text=Final+Neon",
      },
    }),
  ]);

  const scenes = await Promise.all([
    prisma.overlayScene.create({
      data: {
        broadcastId: mainBroadcast.id,
        themeId: darkTheme.id,
        name: "Match Scoreboard",
        kind: "SCOREBOARD",
        status: "LIVE",
        isActive: true,
        configJson: {
          matchId: finalMatch.id,
          layout: "scoreboard",
          showLogos: true,
          showRound: true,
          animation: "slide",
        },
      },
    }),
    prisma.overlayScene.create({
      data: {
        broadcastId: mainBroadcast.id,
        themeId: darkTheme.id,
        name: "Starting Soon",
        kind: "STARTING_SOON",
        status: "READY",
        isActive: false,
        configJson: {
          title: "Le match commence bientot",
          showSchedule: true,
          countdown: true,
        },
      },
    }),
    prisma.overlayScene.create({
      data: {
        broadcastId: secondaryBroadcast.id,
        themeId: finalTheme.id,
        name: "Bracket Overview",
        kind: "BRACKET",
        status: "READY",
        isActive: true,
        configJson: {
          showCompletedMatches: true,
          showUpcomingMatches: true,
        },
      },
    }),
  ]);

  for (const scene of scenes) {
    await prisma.overlayDataSource.createMany({
      data: [
        {
          sceneId: scene.id,
          name: "Match Data",
          type: "MATCH",
          endpointUrl: `/api/overlays/matches/${finalMatch.id}`,
          refreshIntervalSeconds: 5,
          payloadMappingJson: {
            teamOne: "teamOne.name",
            teamTwo: "teamTwo.name",
            scoreOne: "scoreTeamOne",
            scoreTwo: "scoreTeamTwo",
          },
          isEnabled: true,
        },
        {
          sceneId: scene.id,
          name: "Bracket Data",
          type: "BRACKET",
          endpointUrl: `/api/overlays/tournaments/${tournament.id}/bracket`,
          refreshIntervalSeconds: 10,
          payloadMappingJson: {
            tournamentName: "name",
            status: "status",
            phase: "currentPhase",
          },
          isEnabled: true,
        },
      ],
    });

    await prisma.overlayAccessToken.create({
      data: {
        sceneId: scene.id,
        label: `OBS Token - ${scene.name}`,
        tokenHash: demoPasswordHash(`obs-${scene.id}`),
        expiresAt: new Date(Date.now() + 90 * day),
        lastUsedAt: new Date(),
      },
    });
  }

  await prisma.auditLog.createMany({
    data: [
      {
        organizationId: organization.id,
        actorId: owner.id,
        action: "CREATE_EVENT",
        entityType: "Event",
        entityId: event.id,
        metadataJson: { name: event.name },
      },
      {
        organizationId: organization.id,
        actorId: owner.id,
        action: "CREATE_TOURNAMENT",
        entityType: "Tournament",
        entityId: tournament.id,
        metadataJson: { name: tournament.name, teams: teams.length },
      },
      {
        organizationId: organization.id,
        actorId: caster.id,
        action: "START_BROADCAST",
        entityType: "Broadcast",
        entityId: mainBroadcast.id,
        metadataJson: { platform: "TWITCH", channelName: mainBroadcast.channelName },
      },
    ],
  });

  console.log("Seed termine avec succes");
  console.log("Admin: admin@demo.gg");
  console.log("Password demo: demo123");
  console.log("Cree: 1 org, 1 event, 1 tournoi, 16 equipes, 80 joueurs, bracket, broadcasts et overlays");
}

main()
  .catch((error) => {
    console.error("Seed error:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
