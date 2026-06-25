import { useState, useEffect } from "react";
import { Trash2, MapPin, Calendar } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger,
} from "./ui/alert-dialog";
import { getRounds, deleteRound } from "../lib/storage";
import { GolfRound } from "../types/golf";

export function History() {
  const [rounds, setRounds] = useState<GolfRound[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRounds().then((data) => {
      setRounds(data);
      setLoading(false);
    });
  }, []);

  const handleDelete = async (id: string) => {
    await deleteRound(id);
    setRounds((prev) => prev.filter((r) => r.id !== id));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
        Loading history...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Round History</CardTitle>
          <CardDescription>
            All your recorded golf rounds ({rounds.length} total)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {rounds.length > 0 ? (
            <div className="space-y-3">
              {rounds.map(round => (
                <div key={round.id} className="border border-border rounded-lg p-4 hover:border-slate-300 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <MapPin className="size-4 text-muted-foreground" />
                        <h3 className="text-foreground">{round.course}</h3>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="size-3" />
                        {new Date(round.date).toLocaleDateString('en-US', {
                          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                        })}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-foreground">{round.score}</div>
                        <div className="text-sm text-muted-foreground">
                          {round.score > round.par ? '+' : round.score === round.par ? 'E' : ''}
                          {round.score !== round.par && Math.abs(round.score - round.par)}
                        </div>
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="size-4 text-red-600" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Round</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this round? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(round.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 p-3 bg-muted rounded-md">
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">Fairways</div>
                      <div className="text-foreground">{round.fairwaysHit}/{round.fairwaysTotal}</div>
                      <div className="text-xs text-muted-foreground">
                        {Math.round((round.fairwaysHit / round.fairwaysTotal) * 100)}%
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">GIR</div>
                      <div className="text-foreground">{round.greensInRegulation}/{round.greensTotal}</div>
                      <div className="text-xs text-muted-foreground">
                        {Math.round((round.greensInRegulation / round.greensTotal) * 100)}%
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">Putts</div>
                      <div className="text-foreground">{round.putts}</div>
                      <div className="text-xs text-muted-foreground">{(round.putts / 18).toFixed(1)} avg</div>
                    </div>
                  </div>

                  {round.notes && (
                    <div className="mt-3 text-sm text-muted-foreground italic">"{round.notes}"</div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-muted-foreground mb-4">No rounds recorded yet</div>
              <Button onClick={() => window.location.href = "/start-round"}>
                Start Your First Round
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
