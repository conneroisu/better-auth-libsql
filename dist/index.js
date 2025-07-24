import { createClient } from "@libsql/client";
import { createAdapter } from "better-auth/adapters";
/**
 * Build SQL WHERE clause from conditions
 */
function buildWhereClause(where) {
    if (!where || where.length === 0) {
        return { sql: "", args: [] };
    }
    const conditions = [];
    const args = [];
    for (const condition of where) {
        const { field, value, operator = "eq" } = condition;
        let clause = "";
        switch (operator) {
            case "eq":
                clause = `${field} = ?`;
                args.push(value);
                break;
            case "ne":
                clause = `${field} != ?`;
                args.push(value);
                break;
            case "contains":
                clause = `${field} LIKE ?`;
                args.push(`%${value}%`);
                break;
            case "starts_with":
                clause = `${field} LIKE ?`;
                args.push(`${value}%`);
                break;
            case "ends_with":
                clause = `${field} LIKE ?`;
                args.push(`%${value}`);
                break;
            case "lt":
                clause = `${field} < ?`;
                args.push(value);
                break;
            case "lte":
                clause = `${field} <= ?`;
                args.push(value);
                break;
            case "gt":
                clause = `${field} > ?`;
                args.push(value);
                break;
            case "gte":
                clause = `${field} >= ?`;
                args.push(value);
                break;
            case "in":
                if (Array.isArray(value) && value.length > 0) {
                    const placeholders = value.map(() => "?").join(", ");
                    clause = `${field} IN (${placeholders})`;
                    args.push(...value);
                }
                break;
            default:
                throw new Error(`Unsupported operator: ${operator}`);
        }
        if (clause) {
            conditions.push(clause);
        }
    }
    const sql = conditions.join(" AND ");
    return { sql: ` WHERE ${sql}`, args };
}
/**
 * LibSQL adapter for Better Auth
 */
