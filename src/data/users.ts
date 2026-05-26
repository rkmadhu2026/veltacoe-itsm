import type { User } from "@/types";

export const USERS: readonly User[] = [
  { id: "u1", name: "Priya Raghunathan", email: "priya.r@finspot.in",  role: "Incident Commander", team: "SRE Platform", color: "amber",  status: "online",  last: "now" },
  { id: "u2", name: "Marcus Okafor",     email: "marcus.o@finspot.in", role: "Admin",              team: "Platform",     color: "purple", status: "online",  last: "2m"  },
  { id: "u3", name: "Yuki Tanaka",       email: "yuki.t@finspot.in",   role: "Responder",          team: "Networking",   color: "teal",   status: "online",  last: "now" },
  { id: "u4", name: "Elena Kowalski",    email: "elena.k@finspot.in",  role: "Responder",          team: "Database",     color: "pink",   status: "away",    last: "14m" },
  { id: "u5", name: "Devon Hassan",      email: "devon.h@finspot.in",  role: "Manager",            team: "SRE Platform", color: "green",  status: "online",  last: "5m"  },
  { id: "u6", name: "Sasha Volkov",      email: "sasha.v@finspot.in",  role: "Viewer",             team: "Finance Ops",  color: "slate",  status: "offline", last: "1d"  },
  { id: "u7", name: "Jamal Washington",  email: "jamal.w@finspot.in",  role: "Responder",          team: "Security",     color: "slate",  status: "online",  last: "1m"  },
  { id: "u8", name: "Noor Rahimi",       email: "noor.r@finspot.in",   role: "Admin",              team: "Platform",     color: "amber",  status: "online",  last: "now" },
];

export const userById = (id: string | null | undefined): User | undefined =>
  id ? USERS.find((u) => u.id === id) : undefined;
