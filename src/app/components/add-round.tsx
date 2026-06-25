import { useState } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { saveRound } from "../lib/storage";
import { GolfRound } from "../types/golf";

export function AddRound() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    course: "",
    score: "",
    par: "72",
    fairwaysHit: "",
    fairwaysTotal: "14",
    greensInRegulation: "",
    greensTotal: "18",
    putts: "",
    pars: "",
    birdies: "",
    bogeys: "",
    doubleBogeys: "",
    tripleBogeys: "",
    notes: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newRound: GolfRound = {
      id: Date.now().toString(),
      date: formData.date,
      course: formData.course,
      score: parseInt(formData.score),
      par: parseInt(formData.par),
      fairwaysHit: parseInt(formData.fairwaysHit) || 0,
      fairwaysTotal: parseInt(formData.fairwaysTotal),
      greensInRegulation: parseInt(formData.greensInRegulation) || 0,
      greensTotal: parseInt(formData.greensTotal),
      putts: parseInt(formData.putts) || 0,
      pars: parseInt(formData.pars) || 0,
      birdies: parseInt(formData.birdies) || 0,
      bogeys: parseInt(formData.bogeys) || 0,
      doubleBogeys: parseInt(formData.doubleBogeys) || 0,
      tripleBogeys: parseInt(formData.tripleBogeys) || 0,
      notes: formData.notes,
    };

    saveRound(newRound);
    navigate("/");
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Add New Round</CardTitle>
          <CardDescription>Record your latest golf round</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="course">Course Name</Label>
                <Input
                  id="course"
                  name="course"
                  placeholder="e.g., Pebble Beach Golf Links"
                  value={formData.course}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="score">Score</Label>
                  <Input
                    id="score"
                    name="score"
                    type="number"
                    placeholder="85"
                    value={formData.score}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="par">Par</Label>
                  <Input
                    id="par"
                    name="par"
                    type="number"
                    value={formData.par}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Statistics */}
            <div className="space-y-4">
              <h3 className="text-slate-900">Round Statistics</h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fairwaysHit">Fairways Hit</Label>
                  <Input
                    id="fairwaysHit"
                    name="fairwaysHit"
                    type="number"
                    placeholder="0"
                    min="0"
                    max={formData.fairwaysTotal}
                    value={formData.fairwaysHit}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fairwaysTotal">Total Fairways</Label>
                  <Input
                    id="fairwaysTotal"
                    name="fairwaysTotal"
                    type="number"
                    value={formData.fairwaysTotal}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="greensInRegulation">Greens in Regulation</Label>
                  <Input
                    id="greensInRegulation"
                    name="greensInRegulation"
                    type="number"
                    placeholder="0"
                    min="0"
                    max={formData.greensTotal}
                    value={formData.greensInRegulation}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="greensTotal">Total Greens</Label>
                  <Input
                    id="greensTotal"
                    name="greensTotal"
                    type="number"
                    value={formData.greensTotal}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="putts">Total Putts</Label>
                <Input
                  id="putts"
                  name="putts"
                  type="number"
                  placeholder="0"
                  value={formData.putts}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Score Breakdown */}
            <div className="space-y-4">
              <h3 className="text-slate-900">Score Breakdown</h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="birdies">Birdies</Label>
                  <Input
                    id="birdies"
                    name="birdies"
                    type="number"
                    placeholder="0"
                    min="0"
                    value={formData.birdies}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pars">Pars</Label>
                  <Input
                    id="pars"
                    name="pars"
                    type="number"
                    placeholder="0"
                    min="0"
                    value={formData.pars}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bogeys">Bogeys</Label>
                  <Input
                    id="bogeys"
                    name="bogeys"
                    type="number"
                    placeholder="0"
                    min="0"
                    value={formData.bogeys}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="doubleBogeys">Doubles</Label>
                  <Input
                    id="doubleBogeys"
                    name="doubleBogeys"
                    type="number"
                    placeholder="0"
                    min="0"
                    value={formData.doubleBogeys}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tripleBogeys">Triples+</Label>
                  <Input
                    id="tripleBogeys"
                    name="tripleBogeys"
                    type="number"
                    placeholder="0"
                    min="0"
                    value={formData.tripleBogeys}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                name="notes"
                placeholder="Add any notes about your round..."
                value={formData.notes}
                onChange={handleChange}
                rows={3}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button type="submit" className="flex-1">
                Save Round
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/")}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
