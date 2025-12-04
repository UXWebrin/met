import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const leaderboardEntrySchema = z.object({
  rank: z.number(),
  wallet: z.string(),
  activePositions: z.number(),
  volume7D: z.number(),
  feesLifetime: z.number(),
});

export type LeaderboardEntry = z.infer<typeof leaderboardEntrySchema>;

export const protocolStatsSchema = z.object({
  totalTVL: z.number(),
  volume24H: z.number(),
  totalUniqueLPs: z.number(),
});

export type ProtocolStats = z.infer<typeof protocolStatsSchema>;

export type SortField = "rank" | "volume7D" | "feesLifetime";
export type SortDirection = "asc" | "desc";

export const positionSchema = z.object({
  id: z.string(),
  poolName: z.string(),
  tokenPair: z.string(),
  liquidity: z.number(),
  fees24H: z.number(),
  fees7D: z.number(),
  apr: z.number(),
  inRange: z.boolean(),
});

export type Position = z.infer<typeof positionSchema>;

export const volumeDataPointSchema = z.object({
  date: z.string(),
  volume: z.number(),
});

export type VolumeDataPoint = z.infer<typeof volumeDataPointSchema>;

export const feeDataPointSchema = z.object({
  date: z.string(),
  fees: z.number(),
  cumulative: z.number(),
});

export type FeeDataPoint = z.infer<typeof feeDataPointSchema>;

export const lpProfileSchema = z.object({
  wallet: z.string(),
  rank: z.number(),
  totalLiquidity: z.number(),
  activePositions: z.number(),
  volume7D: z.number(),
  volume30D: z.number(),
  feesLifetime: z.number(),
  fees24H: z.number(),
  fees7D: z.number(),
  avgApr: z.number(),
  positions: z.array(positionSchema),
  volumeHistory: z.array(volumeDataPointSchema),
  feeHistory: z.array(feeDataPointSchema),
});

export type LPProfile = z.infer<typeof lpProfileSchema>;
