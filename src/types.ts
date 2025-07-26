export interface SimpleDate {
  year: number;
  month: number;
  day: number;
}

export function isSimpleDate(value: any): value is SimpleDate {
  if (typeof value !== "object") return false;
  if (value == null) return false;
  if (typeof value.year !== "number") return false;
  if (typeof value.month !== "number") return false;
  if (typeof value.day !== "number") return false;
  return true;
}

export interface SimpleTime {
  date: SimpleDate;

  hour: number;
  minute: number;
  second: number;
}

export function isSimpleTime(value: any): value is SimpleTime {
  if (typeof value !== "object") return false;
  if (value == null) return false;
  if (!isSimpleDate(value.date)) return false;
  if (typeof value.hour !== "number") return false;
  if (typeof value.minute !== "number") return false;
  if (typeof value.second !== "number") return false;
  return true;
}

export interface User {
  name: string;
  nicknames: string[];
}

export function isUser(value: any): value is User {
  if (typeof value !== "object") return false;
  if (value == null) return false;
  if (typeof value.name !== "string") return false;
  if (!Array.isArray(value.nicknames)) return false;
  if (value.nicknames.some((nickname: any) => typeof nickname !== "string"))
    return false;
  return true;
}

export type Users = User[];

export function isUsers(value: any): value is Users {
  if (!Array.isArray(value)) return false;
  if (value.some((user: any) => !isUser(user))) return false;
  return true;
}

export enum Weekday {
  MON = 0,
  TUE = 1,
  WED = 2,
  THU = 3,
  FRI = 4,
  SAT = 5,
  SUN = 6,
}

export interface WeekHours {
  total: number;
  hours: Record<Weekday, number>;
}

export function isWeekHours(value: any): value is WeekHours {
  if (typeof value !== "object") return false;
  if (value == null) return false;
  if (typeof value.total !== "number") return false;
  if (typeof value.hours !== "object") return false;
  if (value.hours == null) return false;
  for (let i = 0; i < 7; i++)
    if (typeof value.hours[i] !== "number") return false;
  return true;
}

export interface CycleHours {
  total: number;
  weeks: WeekHours[];
}

export function isCycleHours(value: any): value is CycleHours {
  if (typeof value !== "object") return false;
  if (value == null) return false;
  if (typeof value.total !== "number") return false;
  if (!Array.isArray(value.weeks)) return false;
  if (value.weeks.some((week: any) => !isWeekHours(week))) return false;
  return true;
}

export interface UserProfile {
  user: string;

  total: number;
  cycles: CycleHours[];
}

export function isUserProfile(value: any): value is UserProfile {
  if (typeof value !== "object") return false;
  if (value == null) return false;
  if (typeof value.user !== "string") return false;
  if (typeof value.total !== "number") return false;
  if (!Array.isArray(value.cycles)) return false;
  if (value.cycles.some((cycle: any) => !isCycleHours(cycle))) return false;
  return true;
}

export type UserProfiles = UserProfile[];

export function isUserProfiles(value: any): value is UserProfiles {
  if (!Array.isArray(value)) return false;
  if (value.some((profile: any) => !isUserProfile(profile))) return false;
  return true;
}

export interface LabHours {
  users: Users;
  userProfiles: UserProfiles;
}

export function isLabHours(value: any): value is LabHours {
  if (typeof value !== "object") return false;
  if (value == null) return false;
  if (!isUsers(value.users)) return false;
  if (!isUserProfiles(value.userProfiles)) return false;
  return true;
}

export interface LogEntry {
  time: number;
  user: string;
  type: "in" | "out";
}

export interface ParsedLogEntry {
  time: SimpleTime;
  user: string;
  type: "in" | "out";

  weekday: Weekday;
  weekIndex: number;
  cycleIndex: number;
  cycleWeekIndex: number;

  matchedUser: string | null;
  similarity: number;
  error: string;
}

export function isLogEntry(value: any): value is LogEntry {
  if (typeof value !== "object") return false;
  if (value == null) return false;
  if (typeof value.time !== "number") return false;
  if (typeof value.user !== "string") return false;
  if (!["in", "out"].includes(value.type)) return false;
  return true;
}

export function isParsedLogEntry(value: any): value is ParsedLogEntry {
  if (typeof value !== "object") return false;
  if (value == null) return false;
  if (!isSimpleTime(value.time)) return false;
  if (typeof value.user !== "string") return false;
  if (!["in", "out"].includes(value.type)) return false;
  if (typeof value.weekday !== "number") return false;
  if (typeof value.weekIndex !== "number") return false;
  if (typeof value.cycleIndex !== "number") return false;
  if (typeof value.cycleWeekIndex !== "number") return false;
  if (value.matchedUser !== null && typeof value.matchedUser !== "string")
    return false;
  if (typeof value.similarity !== "number") return false;
  if (typeof value.error !== "string") return false;
  return true;
}

export type LogEntries = LogEntry[];
export type ParsedLogEntries = ParsedLogEntry[];

export function isLogEntries(value: any): value is LogEntries {
  if (!Array.isArray(value)) return false;
  if (value.some((entry: any) => !isLogEntry(entry))) return false;
  return true;
}

export function isParsedLogEntries(value: any): value is ParsedLogEntries {
  if (!Array.isArray(value)) return false;
  if (value.some((entry: any) => !isParsedLogEntry(entry))) return false;
  return true;
}

export interface DatabaseData {
  users: Users;
  logEntries: LogEntries;
}
export function isDatabaseData(value: any): value is DatabaseData {
  if (typeof value !== "object") return false;
  if (value == null) return false;
  if (!isUsers(value.users)) return false;
  if (!isLogEntries(value.logEntries)) return false;
  return true;
}
