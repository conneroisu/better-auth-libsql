import { betterAuth } from "better-auth";
import { libsqlAdapter } from "../src/index.js";

// Local file database - great for development
export const localAuth = betterAuth({
  database: libsqlAdapter({
    url: "file:./auth.db",
  }),
  emailAndPassword: {
    enabled: true,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 1 week
  },
});

// Turso remote database - production ready
export const tursoAuth = betterAuth({
  database: libsqlAdapter({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
  },
});

// Embedded replica - best of both worlds
export const replicaAuth = betterAuth({
  database: libsqlAdapter({
    url: "file:./local-replica.db",
    syncUrl: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
    syncInterval: 5000, // Sync every 5 seconds
  }),
  emailAndPassword: {
    enabled: true,
  },
  session: {
    updateAge: 60 * 60 * 24, // Update session every day
  },
});

// With debug logging enabled
export const debugAuth = betterAuth({
  database: libsqlAdapter({
    url: "file:./debug.db",
    debugLogs: {
      create: true,
      findOne: true,
      update: true,
      delete: true,
    },
  }),
  emailAndPassword: {
    enabled: true,
  },
});

// In-memory database for testing
export const testAuth = betterAuth({
  database: libsqlAdapter({
    url: ":memory:",
  }),
  emailAndPassword: {
    enabled: true,
  },
});