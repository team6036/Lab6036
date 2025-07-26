import cryptojs from "crypto-js";
import { faker } from "@faker-js/faker";
import {
  Weekday,
  type CycleHours,
  type LabHours,
  type LogEntries,
  type ParsedLogEntries,
  type ParsedLogEntry,
  type SimpleDate,
  type SimpleTime,
  type User,
  type UserProfile,
  type UserProfiles,
  type Users,
  type WeekHours,
} from "./types";
import colors from "tailwindcss/colors";

export const MAX_USERS = 100;
export const WEEKS_PER_CYCLE = 2;
export const HOUR_QUOTA = 16;

export const YEAR = new Date().getFullYear();

// TODO: CHANGE THIS YEAR AFTER YEAR!

export const KICKOFF: SimpleDate = { year: YEAR, month: 1, day: 4 }; // saturday
export const KICKOFF_DATE = getDate(KICKOFF);

export const START_TIME: SimpleTime = {
  date: {
    year: YEAR,
    month: KICKOFF.month,
    day: KICKOFF.day + 2, // MUST ALWAYS BE MONDAY
  },
  hour: 3, // 3AM
  minute: 0,
  second: 0,
};

export function decrypt(msg: string, key: string) {
  return cryptojs.AES.decrypt(msg, key).toString(cryptojs.enc.Utf8);
}
export function encrypt(msg: string, key: string) {
  return cryptojs.AES.encrypt(msg, key).toString();
}

export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

const canvas = document.createElement("canvas");
canvas.width = canvas.height = 1;
const ctx = canvas.getContext("2d")!;

export type rgb = [number, number, number];

export function getCSSColor(color: string): rgb {
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 1, 1);
  const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
  return [r / 255, g / 255, b / 255];
}

export function hexToRgb(hex: string): rgb {
  hex = hex.slice(1);
  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;
  return [r, g, b];
}
export function rgbToHex(rgb: rgb): string {
  return (
    "#" +
    Math.round(rgb[0] * 255)
      .toString(16)
      .padStart(2, "0") +
    Math.round(rgb[1] * 255)
      .toString(16)
      .padStart(2, "0") +
    Math.round(rgb[2] * 255)
      .toString(16)
      .padStart(2, "0")
  );
}
export function dangerScale(scale: number): rgb {
  const red = getCSSColor(colors.red[500]);
  const yellow = getCSSColor(colors.yellow[500]);
  const green = getCSSColor(colors.green[500]);
  scale = Math.min(1, Math.max(0, scale));
  if (scale < 0.5) {
    scale /= 0.5;
    return [
      lerp(red[0], yellow[0], scale),
      lerp(red[1], yellow[1], scale),
      lerp(red[2], yellow[2], scale),
    ];
  }
  scale -= 0.5;
  scale /= 0.5;
  return [
    lerp(yellow[0], green[0], scale),
    lerp(yellow[1], green[1], scale),
    lerp(yellow[2], green[2], scale),
  ];
}

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const CHARSET = ALPHABET.toLowerCase() + "0123456789" + " -.";

function cleanString(s: string) {
  return s
    .trim()
    .toLowerCase()
    .split("")
    .map((c) => (CHARSET.includes(c) ? c : " "))
    .join("")
    .split(" ")
    .filter((part) => part.length > 0)
    .join(" ");
}

function getEditDistance(s1: string, s2: string) {
  s1 = cleanString(s1);
  s2 = cleanString(s2);
  const costs = [];
  for (var i = 0; i <= s1.length; i++) {
    var lastValue = i;
    for (var j = 0; j <= s2.length; j++) {
      if (i <= 0) {
        costs[j] = j;
        continue;
      }
      if (j <= 0) continue;
      let newValue = costs[j - 1];
      if (s1.charAt(i - 1) != s2.charAt(j - 1))
        newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
      costs[j - 1] = lastValue;
      lastValue = newValue;
    }
    if (i > 0) costs[s2.length] = lastValue;
  }
  return costs[s2.length];
}

export function getSimilarity(s1: string, s2: string) {
  let longer = cleanString(s1);
  let shorter = cleanString(s2);
  if (longer.length < shorter.length) [longer, shorter] = [shorter, longer];
  if (longer.includes(shorter)) {
    const i = longer.indexOf(shorter);
    if (i <= 0 || longer[i - 1] === " ") return 1;
  }
  const longerLength = longer.length;
  if (longerLength <= 0) return 1;
  return (longerLength - getEditDistance(longer, shorter)) / longerLength;
}

const SIMILARITY_MIN = 0.75;

