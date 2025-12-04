import { TrendingUp, DollarSign, Users, ArrowUp, ArrowDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { ProtocolStats } from "@shared/schema";

interface MetricCardsProps {
  stats: ProtocolStats | undefined;
  isLoading: boolean;
}

function formatCurrency(value: number): string {
  if (value >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(2)}B`;
  }
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2)}M`;
  }
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(2)}K`;
  }
  return `$${value.toLocaleString()}`;
}

function formatNumber(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(2)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`;
  }
  return value.toLocaleString();
}

interface MetricCardProps {
  title: string;
  value: string;
  change?: number;
  icon: React.ReactNode;
  isLoading: boolean;
  testId: string;
  changeTestId: string;
}

function MetricCard({ title, value, change, icon, isLoading, testId, changeTestId }: MetricCardProps) {
  const isPositive = change !== undefined && change >= 0;

  return (
    <Card className="p-6 hover-elevate transition-transform duration-200 cursor-default group" data-testid={`card-${testId}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p 
            className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2"
            data-testid={`label-${testId}`}
          >
            {title}
          </p>
          {isLoading ? (
            <Skeleton className="h-8 w-32 mb-2" />
          ) : (
            <p
              className="text-2xl md:text-3xl font-semibold tabular-nums text-foreground truncate"
              data-testid={`text-${testId}`}
            >
              {value}
            </p>
          )}
          {!isLoading && change !== undefined && (
            <div
              className={`flex items-center gap-1 mt-2 text-sm font-medium ${
                isPositive ? "text-green-500" : "text-red-500"
              }`}
              data-testid={changeTestId}
            >
              {isPositive ? (
                <ArrowUp className="w-3.5 h-3.5" />
              ) : (
                <ArrowDown className="w-3.5 h-3.5" />
              )}
              <span className="tabular-nums">{Math.abs(change).toFixed(1)}%</span>
              <span className="text-muted-foreground font-normal">24h</span>
            </div>
          )}
        </div>
        <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 group-hover:bg-primary/15 transition-colors">
          {icon}
        </div>
      </div>
    </Card>
  );
}

export function MetricCards({ stats, isLoading }: MetricCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6" data-testid="metric-cards-container">
      <MetricCard
        title="Total Trades"
        value={stats ? formatNumber(stats.totalTVL) : "0"}
        change={5.2}
        icon={<TrendingUp className="w-6 h-6 text-primary" />}
        isLoading={isLoading}
        testId="total-trades"
        changeTestId="change-trades"
      />
      <MetricCard
        title="Total Volume"
        value={stats ? formatCurrency(stats.volume24H) : "$0"}
        change={12.8}
        icon={<DollarSign className="w-6 h-6 text-primary" />}
        isLoading={isLoading}
        testId="total-volume"
        changeTestId="change-volume"
      />
      <MetricCard
        title="Total Unique LPs"
        value={stats ? formatNumber(stats.totalUniqueLPs) : "0"}
        change={2.3}
        icon={<Users className="w-6 h-6 text-primary" />}
        isLoading={isLoading}
        testId="total-lps"
        changeTestId="change-lps"
      />
    </div>
  );
}
