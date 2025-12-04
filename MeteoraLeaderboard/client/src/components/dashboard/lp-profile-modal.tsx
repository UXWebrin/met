import { useQuery } from "@tanstack/react-query";
import { Trophy, Medal, TrendingUp, DollarSign, Wallet, Activity, Copy, Check } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Bar,
  Line,
  ComposedChart,
} from "recharts";
import type { LPProfile } from "@shared/schema";

interface LPProfileModalProps {
  wallet: string | null;
  onClose: () => void;
}

function formatCurrency(value: number, compact = false): string {
  if (compact) {
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
    if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  }
  return `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatWallet(wallet: string): string {
  if (wallet.length <= 10) return wallet;
  return `${wallet.slice(0, 6)}...${wallet.slice(-4)}`;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getRankBadge(rank: number) {
  if (rank === 1) {
    return (
      <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30" data-testid="badge-rank-1">
        <Trophy className="w-3 h-3 mr-1" />
        #1
      </Badge>
    );
  }
  if (rank === 2) {
    return (
      <Badge className="bg-gray-400/20 text-gray-400 border-gray-400/30" data-testid="badge-rank-2">
        <Medal className="w-3 h-3 mr-1" />
        #2
      </Badge>
    );
  }
  if (rank === 3) {
    return (
      <Badge className="bg-amber-600/20 text-amber-600 border-amber-600/30" data-testid="badge-rank-3">
        <Medal className="w-3 h-3 mr-1" />
        #3
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="text-muted-foreground" data-testid={`badge-rank-${rank}`}>
      #{rank}
    </Badge>
  );
}

function StatCard({ label, value, icon, testId }: { label: string; value: string; icon: React.ReactNode; testId: string }) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/30 border border-border/50" data-testid={`stat-card-${testId}`}>
      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 border border-primary/20">
        {icon}
      </div>
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wider" data-testid={`label-${testId}`}>{label}</p>
        <p className="text-lg font-semibold tabular-nums" data-testid={`value-${testId}`}>{value}</p>
      </div>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="space-y-6" data-testid="profile-skeleton">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-6 w-24" />
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-lg" />
        ))}
      </div>
      <Skeleton className="h-64 rounded-lg" />
    </div>
  );
}

function VolumeChart({ data }: { data: LPProfile["volumeHistory"] }) {
  return (
    <div data-testid="chart-volume-trend">
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
            axisLine={{ stroke: "hsl(var(--border))" }}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={60}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            }}
            labelFormatter={(label) => formatDate(label)}
            formatter={(value: number) => [formatCurrency(value), "Volume"]}
          />
          <Area
            type="monotone"
            dataKey="volume"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            fill="url(#volumeGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function FeeChart({ data }: { data: LPProfile["feeHistory"] }) {
  return (
    <div data-testid="chart-fee-history">
      <ResponsiveContainer width="100%" height={280}>
        <ComposedChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="feeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.8} />
              <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
            axisLine={{ stroke: "hsl(var(--border))" }}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            yAxisId="left"
            tickFormatter={(v) => `$${v}`}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={50}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tickFormatter={(v) => `$${(v / 1000).toFixed(1)}K`}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={60}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            }}
            labelFormatter={(label) => formatDate(label)}
            formatter={(value: number, name: string) => [
              formatCurrency(value),
              name === "fees" ? "Daily Fees" : "Cumulative",
            ]}
          />
          <Bar
            yAxisId="left"
            dataKey="fees"
            fill="url(#feeGradient)"
            radius={[2, 2, 0, 0]}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="cumulative"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

function PositionsTable({ positions }: { positions: LPProfile["positions"] }) {
  return (
    <div className="overflow-x-auto" data-testid="positions-table-container">
      <Table>
        <TableHeader className="bg-muted/30 sticky top-0 z-10">
          <TableRow className="hover:bg-transparent">
            <TableHead className="text-xs uppercase tracking-wider px-6 py-4" data-testid="header-pool">Pool</TableHead>
            <TableHead className="text-xs uppercase tracking-wider text-right px-6 py-4" data-testid="header-liquidity">Liquidity</TableHead>
            <TableHead className="text-xs uppercase tracking-wider text-right px-6 py-4" data-testid="header-fees-24h">24H Fees</TableHead>
            <TableHead className="text-xs uppercase tracking-wider text-right px-6 py-4" data-testid="header-fees-7d">7D Fees</TableHead>
            <TableHead className="text-xs uppercase tracking-wider text-right px-6 py-4" data-testid="header-apr">APR</TableHead>
            <TableHead className="text-xs uppercase tracking-wider text-center px-6 py-4" data-testid="header-status">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {positions.map((position) => (
            <TableRow key={position.id} data-testid={`position-row-${position.id}`}>
              <TableCell className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-xs font-medium">
                    {position.tokenPair.split("/")[0].slice(0, 2)}
                  </div>
                  <div>
                    <p className="font-medium text-sm" data-testid={`text-pool-${position.id}`}>{position.poolName}</p>
                    <p className="text-xs text-muted-foreground">{position.tokenPair}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-right px-6 py-4">
                <span className="tabular-nums font-medium" data-testid={`text-liquidity-${position.id}`}>
                  {formatCurrency(position.liquidity, true)}
                </span>
              </TableCell>
              <TableCell className="text-right px-6 py-4">
                <span className="tabular-nums text-green-500" data-testid={`text-fees24h-${position.id}`}>
                  +{formatCurrency(position.fees24H)}
                </span>
              </TableCell>
              <TableCell className="text-right px-6 py-4">
                <span className="tabular-nums text-green-500" data-testid={`text-fees7d-${position.id}`}>
                  +{formatCurrency(position.fees7D)}
                </span>
              </TableCell>
              <TableCell className="text-right px-6 py-4">
                <span className="tabular-nums font-medium text-primary" data-testid={`text-apr-${position.id}`}>
                  {position.apr.toFixed(1)}%
                </span>
              </TableCell>
              <TableCell className="text-center px-6 py-4">
                {position.inRange ? (
                  <Badge className="bg-green-500/20 text-green-500 border-green-500/30" data-testid={`badge-status-${position.id}`}>
                    In Range
                  </Badge>
                ) : (
                  <Badge className="bg-red-500/20 text-red-500 border-red-500/30" data-testid={`badge-status-${position.id}`}>
                    Out of Range
                  </Badge>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function LPProfileModal({ wallet, onClose }: LPProfileModalProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const { data: profile, isLoading } = useQuery<LPProfile>({
    queryKey: ["/api/lp", wallet],
    enabled: !!wallet,
  });

  const handleCopy = async () => {
    if (!wallet) return;
    try {
      await navigator.clipboard.writeText(wallet);
      setCopied(true);
      toast({ title: "Copied!", description: "Wallet address copied to clipboard" });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "Failed to copy", variant: "destructive" });
    }
  };

  return (
    <Dialog open={!!wallet} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" data-testid="lp-profile-modal">
        <DialogHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold" data-testid="modal-title">LP Profile</DialogTitle>
          </div>
          {isLoading ? (
            <ProfileSkeleton />
          ) : profile ? (
            <div className="space-y-6" data-testid="profile-content">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
                    <Wallet className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <code className="font-mono text-sm bg-muted px-2 py-1 rounded tabular-nums" data-testid="profile-wallet">
                        {formatWallet(profile.wallet)}
                      </code>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={handleCopy}
                        className="h-7 w-7"
                        data-testid="button-copy-profile-wallet"
                        aria-label="Copy wallet address"
                      >
                        {copied ? (
                          <Check className="w-3.5 h-3.5 text-green-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </Button>
                    </div>
                    <div className="flex items-center gap-2 mt-1" data-testid="profile-rank-info">
                      {getRankBadge(profile.rank)}
                      <span className="text-xs text-muted-foreground tabular-nums" data-testid="profile-positions-count">
                        {profile.activePositions} active positions
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3" data-testid="profile-stats-grid">
                <StatCard
                  label="Total Liquidity"
                  value={formatCurrency(profile.totalLiquidity, true)}
                  icon={<DollarSign className="w-5 h-5 text-primary" />}
                  testId="profile-liquidity"
                />
                <StatCard
                  label="7D Volume"
                  value={formatCurrency(profile.volume7D, true)}
                  icon={<TrendingUp className="w-5 h-5 text-primary" />}
                  testId="profile-volume7d"
                />
                <StatCard
                  label="Lifetime Fees"
                  value={formatCurrency(profile.feesLifetime, true)}
                  icon={<Activity className="w-5 h-5 text-primary" />}
                  testId="profile-fees-lifetime"
                />
                <StatCard
                  label="Avg APR"
                  value={`${profile.avgApr.toFixed(1)}%`}
                  icon={<TrendingUp className="w-5 h-5 text-primary" />}
                  testId="profile-apr"
                />
              </div>

              <Tabs defaultValue="positions" className="w-full" data-testid="profile-tabs">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="positions" data-testid="tab-positions">Positions</TabsTrigger>
                  <TabsTrigger value="volume" data-testid="tab-volume">Volume Trend</TabsTrigger>
                  <TabsTrigger value="fees" data-testid="tab-fees">Fee History</TabsTrigger>
                </TabsList>
                <TabsContent value="positions" className="mt-4" data-testid="tab-content-positions">
                  <Card className="overflow-hidden">
                    <PositionsTable positions={profile.positions} />
                  </Card>
                </TabsContent>
                <TabsContent value="volume" className="mt-4" data-testid="tab-content-volume">
                  <Card className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-medium" data-testid="chart-volume-title">30-Day Volume Trend</h3>
                      <Badge variant="outline" className="text-xs tabular-nums" data-testid="badge-volume-total">
                        {formatCurrency(profile.volume30D, true)} total
                      </Badge>
                    </div>
                    <VolumeChart data={profile.volumeHistory} />
                  </Card>
                </TabsContent>
                <TabsContent value="fees" className="mt-4" data-testid="tab-content-fees">
                  <Card className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-medium" data-testid="chart-fees-title">Fee Accumulation</h3>
                      <div className="flex gap-4 text-xs">
                        <div className="flex items-center gap-1.5">
                          <div className="w-3 h-3 rounded-sm bg-[hsl(var(--chart-2))]" />
                          <span className="text-muted-foreground">Daily Fees</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-3 h-1 rounded-sm bg-primary" />
                          <span className="text-muted-foreground">Cumulative</span>
                        </div>
                      </div>
                    </div>
                    <FeeChart data={profile.feeHistory} />
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          ) : null}
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