export function lookupUser(users: Users, user: string) {
  let bestSimilarity = 0;
  let bestUser: User | null = null;
  for (const possibleUser of users) {
    for (const name of [possibleUser.name, ...possibleUser.nicknames]) {
      const similarity = getSimilarity(name, user);
      if (similarity < SIMILARITY_MIN) continue;
      if (similarity > bestSimilarity) {
        bestSimilarity = similarity;
        bestUser = possibleUser;
      }
    }
  }
  return { user: bestUser, similarity: bestSimilarity };
}

export function entriesToParsed(
  users: Users,
  entries: LogEntries,
): ParsedLogEntries {
  return [...entries]
    .sort((a, b) => a.time - b.time)
    .map(({ time, user, type }) => {
      const { user: matchedUser, similarity } = lookupUser(users, user);
      return {
        time: getSimpleTime(time),
        user,
        type,

        weekday: getWeekday(time),
        weekIndex: getWeekIndex(time),
        cycleIndex: getCycleIndex(time),
        cycleWeekIndex: getCycleWeekIndex(time),

        matchedUser: matchedUser?.name ?? null,
        similarity,
        error: matchedUser == null ? "No user found" : "",
      };
    });
}

export function computeFromEntries(
  users: Users,
  entries: LogEntries,
): { entries: ParsedLogEntries; labHours: LabHours; usersAtLab: string[] } {
  const parsedEntries = entriesToParsed(users, entries);

  const userProfiles: Record<string, UserProfile> = {};
  const userLastSignIn: Record<string, ParsedLogEntry | null> = {};
  for (const user of users) {
    userProfiles[user.name] = {
      user: user.name,

      total: 0,
      cycles: [],
    };
    userLastSignIn[user.name] = null;
  }

  const filteredEntries = parsedEntries.filter(
    (entry) =>
      !!entry.matchedUser &&
      entry.time.date.year === YEAR &&
      entry.cycleIndex >= 0 &&
      entry.cycleWeekIndex >= 0,
  ) as ({ matchedUser: string } & Omit<ParsedLogEntry, "matchedUser">)[];

  for (const entry of filteredEntries) {
    const {
      time,
      weekday,
      weekIndex,
      cycleIndex,
      cycleWeekIndex,
      matchedUser: user,
      type,
    } = entry;
    const profile = userProfiles[user];
    const lastSignIn = userLastSignIn[user];
    if (type === "in") {
      if (
        lastSignIn &&
        lastSignIn.weekday === weekday &&
        lastSignIn.weekIndex === weekIndex
      ) {
        entry.error = `Signed in again on the same day: ${Weekday[weekday]} Week ${weekIndex}`;
        continue;
      }
      userLastSignIn[user] = entry;
      continue;
    }
    if (type === "out") {
      if (
        !lastSignIn ||
        lastSignIn.weekday !== weekday ||
        lastSignIn.weekIndex !== weekIndex
      ) {
        entry.error = lastSignIn
          ? `Signed out on a different day: in on ${
              Weekday[lastSignIn.weekday]
            } Week ${lastSignIn.weekIndex}, out on ${
              Weekday[weekday]
            } Week ${weekIndex}`
          : `Signed out again on the same day: ${Weekday[weekday]} Week ${weekIndex}`;
        continue;
      }
      userLastSignIn[user] = null;
      const deltaTime =
        (getDate(time).getTime() - getDate(lastSignIn.time).getTime()) /
        MS_PER_HR;
      while (cycleIndex >= profile.cycles.length)
        profile.cycles.push({ total: 0, weeks: [] });
      const cycle = profile.cycles[cycleIndex];
      while (cycleWeekIndex >= cycle.weeks.length)
        cycle.weeks.push({
          total: 0,
          hours: {
            [Weekday.MON]: 0,
            [Weekday.TUE]: 0,
            [Weekday.WED]: 0,
            [Weekday.THU]: 0,
            [Weekday.FRI]: 0,
            [Weekday.SAT]: 0,
            [Weekday.SUN]: 0,
          },
        });
      const week = cycle.weeks[cycleWeekIndex];
      week.hours[weekday] += deltaTime;
      week.total += deltaTime;
      cycle.total += deltaTime;
      profile.total += deltaTime;
    }
  }

  return {
    entries: parsedEntries,
    labHours: { users, userProfiles: Object.values(userProfiles) },
    usersAtLab: Object.keys(userLastSignIn).filter(
      (user) =>
        userLastSignIn[user]?.cycleIndex === getCycleIndex() &&
        userLastSignIn[user]?.cycleWeekIndex === getCycleWeekIndex() &&
        userLastSignIn[user]?.weekday === getWeekday(),
    ),
  };
}

