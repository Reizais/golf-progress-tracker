import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { getRounds } from "../lib/storage";
import { calculateStats } from "../lib/stats";
import { GolfRound } from "../types/golf";

export function Stats() {
  const [rounds, setRounds] = useState<GolfRound[]>([]);

  useEffect(() => {
    setRounds(getRounds());
  }, []);

  const stats = calculateStats(rounds);

  // Last 10 rounds oldest→newest for trend chart
  const trendData = [...rounds].slice(0, 10).reverse().map((r, i) => ({
    round: `R${i + 1}`,
    date: new Date(r.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    fairways: r.fairwaysTotal > 0 ? Math.round((r.fairwaysHit / r.fairwaysTotal) * 100) : 0,
    gir: r.greensTotal > 0 ? Math.round((r.greensInRegulation / r.greensTotal) * 100) : 0,
    putts: r.putts,
  }));

  const summaryCards = [
    { label: "Total Rounds", value: stats.totalRounds, color: "text-slate-900" },
    { label: "Eagles", value: stats.totalEagles, color: "text-yellow-400" },
    { label: "Birdies", value: stats.totalBirdies, color: "text-yellow-500" },
    { label: "Pars", value: stats.totalPars, color: "text-green-600" },
    { label: "Bogeys", value: stats.totalBogeys, color: "text-blue-600" },
    { label: "Triple+", value: stats.totalTripleBogeys, color: "text-red-600" },
  ];

  const breakdownCards = [
    { label: "Avg Eagles", value: stats.averageEagles, color: "text-yellow-400" },
    { label: "Avg Birdies", value: stats.averageBirdies, color: "text-yellow-500" },
    { label: "Avg Pars", value: stats.averagePars, color: "text-green-600" },
    { label: "Avg Bogeys", value: stats.averageBogeys, color: "text-blue-600" },
    { label: "Avg Doubles", value: stats.averageDoubleBogeys, color: "text-orange-500" },
    { label: "Avg Triples+", value: stats.averageTripleBogeys, color: "text-red-600" },
  ];

  const tooltipStyle = {
    contentStyle: { backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "6px" },
  };

  return (
    <div className="space-y-6">
      {/* Row 1 — Totals */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {summaryCards.map(({ label, value, color }) => (
          <Card key={label}>
            <CardContent className="pt-5 pb-4 flex flex-col items-center gap-1">
              <span className={`text-2xl font-semibold ${color}`}>
                {rounds.length > 0 ? value : "—"}
              </span>
              <span className="text-xs text-slate-500 text-center leading-tight">{label}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Row 2 — Score Breakdown averages */}
      <Card>
        <CardHeader>
          <CardTitle>Score Breakdown</CardTitle>
          <CardDescription>Average holes per round by score type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-6 divide-x divide-slate-100">
            {breakdownCards.map(({ label, value, color }) => (
              <div key={label} className="flex flex-col items-center py-4 px-2 gap-1">
                <span className={`text-2xl font-semibold ${color}`}>
                  {rounds.length > 0 ? value : "—"}
                </span>
                <span className="text-xs text-slate-500 text-center">{label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Row 3 — Performance Trend line chart */}
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
                <XAxis
                  dataKey="date"
                  stroke="#64748b"
                  style={{ fontSize: "12px" }}
                  tick={{ fontSize: 11 }}
                />
                <YAxis
                  yAxisId="pct"
                  domain={[0, 100]}
                  stroke="#64748b"
                  style={{ fontSize: "12px" }}
                  tickFormatter={(v) => `${v}%`}
                  width={40}
                />
                <YAxis
                  yAxisId="putts"
                  orientation="right"
                  stroke="#a855f7"
                  style={{ fontSize: "12px" }}
                  width={36}
                />
                <Tooltip
                  {...tooltipStyle}
                  formatter={(value: number, name: string) =>
                    name === "Putts" ? [value, name] : [`${value}%`, name]
                  }
                />
                <Legend />
                <Line
                  yAxisId="pct"
                  type="monotone"
                  dataKey="fairways"
                  name="Fairway Hit"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "#3b82f6" }}
                  activeDot={{ r: 5 }}
                />
                <Line
                  yAxisId="pct"
                  type="monotone"
                  dataKey="gir"
                  name="GIR"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "#10b981" }}
                  activeDot={{ r: 5 }}
                />
                <Line
                  yAxisId="putts"
                  type="monotone"
                  dataKey="putts"
                  name="Putts"
                  stroke="#a855f7"
                  strokeWidth={2}
                  strokeDasharray="5 4"
                  dot={{ r: 3, fill: "#a855f7" }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-slate-500">
              No data available
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
