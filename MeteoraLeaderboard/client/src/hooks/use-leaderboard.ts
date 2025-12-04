import { useQuery } from "@tanstack/react-query";
import type { LeaderboardEntry, ProtocolStats } from "@shared/schema";

export function useLeaderboardData() {
  return useQuery<LeaderboardEntry[]>({
    queryKey: ["/api/leaderboard"],
  });
}

export function useProtocolStats() {
  return useQuery<ProtocolStats>({
    queryKey: ["/api/stats"],
  });
}
