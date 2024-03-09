// Names given by ChatGPT

import moment from "moment";
import { DbClient } from "@esp-group-one/db-client";
import {
  addLeague,
  addMatch,
  addUser,
  resetCollections,
  setupAvailability,
} from "../test-helpers/build/src/db.js";
import { MatchStatus, Sport, helpers as types } from "@esp-group-one/types";

/* CONFIG OPTIONS */
const db = new DbClient();
const AUTH0ID = "github|123456"; // TODO: Put your auth 0 token here

await resetCollections(db);

await setupAvailability(db);

const profilePicture = types.PICTURES[0];

/* LEAGUES */
const publicLeagues = await Promise.all(
  [
    "ThunderStrike Racket League",
    "VelocityNet Smash Circuit",
    "RogueSpin Championship Series",
    "EclipseRacket Pro Tour",
    "VortexThrash Open",
    "HavocStrike Racket Premier League",
    "QuantumQuell Racket Masters",
  ].map((name) => addLeague(db, { name, ownerIds: [], private: false })),
);

const privateLeagues = await Promise.all(
  [
    "NebulaBlitz Grand Slam",
    "ApexFury Racket Challenge",
    "DynamoClash Elite Circuit",
  ].map((name) => addLeague(db, { name, ownerIds: [], private: true })),
);

/* YOU THE USER */

const me = await addUser(db, AUTH0ID, {
  name: "Riley Morgan",
  leagues: getRandomLeagues(),
  profilePicture,
});

await setLeagueOwner(publicLeagues[0], me);
await setLeagueOwner(privateLeagues[0], me);

/* USERS */

const otherUsers = await Promise.all(
  [
    "Jordan Taylor",
    "Avery Cameron",
    "Casey Quinn",
    "Taylor Reed",
    "Morgan Blake",
    "Jamie Ellis",
    "Alex Taylor",
    "Jordan Avery",
    "Casey Morgan",
  ].map((name) => {
    return addUser(db, `github|${100000 + randomInt(900000)}`, {
      name,
      leagues: getRandomLeagues(),
    });
  }),
);

await Promise.all(
  publicLeagues
    .slice(1)
    .map((league, i) => setLeagueOwner(league, otherUsers[i])),
);
await Promise.all(
  privateLeagues
    .slice(1)
    .map((league, i) => setLeagueOwner(league, otherUsers[i])),
);

/* MATCHES */

const myMatches = [
  await match(db, me, otherUsers[0], MatchStatus.Complete),
  await match(db, otherUsers[1], me, MatchStatus.Complete),

  await match(db, me, otherUsers[1], MatchStatus.Accepted),
  await match(db, otherUsers[2], me, MatchStatus.Accepted),
  await match(db, otherUsers[3], me, MatchStatus.Accepted),

  await match(db, me, otherUsers[2], MatchStatus.Request),
  await match(db, otherUsers[2], me, MatchStatus.Request),
  await match(db, otherUsers[2], me, MatchStatus.Request),
  await match(db, otherUsers[3], me, MatchStatus.Request),
];

console.log(myMatches);

const allUsers = [me, ...otherUsers];

const matches = [];

for (let i = 0; i < allUsers.length; i++) {
  for (let j = 0; j < 10; j++) {
    const r = randomInt(allUsers.length);
    if (r === i) continue;
    const states = [
      MatchStatus.Request,
      MatchStatus.Accepted,
      MatchStatus.Complete,
    ];
    let status = choose(states);

    matches.push(match(db, allUsers[i], allUsers[r], status));
  }
}

await Promise.all(matches);

process.exit(0);

/**
 * @returns {import("@esp-group-one/types").ObjectId[]}
 */
function getRandomLeagues() {
  const leagues = [];
  const map = [
    [publicLeagues, 4],
    [privateLeagues, 2],
  ];

  for (const [from, num] of map) {
    for (let i = 0; i < num; i++) {
      leagues.push(choose(from)._id);
    }
  }

  return leagues;
}

/**
 * @param {import("@esp-group-one/types").League} league
 * @param {import("@esp-group-one/types").User} user
 */
async function setLeagueOwner(league, user) {
  const leagues = await db.leagues();
  leagues.edit(league._id, { $push: { ownerIds: user._id } });

  const users = await db.users();
  users.edit(user._id, { $push: { leagues: league._id } });
}

/**
 * @param {DbClient} db
 * @param {import("@esp-group-one/types").User} user1
 * @param {import("@esp-group-one/types").User} user2
 * @param {MatchStatus} status
 *
 * @returns {Promise<import("@esp-group-one/types").Match>}
 */
function match(db, user1, user2, status) {
  const date =
    status === MatchStatus.Complete
      ? moment().add(randomInt(10) + 1, "week")
      : moment().subtract(randomInt(10) + 1, "week");

  const sport = randomSport();

  const possibleMessages = [
    "Hey, are you free for a match this weekend?",
    "Let's schedule a game. How about Saturday afternoon?",
    `Want to play some ${sport} on Friday evening? I'm free after 6 PM.`,
    "I'm itching for a match! Any availability this week?",
    "Calling all players! How about a friendly match on Sunday?",
    `Game on! Are you up for some ${sport} this Saturday?`,
    "Looking to organize a match. What's your availability?",
    "Time for a rematch? Let's plan a game this Thursday.",
    `Up for some ${sport} action this weekend? Let's set a time.`,
    "Thinking of hitting the courts. Can you play on Tuesday?",
    "Craving a match. Any chance you're available on Friday?",
    `Let's squeeze in a quick game of ${sport} this Sunday. Interested?`,
    "Match time! How about a showdown on Saturday morning?",
    "Planning a game night. Join me for a match this Thursday?",
    "Game day approaching! Let's lock in a time for our match.",
    "Setting up a friendly match this weekend. Are you in?",
    "Looking to organize a match-up. What day works for you?",
    "Feeling competitive. Let's schedule a match for Friday night.",
    "Time to dust off those rackets! Free for a game on Sunday?",
    `Game plan: ${sport} on Wednesday. Are you available?`,
    "---------------------------------------------------------------------------------------------------------------------------------------------",
    "Hey there! I hope this message finds you well and in good spirits. It's been a while since we caught up, and I've been thinking about organizing something exciting that we can both enjoy together. How about we plan a day filled with adrenaline-pumping sports action? I was thinking we could gather a group of friends and head to the local sports facility for a day of friendly competition and fun.",
  ];

  const messages = [];
  for (let i = 0; i < randomInt(8); i++) {
    messages.push({
      date: moment().subtract(randomInt(100), "minutes").toISOString(),
      sender: choose([user1, user2])._id,
      text: choose(possibleMessages),
    });
  }

  const obj = {
    date: date.toISOString(),
    sport,
    messages,
    players: [user1._id, user2._id],
    status,
  };

  if (status === MatchStatus.Complete) {
    obj.usersRated = [choose([user1._id, user2._id])];
  }

  if (randomInt(2) === 0) {
    obj.league = choose(user1.leagues);
    obj.round = randomInt(3);
  }

  return addMatch(db, obj);
}

function randomSport() {
  const sports = [Sport.Tennis, Sport.Badminton, Sport.Squash];
  return choose(sports);
}

function choose(array) {
  const i = randomInt(array.length);
  return array[i];
}

function randomInt(max) {
  return Math.floor(Math.random() * max);
}
