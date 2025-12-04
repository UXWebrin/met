import { useState } from "react";
import { ChevronUp, ChevronDown, Copy, Check, Trophy, Medal } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import type { LeaderboardEntry, SortField, SortDirection } from "@shared/schema";

interface LeaderboardTableProps {
  data: LeaderboardEntry[] | undefined;
  isLoading: boolean;
  searchQuery: string;
  onWalletClick?: (wallet: string) => void;
}

function formatWallet(wallet: string): string {
  if (wallet.length <= 6) return wallet;
  return `${wallet.slice(0, 3)}...${wallet.slice(-3)}`;
}

function formatCurrency(value: number): string {
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2)}M`;
  }
  if (value >= 1_000) {
    return `$${value.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
  }
  return `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function getRankIcon(rank: number) {
  if (rank === 1) {
    return <Trophy className="w-4 h-4 text-yellow-500" />;
  }
  if (rank === 2) {
    return <Medal className="w-4 h-4 text-gray-400" />;
  }
  if (rank === 3) {
    return <Medal className="w-4 h-4 text-amber-600" />;
  }
  return null;
}

interface SortableHeaderProps {
  field: SortField;
  currentField: SortField;
  direction: SortDirection;
  onSort: (field: SortField) => void;
  children: React.ReactNode;
  align?: "left" | "right";
}

function SortableHeader({
  field,
  currentField,
  direction,
  onSort,
  children,
  align = "left",
}: SortableHeaderProps) {
  const isActive = currentField === field;
  const Icon = direction === "asc" ? ChevronUp : ChevronDown;

  return (
    <TableHead
      className={`cursor-pointer select-none transition-colors hover:text-foreground px-6 py-4 ${
        align === "right" ? "text-right" : ""
      }`}
      onClick={() => onSort(field)}
      aria-sort={isActive ? (direction === "asc" ? "ascending" : "descending") : "none"}
      data-testid={`header-${field}`}
    >
      <div
        className={`flex items-center gap-1 ${
          align === "right" ? "justify-end" : ""
        }`}
      >
        <span className="uppercase text-xs font-semibold tracking-wider">
          {children}
        </span>
        <Icon
          className={`w-4 h-4 transition-all duration-200 ${
            isActive
              ? "opacity-100 text-primary"
              : "opacity-0 group-hover:opacity-50"
          } ${isActive && direction === "asc" ? "rotate-0" : "rotate-180"}`}
        />
      </div>
    </TableHead>
  );
}

function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 10 }).map((_, i) => (
        <TableRow key={i} className="animate-pulse">
          <TableCell className="px-6 py-4">
            <Skeleton className="h-4 w-8" />
          </TableCell>
          <TableCell className="px-6 py-4">
            <Skeleton className="h-4 w-24" />
          </TableCell>
          <TableCell className="text-center px-6 py-4">
            <Skeleton className="h-4 w-8 mx-auto" />
          </TableCell>
          <TableCell className="text-right px-6 py-4">
            <Skeleton className="h-4 w-24 ml-auto" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}

function EmptyState({ searchQuery }: { searchQuery: string }) {
  return (
    <TableRow>
      <TableCell colSpan={4} className="h-64">
        <div className="flex flex-col items-center justify-center text-center" data-testid="empty-state">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Trophy className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-lg font-medium text-foreground mb-1">
            No results found
          </p>
          <p className="text-sm text-muted-foreground">
            {searchQuery
              ? `No wallets matching "${searchQuery}"`
              : "No leaderboard data available"}
          </p>
        </div>
      </TableCell>
    </TableRow>
  );
}

export function LeaderboardTable({
  data,
  isLoading,
  searchQuery,
  onWalletClick,
}: LeaderboardTableProps) {
  const { toast } = useToast();
  const [sortField, setSortField] = useState<SortField>("rank");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [copiedWallet, setCopiedWallet] = useState<string | null>(null);

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection(field === "rank" ? "asc" : "desc");
    }
  };

  const handleCopy = async (e: React.MouseEvent, wallet: string) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(wallet);
      setCopiedWallet(wallet);
      toast({
        title: "Copied!",
        description: "Wallet address copied to clipboard",
      });
      setTimeout(() => setCopiedWallet(null), 2000);
    } catch {
      toast({
        title: "Failed to copy",
        description: "Could not copy wallet address",
        variant: "destructive",
      });
    }
  };

  const handleRowClick = (wallet: string) => {
    onWalletClick?.(wallet);
  };

  const filteredData =
    data?.filter((entry) =>
      entry.wallet.toLowerCase().includes(searchQuery.toLowerCase())
    ) ?? [];

  const sortedData = [...filteredData].sort((a, b) => {
    const multiplier = sortDirection === "asc" ? 1 : -1;
    switch (sortField) {
      case "rank":
        return (a.rank - b.rank) * multiplier;
      case "volume7D":
        return (a.volume7D - b.volume7D) * multiplier;
      default:
        return 0;
    }
  });

  return (
    <Card className="overflow-hidden" data-testid="leaderboard-table-container">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/30 sticky top-0 z-10">
            <TableRow className="hover:bg-transparent">
              <SortableHeader
                field="rank"
                currentField={sortField}
                direction={sortDirection}
                onSort={handleSort}
              >
                Rank
              </SortableHeader>
              <TableHead className="uppercase text-xs font-semibold tracking-wider px-6 py-4" data-testid="header-wallet">
                LP Wallet
              </TableHead>
              <TableHead className="uppercase text-xs font-semibold tracking-wider text-center px-6 py-4" data-testid="header-trades">
                Total Trades
              </TableHead>
              <SortableHeader
                field="volume7D"
                currentField={sortField}
                direction={sortDirection}
                onSort={handleSort}
                align="right"
              >
                Total Volume (USD)
              </SortableHeader>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableSkeleton />
            ) : sortedData.length === 0 ? (
              <EmptyState searchQuery={searchQuery} />
            ) : (
              sortedData.map((entry) => (
                <TableRow
                  key={entry.wallet}
                  className={`group transition-colors focus-within:bg-muted/30 cursor-pointer ${
                    entry.rank <= 10 ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-muted/20"
                  }`}
                  data-testid={`row-lp-${entry.rank}`}
                  tabIndex={0}
                  onClick={() => handleRowClick(entry.wallet)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleRowClick(entry.wallet);
                    }
                  }}
                >
                  <TableCell className="font-medium px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground" data-testid={`text-rank-hash-${entry.rank}`}>#</span>
                      <span className="tabular-nums text-foreground" data-testid={`text-rank-${entry.rank}`}>
                        {entry.rank}
                      </span>
                      {getRankIcon(entry.rank)}
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <code 
                        className="font-mono text-sm bg-muted/50 px-2 py-1 rounded hover:bg-primary/20 transition-colors"
                        data-testid={`text-wallet-${entry.rank}`}
                      >
                        {formatWallet(entry.wallet)}
                      </code>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={(e) => handleCopy(e, entry.wallet)}
                        className="h-7 w-7 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                        data-testid={`button-copy-wallet-${entry.rank}`}
                        aria-label="Copy wallet address"
                      >
                        {copiedWallet === entry.wallet ? (
                          <Check className="w-3.5 h-3.5 text-green-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="text-center px-6 py-4">
                    <span 
                      className="tabular-nums text-foreground"
                      data-testid={`text-positions-${entry.rank}`}
                    >
                      {entry.activePositions}
                    </span>
                  </TableCell>
                  <TableCell className="text-right px-6 py-4">
                    <span 
                      className="tabular-nums font-semibold text-foreground"
                      data-testid={`text-volume-${entry.rank}`}
                    >
                      {formatCurrency(entry.volume7D)}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
