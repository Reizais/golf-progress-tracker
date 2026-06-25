import { useState, useEffect } from "react";
import { TrendingDown, TrendingUp, Target, Activity, Minus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { getRounds } from "../lib/storage";
import { calculateStats } from "../lib/stats";
import { GolfRound } from "../types/golf";

function Trend({ current, previous, lowerIsBetter = false }: {
  current: number;
  previous: number | undefined;
  lowerIsBetter?: boolean;
}) {
  if (previous === undefined) return <span className="text-xs text-muted-foreground">—</span>;
  const diff = current - previous;
  if (diff === 0) return <Minus className="size-3.5 text-muted-foreground" />;
  const improved = lowerIsBetter ? diff < 0 : diff > 0;
  const Icon = diff > 0 ? TrendingUp : TrendingDown;
  return <Icon className={`size-3.5 ${improved ? "text-green-600" : "text-red-500"}`} />;
}

export function Dashboard() {
  const [rounds, setRounds] = useState<GolfRound[]>([]);

  useEffect(() => {
    setRounds(getRounds());
  }, []);

  const stats = calculateStats(rounds);
  const last = rounds[0];
  const prev = rounds[1];

  const scoreTrend = rounds.length >= 2
    ? rounds[0].score - rounds[rounds.length - 1].score
    : 0;

  const lastFairway = last && last.fairwaysTotal > 0
    ? Math.round((last.fairwaysHit / last.fairwaysTotal) * 100)
    : null;
  const prevFairway = prev && prev.fairwaysTotal > 0
    ? Math.round((prev.fairwaysHit / prev.fairwaysTotal) * 100)
    : undefined;

  const lastGIR = last && last.greensTotal > 0
    ? Math.round((last.greensInRegulation / last.greensTotal) * 100)
    : null;
  const prevGIR = prev && prev.greensTotal > 0
    ? Math.round((prev.greensInRegulation / prev.greensTotal) * 100)
    : undefined;

  const lastPutts = last?.putts ?? null;
  const prevPutts = prev?.putts;

  const lastChips = last?.totalChips ?? null;
  const prevChips = prev?.totalChips;

  const lastPenalties = last?.totalPenalties ?? null;
  const prevPenalties = prev?.totalPenalties;

  const trendData = [...rounds].slice(0, 10).reverse().map((r, i) => ({
    round: `R${i + 1}`,
    date: new Date(r.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    fairways: r.fairwaysTotal > 0 ? Math.round((r.fairwaysHit / r.fairwaysTotal) * 100) : 0,
    gir: r.greensTotal > 0 ? Math.round((r.greensInRegulation / r.greensTotal) * 100) : 0,
    putts: r.putts,
  }));

  const summaryCards = [
    { label: "Eagles",        value: stats.totalEagles,       color: "text-yellow-400" },
    { label: "Birdies",       value: stats.totalBirdies,      color: "text-yellow-500" },
    { label: "Pars",          value: stats.totalPars,         color: "text-green-600"  },
    { label: "Bogeys",        value: stats.totalBogeys,       color: "text-blue-600"   },
    { label: "Doubles",       value: stats.totalDoubleBogeys, color: "text-orange-500" },
    { label: "Triple+",       value: stats.totalTripleBogeys, color: "text-red-600"    },
  ];

  const breakdownCards = [
    { label: "Avg Eagles",   value: stats.averageEagles,      color: "text-yellow-400" },
    { label: "Avg Birdies",  value: stats.averageBirdies,     color: "text-yellow-500" },
    { label: "Avg Pars",     value: stats.averagePars,        color: "text-green-600"  },
    { label: "Avg Bogeys",   value: stats.averageBogeys,      color: "text-blue-600"   },
    { label: "Avg Doubles",  value: stats.averageDoubleBogeys, color: "text-orange-500" },
    { label: "Avg Triples+", value: stats.averageTripleBogeys, color: "text-red-600"   },
  ];

  const tooltipStyle = {
    contentStyle: { backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "6px" },
  };

  return (
    <div className="space-y-6">
      {/* Top Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Average Score</CardDescription>
            <CardTitle className="text-foreground">{stats.averageScore || "—"}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              {scoreTrend > 0 ? (
                <>
                  <TrendingDown className="size-4 text-green-600" />
                  <span className="text-green-600">-{scoreTrend}</span>
                </>
              ) : scoreTrend < 0 ? (
                <>
                  <TrendingUp className="size-4 text-red-600" />
                  <span className="text-red-600">+{Math.abs(scoreTrend)}</span>
                </>
              ) : (
                <span>No change</span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Best Score</CardDescription>
            <CardTitle className="text-foreground">{stats.bestScore || "—"}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Personal best</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Handicap</CardDescription>
            <CardTitle className="text-foreground">{stats.handicap}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Estimated</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Rounds</CardDescription>
            <CardTitle className="text-foreground">{stats.totalRounds}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">All time</p>
          </CardContent>
        </Card>
      </div>

      {/* All-time Totals */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {summaryCards.map(({ label, value, color }) => (
          <Card key={label}>
            <CardContent className="pt-5 pb-4 flex flex-col items-center gap-1">
              <span className={`text-2xl font-semibold ${color}`}>
                {rounds.length > 0 ? value : "—"}
              </span>
              <span className="text-xs text-muted-foreground text-center leading-tight">{label}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Last Round Score Breakdown */}
      {last && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Last Round Score Breakdown</CardTitle>
            <CardDescription>
              {last.course} &mdash;{" "}
              {new Date(last.date).toLocaleDateString("en-US", {
                month: "short", day: "numeric", year: "numeric",
              })}
            </CardDescription>
          </CardHeader>
          <CardContent className="px-3">
            <div className="overflow-x-auto">
              <div className="grid grid-cols-7 divide-x divide-border min-w-[380px]">
                {[
                  { label: "Total Score", value: `${last.score} (${last.score > last.par ? "+" : last.score === last.par ? "E" : ""}${last.score !== last.par ? last.score - last.par : ""})`, color: "text-foreground" },
                  { label: "Eagles",     value: last.eagles,       color: "text-yellow-500" },
                  { label: "Birdies",    value: last.birdies,      color: "text-yellow-600" },
                  { label: "Pars",       value: last.pars,         color: "text-green-700"  },
                  { label: "Bogeys",     value: last.bogeys,       color: "text-blue-600"   },
                  { label: "Doubles",    value: last.doubleBogeys, color: "text-orange-500" },
                  { label: "Triples+",   value: last.tripleBogeys, color: "text-red-600"    },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex flex-col items-center py-3 px-1 gap-0.5">
                    <span className={`text-lg font-semibold ${color}`}>{value}</span>
                    <span className="text-[10px] text-muted-foreground text-center leading-tight">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats with last round + trend */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Target className="size-5 text-blue-600" />
              <CardTitle>Fairway Accuracy</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-foreground">{stats.averageFairwayAccuracy}%</div>
            <p className="text-sm text-muted-foreground">Average hit rate</p>
            {lastFairway !== null && (
              <div className="flex items-center gap-1.5 pt-1 border-t border-border">
                <span className="text-xs text-muted-foreground">Last round:</span>
                <span className="text-sm font-medium text-foreground">{lastFairway}%</span>
                <Trend current={lastFairway} previous={prevFairway} />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Activity className="size-5 text-green-600" />
              <CardTitle>Greens in Regulation</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-foreground">{stats.averageGIR}%</div>
            <p className="text-sm text-muted-foreground">Average GIR</p>
            {lastGIR !== null && (
              <div className="flex items-center gap-1.5 pt-1 border-t border-border">
                <span className="text-xs text-muted-foreground">Last round:</span>
                <span className="text-sm font-medium text-foreground">{lastGIR}%</span>
                <Trend current={lastGIR} previous={prevGIR} />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Target className="size-5 text-purple-600" />
              <CardTitle>Average Putts</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-foreground">{stats.averagePutts}</div>
            <p className="text-sm text-muted-foreground">Per round</p>
            {lastPutts !== null && (
              <div className="flex items-center gap-1.5 pt-1 border-t border-border">
                <span className="text-xs text-muted-foreground">Last round:</span>
                <span className="text-sm font-medium text-foreground">{lastPutts}</span>
                <Trend current={lastPutts} previous={prevPutts} lowerIsBetter />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Activity className="size-5 text-amber-600" />
              <CardTitle>Avg Chip Shots</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-foreground">{stats.averageChips}</div>
            <p className="text-sm text-muted-foreground">Per round</p>
            {lastChips !== null && (
              <div className="flex items-center gap-1.5 pt-1 border-t border-border">
                <span className="text-xs text-muted-foreground">Last round:</span>
                <span className="text-sm font-medium text-foreground">{lastChips}</span>
                <Trend current={lastChips} previous={prevChips} lowerIsBetter />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Target className="size-5 text-red-500" />
              <CardTitle>Avg Penalties</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-foreground">{stats.averagePenalties}</div>
            <p className="text-sm text-muted-foreground">Per round</p>
            {lastPenalties !== null && (
              <div className="flex items-center gap-1.5 pt-1 border-t border-border">
                <span className="text-xs text-muted-foreground">Last round:</span>
                <span className="text-sm font-medium text-foreground">{lastPenalties}</span>
                <Trend current={lastPenalties} previous={prevPenalties} lowerIsBetter />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Score Breakdown Averages */}
      <Card>
        <CardHeader>
          <CardTitle>Score Breakdown</CardTitle>
          <CardDescription>Average holes per round by score type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-y-4">
            {breakdownCards.map(({ label, value, color }) => (
              <div key={label} className="flex flex-col items-center py-2 gap-1 border-b border-border md:border-0 md:border-r last:border-0">
                <span className={`text-2xl font-semibold ${color}`}>
                  {rounds.length > 0 ? value : "—"}
                </span>
                <span className="text-xs text-muted-foreground text-center">{label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Trend</CardTitle>
          <CardDescription>Fairway hit %, GIR %, and total putts per round (last 10)</CardDescription>
        </CardHeader>
        <CardContent>
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis
                  yAxisId="pct"
                  domain={[0, 100]}
                  stroke="#64748b"
                  tickFormatter={(v) => `${v}%`}
                  width={40}
                  tick={{ fontSize: 11 }}
                />
                <YAxis
                  yAxisId="putts"
                  orientation="right"
                  stroke="#a855f7"
                  width={36}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip
                  {...tooltipStyle}
                  formatter={(value: number, name: string) =>
                    name === "Putts" ? [value, name] : [`${value}%`, name]
                  }
                />
                <Legend />
                <Line yAxisId="pct" type="monotone" dataKey="fairways" name="Fairway Hit"
                  stroke="#3b82f6" strokeWidth={2} dot={{ r: 3, fill: "#3b82f6" }} activeDot={{ r: 5 }} />
                <Line yAxisId="pct" type="monotone" dataKey="gir" name="GIR"
                  stroke="#10b981" strokeWidth={2} dot={{ r: 3, fill: "#10b981" }} activeDot={{ r: 5 }} />
                <Line yAxisId="putts" type="monotone" dataKey="putts" name="Putts"
                  stroke="#a855f7" strokeWidth={2} strokeDasharray="5 4"
                  dot={{ r: 3, fill: "#a855f7" }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
              No data available
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
}
