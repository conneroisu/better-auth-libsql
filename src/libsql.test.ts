import { describe, beforeEach, afterEach } from "vitest";
import { runAdapterTest } from "better-auth/adapters/test";
import { libsqlAdapter } from "./index";
import { unlinkSync } from "fs";

describe("LibSQL Adapter Tests", async () => {
  let testDbPath: string;
  let adapter: ReturnType<typeof libsqlAdapter>;

  beforeEach(async () => {
    // Create unique test database for each test
    testDbPath = `./test-${Date.now()}-${Math.random().toString(36).substring(7)}.db`;
    
    adapter = libsqlAdapter({
      url: `file:${testDbPath}`,
      debugLogs: {
        isRunningAdapterTests: true,
      },
    });

    const client = (adapter as any).client;
    
    // Create Better Auth schema
    await client.execute(`
      CREATE TABLE user (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        emailVerified INTEGER DEFAULT 0,
        image TEXT,
        createdAt INTEGER NOT NULL,
        updatedAt INTEGER NOT NULL
      )
    `);

    await client.execute(`
      CREATE TABLE session (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        expiresAt INTEGER NOT NULL,
        token TEXT NOT NULL,
        createdAt INTEGER NOT NULL,
        updatedAt INTEGER NOT NULL,
        FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE
      )
    `);

    await client.execute(`
      CREATE TABLE account (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        accountId TEXT NOT NULL,
        providerId TEXT NOT NULL,
        accessToken TEXT,
        refreshToken TEXT,
        idToken TEXT,
        accessTokenExpiresAt INTEGER,
        refreshTokenExpiresAt INTEGER,
        scope TEXT,
        password TEXT,
        createdAt INTEGER NOT NULL,
        updatedAt INTEGER NOT NULL,
        FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE
      )
    `);

    await client.execute(`
      CREATE TABLE verification (
        id TEXT PRIMARY KEY,
        identifier TEXT NOT NULL,
        value TEXT NOT NULL,
        expiresAt INTEGER NOT NULL,
        createdAt INTEGER NOT NULL,
        updatedAt INTEGER
      )
    `);
  });

  afterEach(async () => {
    // Clean up test database
    try {
      const client = (adapter as any).client;
      await client.close();
      unlinkSync(testDbPath);
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  await runAdapterTest({
    getAdapter: async (options) => {
      // The test framework expects getAdapter to return the adapter object directly
      return adapter;
    },
  });
});