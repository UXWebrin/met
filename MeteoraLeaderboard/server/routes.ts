import type { Express } from "express";
import { createServer, type Server } from "http";
import { DuneClient } from "@duneanalytics/client-sdk";
import type { LeaderboardEntry, ProtocolStats, LPProfile, Position, VolumeDataPoint, FeeDataPoint } from "@shared/schema";

const DUNE_QUERY_ID = 6262729;

let cachedLeaderboardData: LeaderboardEntry[] | null = null;
let lastFetchTime: number = 0;
const CACHE_DURATION = 5 * 60 * 1000;

async function fetchDuneData(): Promise<LeaderboardEntry[]> {
  const now = Date.now();
  
  if (cachedLeaderboardData && (now - lastFetchTime) < CACHE_DURATION) {
    console.log("[Dune] Returning cached data");
    return cachedLeaderboardData;
  }

  try {
    console.log("[Dune] Fetching fresh data from query", DUNE_QUERY_ID);
    const apiKey = process.env.DUNE_API_KEY;
    
    if (!apiKey) {
      console.error("[Dune] DUNE_API_KEY not found");
      throw new Error("DUNE_API_KEY environment variable is not set");
    }

    const dune = new DuneClient(apiKey);
    const queryResult = await dune.getLatestResult({ queryId: DUNE_QUERY_ID });
    
    if (!queryResult?.result?.rows) {
      console.error("[Dune] No rows returned from query");
      throw new Error("No data returned from Dune query");
    }

    const rows = queryResult.result.rows as any[];
    console.log(`[Dune] Received ${rows.length} rows from query`);

    const leaderboardData: LeaderboardEntry[] = rows.map((row: any, index: number) => ({
      rank: index + 1,
      wallet: row.trader_id || row.wallet || row.user_address || row.address || "",
      activePositions: row.trade_count || row.active_positions || 0,
      volume7D: row.total_volume_usd || row.volume_7d || 0,
      feesLifetime: Math.floor((row.total_volume_usd || 0) * 0.003),
    }));

    cachedLeaderboardData = leaderboardData;
    lastFetchTime = now;
    
    console.log("[Dune] Data cached successfully");
    return leaderboardData;
  } catch (error) {
    console.error("[Dune] Error fetching data:", error);
    
    if (cachedLeaderboardData) {
      console.log("[Dune] Returning stale cached data");
      return cachedLeaderboardData;
    }
    
    throw error;
  }
}

function calculateProtocolStats(entries: LeaderboardEntry[]): ProtocolStats {
  const totalTrades = entries.reduce((sum, e) => sum + e.activePositions, 0);
  const totalVolume = entries.reduce((sum, e) => sum + e.volume7D, 0);
  
  return {
    totalTVL: totalTrades,
    volume24H: Math.floor(totalVolume),
    totalUniqueLPs: entries.length,
  };
}

const poolNames = [
  "SOL-USDC", "SOL-USDT", "mSOL-SOL", "stSOL-SOL", "RAY-SOL",
  "JTO-SOL", "BONK-SOL", "WIF-SOL", "JUP-SOL", "PYTH-SOL",
  "ORCA-SOL", "MNGO-SOL", "SRM-SOL", "STEP-SOL", "COPE-SOL",
  "ETH-SOL", "BTC-SOL", "AVAX-SOL", "MATIC-SOL", "LINK-SOL",
];

function generatePositions(count: number, baseMultiplier: number): Position[] {
  const positions: Position[] = [];
  for (let i = 0; i < count; i++) {
    const poolName = poolNames[i % poolNames.length];
    const [tokenA, tokenB] = poolName.split("-");
    positions.push({
      id: `pos-${i + 1}`,
      poolName,
      tokenPair: `${tokenA}/${tokenB}`,
      liquidity: Math.floor((Math.random() * 50000 + 10000) * baseMultiplier),
      fees24H: Math.floor(Math.random() * 100 + 10) * baseMultiplier,
      fees7D: Math.floor(Math.random() * 700 + 70) * baseMultiplier,
      apr: Math.floor(Math.random() * 80 + 20) + Math.random(),
      inRange: Math.random() > 0.2,
    });
  }
  return positions;
}

function generateVolumeHistory(baseVolume: number): VolumeDataPoint[] {
  const history: VolumeDataPoint[] = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const variance = 0.5 + Math.random();
    history.push({
      date: date.toISOString().split("T")[0],
      volume: Math.floor((baseVolume / 7) * variance),
    });
  }
  return history;
}

function generateFeeHistory(baseFeesLifetime: number): FeeDataPoint[] {
  const history: FeeDataPoint[] = [];
  const today = new Date();
  let cumulative = baseFeesLifetime * 0.3;
  const dailyFee = (baseFeesLifetime * 0.7) / 30;
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const variance = 0.5 + Math.random();
    const fees = Math.floor(dailyFee * variance);
    cumulative += fees;
    history.push({
      date: date.toISOString().split("T")[0],
      fees,
      cumulative: Math.floor(cumulative),
    });
  }
  return history;
}

function generateLPProfile(entry: LeaderboardEntry, totalEntries: number): LPProfile {
  const baseMultiplier = Math.max(0.1, (totalEntries - entry.rank + 1) / (totalEntries / 2));
  const positionCount = entry.activePositions || Math.max(1, Math.floor(Math.random() * 10) + 1);
  const positions = generatePositions(positionCount, baseMultiplier);
  const totalLiquidity = positions.reduce((sum, p) => sum + p.liquidity, 0);
  const fees24H = positions.reduce((sum, p) => sum + p.fees24H, 0);
  const fees7D = positions.reduce((sum, p) => sum + p.fees7D, 0);
  const avgApr = positions.reduce((sum, p) => sum + p.apr, 0) / positions.length;

  return {
    wallet: entry.wallet,
    rank: entry.rank,
    totalLiquidity,
    activePositions: positionCount,
    volume7D: entry.volume7D,
    volume30D: entry.volume7D * 4.2,
    feesLifetime: entry.feesLifetime,
    fees24H,
    fees7D,
    avgApr,
    positions,
    volumeHistory: generateVolumeHistory(entry.volume7D),
    feeHistory: generateFeeHistory(entry.feesLifetime),
  };
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.get("/api/leaderboard", async (_req, res) => {
    try {
      const data = await fetchDuneData();
      res.json(data);
    } catch (error) {
      console.error("[API] Error fetching leaderboard:", error);
      res.status(500).json({ error: "Failed to fetch leaderboard data" });
    }
  });

  app.get("/api/stats", async (_req, res) => {
    try {
      const data = await fetchDuneData();
      const stats = calculateProtocolStats(data);
      res.json(stats);
    } catch (error) {
      console.error("[API] Error fetching stats:", error);
      res.status(500).json({ error: "Failed to fetch protocol stats" });
    }
  });

  app.get("/api/lp/:wallet", async (req, res) => {
    try {
      const { wallet } = req.params;
      const data = await fetchDuneData();
      const entry = data.find((e) => e.wallet === wallet);
      
      if (!entry) {
        return res.status(404).json({ error: "LP not found" });
      }
      
      const profile = generateLPProfile(entry, data.length);
      res.json(profile);
    } catch (error) {
      console.error("[API] Error fetching LP profile:", error);
      res.status(500).json({ error: "Failed to fetch LP profile" });
    }
  });

  return httpServer;
}