export function getNow(): SimpleTime {
  return getSimpleTime(Date.now());
  // const now = new Date(2025, 1 - 1, 6, 12, 0, 0);
  // return getSimpleTime(now);
}

export function getDate(simple: SimpleDate | SimpleTime) {
  if ("date" in simple)
    return new Date(
      simple.date.year,
      simple.date.month - 1,
      simple.date.day,
      simple.hour,
      simple.minute,
      simple.second,
    );
  return new Date(simple.year, simple.month - 1, simple.day, 0, 0, 0);
}

export function getSimpleDate(date: Date | number): SimpleDate {
  if (typeof date === "number") return getSimpleDate(new Date(date));
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
  };
}

export function getSimpleTime(date: Date | number): SimpleTime {
  if (typeof date === "number") return getSimpleTime(new Date(date));
  return {
    date: getSimpleDate(date),
    hour: date.getHours(),
    minute: date.getMinutes(),
    second: date.getSeconds(),
  };
}

export const MS_PER_S = 1e3;
export const MS_PER_MIN = MS_PER_S * 60;
export const MS_PER_HR = MS_PER_MIN * 60;
export const MS_PER_DAY = MS_PER_HR * 24;

export function stepDate(simple: SimpleDate, n = 1): SimpleDate {
  return getSimpleDate(getDate(simple).getTime() + MS_PER_DAY * n);
}

export function stepTime(simple: SimpleTime, n = 1): SimpleTime {
  return getSimpleTime(getDate(simple).getTime() + MS_PER_DAY * n);
}

export function getWeekday(
  now?: Date | number | SimpleDate | SimpleTime,
): Weekday {
  if (!now) return getWeekday(getNow());
  if (now instanceof Date) return getWeekday(getSimpleTime(now));
  if (typeof now === "number") return getWeekday(new Date(now));
  if (!("date" in now))
    return getWeekday({ date: now, hour: 0, minute: 0, second: 0 });
  const startTime = getDate(START_TIME).getTime();
  const nowTime = getDate(now).getTime();
  return ((Math.floor((nowTime - startTime) / MS_PER_DAY) % 7) + 7) % 7;
}

export function getWeekIndex(
  now?: Date | number | SimpleDate | SimpleTime,
): number {
  if (!now) return getWeekIndex(getNow());
  if (now instanceof Date) return getWeekIndex(getSimpleTime(now));
  if (typeof now === "number") return getWeekIndex(new Date(now));
  if (!("date" in now))
    return getWeekIndex({ date: now, hour: 0, minute: 0, second: 0 });
  const startTime = getDate(START_TIME).getTime();
  const nowTime = getDate(now).getTime();
  return Math.floor((nowTime - startTime) / (MS_PER_DAY * 7));
}

export function getCycleIndex(now?: Date | number | SimpleDate | SimpleTime) {
  const weekIndex = getWeekIndex(now);
  return Math.floor(weekIndex / WEEKS_PER_CYCLE);
}

export function getCycleWeekIndex(
  now?: Date | number | SimpleDate | SimpleTime,
) {
  const weekIndex = getWeekIndex(now);
  const cycleIndex = getCycleIndex(now);
  return weekIndex - cycleIndex * WEEKS_PER_CYCLE;
}

export const MOCK_USERS: Users = Array.from(new Array(100).keys()).map(() => ({
  name: faker.person.fullName(),
  nicknames: [],
}));
const mockWeekHours = (): WeekHours => {
  const data = {} as Record<Weekday, number>;
  let total = 0;
  for (let i = 0; i < 7; i++) {
    const today = Math.random() * 4;
    data[i as Weekday] = today;
    total += today;
  }
  return { total, hours: data };
};
const mockCycleHours = (): CycleHours => {
  const data = [] as WeekHours[];
  let total = 0;
  for (let i = 0; i < WEEKS_PER_CYCLE; i++) {
    const weekHours = mockWeekHours();
    data.push(weekHours);
    total += weekHours.total;
  }
  return { total, weeks: data };
};
export const MOCK_USER_PROFILES: UserProfiles = MOCK_USERS.map((user) => {
  const cycles = [mockCycleHours()];
  let total = 0;
  for (const cycle of cycles) total += cycle.total;
  return {
    user: user.name,

    total,
    cycles,
  };
});
export const MOCK_LAB_HOURS: LabHours = {
  users: MOCK_USERS,
  userProfiles: MOCK_USER_PROFILES,
};
export const MOCK_PEOPLE_HERE = MOCK_USERS.filter(
  () => Math.random() < 0.25,
).map((user) => user.name);
