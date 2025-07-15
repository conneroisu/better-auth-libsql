# better-auth-libsql

A production-ready LibSQL database adapter for [Better Auth](https://www.better-auth.com/).

[![npm version](https://badge.fury.io/js/better-auth-libsql.svg)](https://badge.fury.io/js/better-auth-libsql)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

✅ **Full Better Auth Compatibility** - Implements all required adapter methods  
✅ **Advanced Query Support** - Handles complex where clauses with multiple operators  
✅ **Multiple Database Types** - Local files, in-memory, and remote Turso databases  
✅ **Embedded Replica Support** - Sync with Turso for offline-first applications  
✅ **TypeScript First** - Full type safety and IntelliSense support  
✅ **Production Ready** - Comprehensive error handling and logging  
✅ **Modern SQL** - Uses parameterized queries and RETURNING clauses  

## Installation

```bash
npm install better-auth-libsql @libsql/client
```

## Quick Start

```typescript
import { betterAuth } from "better-auth";
import { libsqlAdapter } from "better-auth-libsql";

export const auth = betterAuth({
  database: libsqlAdapter({
    url: "libsql://your-database-url",
    authToken: "your-auth-token", // Optional for remote databases
  }),
  emailAndPassword: {
    enabled: true,
  },
});
```

## Configuration

### LibsqlAdapterConfig

```typescript
interface LibsqlAdapterConfig {
  /** Database URL (file path, :memory:, or remote URL) */
  url: string;
  /** Authentication token for remote databases */
  authToken?: string;
  /** Sync URL for embedded replicas */
  syncUrl?: string;
  /** Sync interval in milliseconds */
  syncInterval?: number;
  /** Encryption key for local databases */
  encryptionKey?: string;
  /** Debug logging configuration */
  debugLogs?: AdapterDebugLogs;
  /** Whether to use plural table names */
  usePlural?: boolean;
}
```

## Usage Examples

### Local File Database

Perfect for development and small applications:

```typescript
import { libsqlAdapter } from "better-auth-libsql";

const adapter = libsqlAdapter({
  url: "file:./database.db",
});
```

### In-Memory Database

Ideal for testing:

```typescript
const adapter = libsqlAdapter({
  url: ":memory:",
});
```

### Remote Database (Turso)

For production applications:

```typescript
const adapter = libsqlAdapter({
  url: "libsql://your-database-name.turso.io",
  authToken: process.env.TURSO_AUTH_TOKEN,
});
```

### Embedded Replica

Best of both worlds - local performance with cloud sync:

```typescript
const adapter = libsqlAdapter({
  url: "file:./local-replica.db",
  syncUrl: "libsql://your-database-name.turso.io",
  authToken: process.env.TURSO_AUTH_TOKEN,
  syncInterval: 5000, // Sync every 5 seconds
});
```

### With Debug Logging

Enable detailed logging for troubleshooting:

```typescript
const adapter = libsqlAdapter({
  url: "file:./database.db",
  debugLogs: {
    create: true,
    findOne: true,
    update: true,
    // Enable specific operations
  },
});
```

## Database Schema

The adapter works with the standard Better Auth schema. You can create the tables manually or use the Better Auth CLI:

### Using Better Auth CLI

```bash
npx @better-auth/cli generate --output schema.sql
```

### Manual Schema Creation

See the included schema files:
- [`schema.sql`](./schema.sql) - For string IDs
- [`schema-numeric-id.sql`](./schema-numeric-id.sql) - For numeric IDs

## Advanced Features

### Query Operators

The adapter supports all Better Auth query operators:

- `eq` - Equality (default)
- `ne` - Not equal
- `contains` - String contains (uses LIKE %value%)
- `starts_with` - String starts with (uses LIKE value%)
- `ends_with` - String ends with (uses LIKE %value)
- `lt`, `lte`, `gt`, `gte` - Numeric comparisons
- `in` - Array membership

### Error Handling

All database operations include comprehensive error handling with descriptive error messages:

```typescript
try {
  await auth.api.signUpEmail({
    email: "user@example.com",
    password: "password123",
    name: "John Doe",
  });
} catch (error) {
  console.error("Sign up failed:", error.message);
}
```

### Type Safety

The adapter is fully typed and provides excellent TypeScript IntelliSense:

```typescript
import type { LibsqlAdapterConfig, LibsqlClient } from "better-auth-libsql";

const config: LibsqlAdapterConfig = {
  url: "file:./database.db",
  // TypeScript will provide autocompletion for all options
};
```

## Environment Variables

For production applications, use environment variables:

```bash
# .env
TURSO_DATABASE_URL=libsql://your-database-name.turso.io
TURSO_AUTH_TOKEN=your-auth-token

# For embedded replicas
TURSO_SYNC_URL=libsql://your-database-name.turso.io
```

```typescript
const adapter = libsqlAdapter({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
  syncUrl: process.env.TURSO_SYNC_URL,
});
```

## Testing

Run the comprehensive test suite:

```bash
npm test
```

The adapter includes tests for:
- ✅ All CRUD operations
- ✅ Complex queries with operators
- ✅ String and numeric ID support
- ✅ Error handling
- ✅ Edge cases

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and add tests
4. Run tests: `npm test`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

## License

MIT © [Conner Ohnesorge](https://github.com/conneroisu)

## Related

- [Better Auth](https://www.better-auth.com/) - The authentication library
- [LibSQL](https://turso.tech/libsql) - The database engine
- [Turso](https://turso.tech/) - The edge database platform

---

Made with ❤️ for the Better Auth community