import { useState } from "react";
import { Header } from "@/components/dashboard/header";
import { MetricCards } from "@/components/dashboard/metric-cards";
import { SearchBar } from "@/components/dashboard/search-bar";
import { LeaderboardTable } from "@/components/dashboard/leaderboard-table";
import { LPProfileModal } from "@/components/dashboard/lp-profile-modal";
import { useLeaderboardData, useProtocolStats } from "@/hooks/use-leaderboard";

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  const { data: leaderboardData, isLoading: isLoadingLeaderboard } = useLeaderboardData();
  const { data: stats, isLoading: isLoadingStats } = useProtocolStats();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <section className="mb-8" aria-labelledby="protocol-stats">
          <h2 id="protocol-stats" className="sr-only">Protocol Statistics</h2>
          <MetricCards stats={stats} isLoading={isLoadingStats} />
        </section>

        <section aria-labelledby="leaderboard-section">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h2 
              id="leaderboard-section" 
              className="text-lg font-semibold text-foreground"
            >
              Top Traders
            </h2>
            <SearchBar value={searchQuery} onChange={setSearchQuery} />
          </div>
          
          <LeaderboardTable
            data={leaderboardData}
            isLoading={isLoadingLeaderboard}
            searchQuery={searchQuery}
            onWalletClick={setSelectedWallet}
          />
        </section>
      </main>

      <footer className="border-t border-border mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-muted-foreground">
            Meteora Zap Out Leaderboard — Tracking top traders
          </p>
        </div>
      </footer>

      <LPProfileModal
        wallet={selectedWallet}
        onClose={() => setSelectedWallet(null)}
      />
    </div>
  );
}