export function libsqlAdapter(config) {
    const clientConfig = {
        url: config.url,
    };
    if (config.authToken) {
        clientConfig.authToken = config.authToken;
    }
    if (config.syncUrl) {
        clientConfig.syncUrl = config.syncUrl;
    }
    if (config.syncInterval) {
        clientConfig.syncInterval = config.syncInterval;
    }
    if (config.encryptionKey) {
        clientConfig.encryptionKey = config.encryptionKey;
    }
    const client = createClient(clientConfig);
    const adapter = createAdapter({
        config: {
            adapterId: "libsql",
            adapterName: "LibSQL Adapter",
            usePlural: config.usePlural ?? false,
            debugLogs: config.debugLogs ?? false,
            supportsJSON: true,
            supportsDates: true,
            supportsBooleans: true,
            supportsNumericIds: true,
        },
        adapter: ({ debugLog }) => {
            return {
                create: async ({ model, data, select, forceAllowId }) => {
                    const record = data;
                    // Filter out undefined values and handle id based on forceAllowId
                    const filteredRecord = {};
                    for (const [key, value] of Object.entries(record)) {
                        if (value !== undefined) {
                            // Skip id field unless forceAllowId is true
                            if (key === 'id' && !forceAllowId) {
                                continue;
                            }
                            filteredRecord[key] = value;
                        }
                    }
                    const columns = Object.keys(filteredRecord);
                    const values = Object.values(filteredRecord);
                    const placeholders = columns.map(() => "?").join(", ");
                    const selectClause = select && select.length > 0 ? select.join(", ") : "*";
                    const sql = `INSERT INTO ${model} (${columns.join(", ")}) VALUES (${placeholders}) RETURNING ${selectClause}`;
                    debugLog("create", { model, data, sql, forceAllowId });
                    try {
                        const result = await client.execute({
                            sql,
                            args: values,
                        });
                        if (result.rows.length === 0) {
                            throw new Error(`Failed to create record in ${model}`);
                        }
                        return result.rows[0];
                    }
                    catch (error) {
                        throw new Error(`Create operation failed: ${error instanceof Error ? error.message : String(error)}`);
                    }
                },
                update: async ({ model, where, update }) => {
                    const updateRecord = update;
                    const setClauses = Object.keys(updateRecord)
                        .map((key) => `${key} = ?`)
                        .join(", ");
                    const { sql: whereSql, args: whereArgs } = buildWhereClause(where);
                    const sql = `UPDATE ${model} SET ${setClauses}${whereSql} RETURNING *`;
                    const args = [...Object.values(updateRecord), ...whereArgs];
                    debugLog("update", { model, where, update, sql });
                    try {
                        const result = await client.execute({
                            sql,
                            args,
                        });
                        return result.rows.length > 0 ? result.rows[0] : null;
                    }
                    catch (error) {
                        throw new Error(`Update operation failed: ${error instanceof Error ? error.message : String(error)}`);
                    }
                },
                updateMany: async ({ model, where, update }) => {
                    const updateRecord = update;
                    const setClauses = Object.keys(updateRecord)
                        .map((key) => `${key} = ?`)
                        .join(", ");
                    const { sql: whereSql, args: whereArgs } = buildWhereClause(where);
                    const sql = `UPDATE ${model} SET ${setClauses}${whereSql}`;
                    const args = [...Object.values(updateRecord), ...whereArgs];
                    debugLog("updateMany", { model, where, update, sql });
                    try {
                        const result = await client.execute({
                            sql,
                            args,
                        });
                        return result.rowsAffected;
                    }
                    catch (error) {
                        throw new Error(`UpdateMany operation failed: ${error instanceof Error ? error.message : String(error)}`);
                    }
                },
                delete: async ({ model, where }) => {
                    const { sql: whereSql, args: whereArgs } = buildWhereClause(where);
                    const sql = `DELETE FROM ${model}${whereSql}`;
                    debugLog("delete", { model, where, sql });
                    try {
                        await client.execute({
                            sql,
                            args: whereArgs,
                        });
                    }
                    catch (error) {
                        throw new Error(`Delete operation failed: ${error instanceof Error ? error.message : String(error)}`);
                    }
                },
                deleteMany: async ({ model, where }) => {
                    const { sql: whereSql, args: whereArgs } = buildWhereClause(where);
                    const sql = `DELETE FROM ${model}${whereSql}`;
                    debugLog("deleteMany", { model, where, sql });
                    try {
                        const result = await client.execute({
                            sql,
                            args: whereArgs,
                        });
                        return result.rowsAffected;
                    }
                    catch (error) {
                        throw new Error(`DeleteMany operation failed: ${error instanceof Error ? error.message : String(error)}`);
                    }
                },
                findOne: async ({ model, where, select }) => {
                    const { sql: whereSql, args: whereArgs } = buildWhereClause(where);
                    const selectClause = select ? select.join(", ") : "*";
                    const sql = `SELECT ${selectClause} FROM ${model}${whereSql} LIMIT 1`;
                    debugLog("findOne", { model, where, select, sql });
                    try {
                        const result = await client.execute({
                            sql,
                            args: whereArgs,
                        });
                        return result.rows.length > 0 ? result.rows[0] : null;
                    }
                    catch (error) {
                        throw new Error(`FindOne operation failed: ${error instanceof Error ? error.message : String(error)}`);
                    }
                },
                findMany: async ({ model, where, limit, sortBy, offset }) => {
                    let sql = `SELECT * FROM ${model}`;
                    let args = [];
                    if (where && where.length > 0) {
                        const { sql: whereSql, args: whereArgs } = buildWhereClause(where);
                        sql += whereSql;
                        args.push(...whereArgs);
                    }
                    if (sortBy) {
                        sql += ` ORDER BY ${sortBy.field} ${sortBy.direction === "asc" ? "ASC" : "DESC"}`;
                    }
                    if (limit) {
                        sql += ` LIMIT ?`;
                        args.push(limit);
                    }
                    if (offset) {
                        sql += ` OFFSET ?`;
                        args.push(offset);
                    }
                    debugLog("findMany", { model, where, limit, sortBy, offset, sql });
                    try {
                        const result = await client.execute({
                            sql,
                            args,
                        });
                        return result.rows;
                    }
                    catch (error) {
                        throw new Error(`FindMany operation failed: ${error instanceof Error ? error.message : String(error)}`);
                    }
                },
                count: async ({ model, where }) => {
                    let sql = `SELECT COUNT(*) as count FROM ${model}`;
                    let args = [];
                    if (where && where.length > 0) {
                        const { sql: whereSql, args: whereArgs } = buildWhereClause(where);
                        sql += whereSql;
                        args.push(...whereArgs);
                    }
                    debugLog("count", { model, where, sql });
                    try {
                        const result = await client.execute({
                            sql,
                            args,
                        });
                        const countResult = result.rows[0];
                        if (!countResult || !('count' in countResult)) {
                            throw new Error('Count query returned invalid result');
                        }
                        return Number(countResult.count);
                    }
                    catch (error) {
                        throw new Error(`Count operation failed: ${error instanceof Error ? error.message : String(error)}`);
                    }
                },
                options: config,
            };
        },
    });
    // Expose client for testing purposes while maintaining adapter interface
    Object.defineProperty(adapter, 'client', {
        value: client,
        writable: false,
        enumerable: false,
        configurable: false,
    });
    return adapter;
}
