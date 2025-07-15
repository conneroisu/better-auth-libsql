import { type Client } from "@libsql/client";
import { type AdapterDebugLogs } from "better-auth/adapters";
/**
 * Configuration options for the LibSQL adapter
 */
export interface LibsqlAdapterConfig {
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
/**
 * LibSQL adapter for Better Auth
 */
export declare function libsqlAdapter(config: LibsqlAdapterConfig): (options: import("better-auth/dist/shared/better-auth.DdmVKCUf").B) => import("better-auth/dist/shared/better-auth.DdmVKCUf").a;
export type { Client as LibsqlClient };
//# sourceMappingURL=index.d.ts.map