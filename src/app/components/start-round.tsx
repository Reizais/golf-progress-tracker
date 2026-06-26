import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { ChevronLeft, ChevronRight, Flag, CheckCircle2, Search, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { saveRound } from "../lib/storage";
import { GolfRound, HoleData } from "../types/golf";
import { searchRegionalCourses, SgCourse } from "../lib/singaporeCourses";

const API_KEY = "RBKARIPPWIP33TZWX2EGM52VLM";
const API_BASE = "https://api.golfcourseapi.com/v1";

interface ApiHole {
  par: number;
  yardage: number;
  handicap: number;
}

interface ApiTee {
  tee_name: string;
  number_of_holes: number;
  par_total: number;
  courseRating?: number;
  slope?: number;
  holes: ApiHole[];
}

interface ApiCourse {
  id: number;
  club_name: string;
  course_name: string;
  location: { city: string; state: string; country: string };
  tees: { male?: ApiTee[]; female?: ApiTee[] };
}

interface HoleEntry {
  par: number;
  score: number;
  fairwayHit: boolean;
  gir: boolean;
  penalty: boolean;
  putts: number;
  chips: number;
  bunkerShots: number;
  touched: boolean;
}

function makeDefaultHole(par = 4): HoleEntry {
  return { par, score: par, fairwayHit: false, gir: false, penalty: false, putts: 2, chips: 0, bunkerShots: 0, touched: false };
}

// ── Small primitives ────────────────────────────────────────────────────────

function Stepper({ value, onChange, min = 0, max = 20 }: {
  value: number; onChange: (v: number) => void; min?: number; max?: number;
}) {
  return (
    <div className="flex items-center gap-3">
      <button type="button" onClick={() => onChange(Math.max(min, value - 1))}
        className="size-8 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:bg-muted active:bg-muted transition-colors text-base leading-none">
        −
      </button>
      <span className="w-8 text-center text-foreground tabular-nums font-medium">{value}</span>
      <button type="button" onClick={() => onChange(Math.min(max, value + 1))}
        className="size-8 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:bg-muted active:bg-muted transition-colors text-base leading-none">
        +
      </button>
    </div>
  );
}

function YesNoToggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex rounded-lg border border-border overflow-hidden w-36">
      <button type="button" onClick={() => onChange(true)}
        className={`flex-1 py-2 text-sm font-medium transition-colors ${value ? "bg-green-600 text-white" : "bg-white text-muted-foreground hover:bg-muted/60"}`}>
        Yes
      </button>
      <button type="button" onClick={() => onChange(false)}
        className={`flex-1 py-2 text-sm font-medium transition-colors border-l border-border ${!value ? "bg-red-500 text-white" : "bg-white text-muted-foreground hover:bg-muted/60"}`}>
        No
      </button>
    </div>
  );
}

// ── Course search ────────────────────────────────────────────────────────────

type SearchResult =
  | { source: "sg"; course: SgCourse }
  | { source: "api"; course: ApiCourse };

function CourseSearch({ onSelect }: { onSelect: (course: ApiCourse | SgCourse, source: "sg" | "api") => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (query.length < 2) { setResults([]); return; }
    if (debounceRef.current) clearTimeout(debounceRef.current);

    // Show regional courses immediately
    const sgMatches = searchRegionalCourses(query).map((c): SearchResult => ({ source: "sg", course: c }));
    setResults(sgMatches);

    // Then fetch API results
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/search?search_query=${encodeURIComponent(query)}`, {
          headers: { Authorization: `Key ${API_KEY}` },
        });
        const data = await res.json();
        const apiResults: SearchResult[] = (data.courses?.slice(0, 6) ?? []).map((c: ApiCourse): SearchResult => ({ source: "api", course: c }));
        setResults([...sgMatches, ...apiResults]);
      } catch {
        // Keep SG results even if API fails
      } finally {
        setLoading(false);
      }
    }, 350);
  }, [query]);

  const handleSelect = (result: SearchResult) => {
    const name = result.source === "sg" ? result.course.club_name : result.course.club_name;
    setSelected(name);
    setResults([]);
    setQuery(name);
    onSelect(result.course, result.source);
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          className="pl-9 pr-9"
          placeholder="Search course name..."
          value={query}
          onChange={(e) => { setQuery(e.target.value); setSelected(null); }}
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground animate-spin" />
        )}
      </div>

      {results.length > 0 && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-border rounded-lg shadow-lg overflow-hidden max-h-72 overflow-y-auto">
          {results.map((r, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSelect(r)}
              className="w-full text-left px-4 py-3 hover:bg-muted/60 transition-colors border-b border-border last:border-0"
            >
              <div className="flex items-center gap-2">
                <div className="text-sm font-medium text-foreground">{r.course.club_name}</div>
                {r.source === "sg" && (() => {
                  const id = (r.course as SgCourse).id;
                  const flag = id.startsWith("my-") ? "🇲🇾 MY" : id.startsWith("id-") ? "🇮🇩 ID" : "🇸🇬 SG";
                  return <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-medium">{flag}</span>;
                })()}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {r.source === "sg"
                  ? r.course.location
                  : [r.course.location.city, r.course.location.state, r.course.location.country].filter(Boolean).join(", ")}
              </div>
            </button>
          ))}
        </div>
      )}

      {selected && (
        <p className="mt-1.5 text-xs text-green-600 font-medium">
          ✓ {selected} selected
        </p>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function StartRound() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"course" | "holes">("course");

  // Course step state
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [courseName, setCourseName] = useState("");
  const [numHoles, setNumHoles] = useState(18);
  const [selectedCourse, setSelectedCourse] = useState<ApiCourse | null>(null);
  const [gender, setGender] = useState<"male" | "female">("male");
  const [selectedTee, setSelectedTee] = useState<ApiTee | null>(null);

  // Hole step state
  const [currentHole, setCurrentHole] = useState(0);
  const [holes, setHoles] = useState<HoleEntry[]>(() =>
    Array.from({ length: 18 }, () => makeDefaultHole(4))
  );

  const availableTees = selectedCourse?.tees[gender] ?? [];

  const handleCourseSelect = (course: ApiCourse | SgCourse, source: "sg" | "api") => {
    setCourseName(course.club_name);
    setSelectedTee(null);

    if (source === "sg") {
      const sgCourse = course as SgCourse;
      // Convert SG course to ApiCourse-compatible format
      const converted: ApiCourse = {
        id: 0,
        club_name: sgCourse.club_name,
        course_name: sgCourse.course_name,
        location: { city: sgCourse.location, state: "Singapore", country: "Singapore" },
        tees: {
          male: sgCourse.tees.map((t) => ({
            tee_name: t.tee_name,
            number_of_holes: t.number_of_holes,
            par_total: t.par_total,
            courseRating: t.courseRating,
            slope: t.slope,
            holes: t.holes.map((h) => ({ par: h.par, yardage: h.yards, handicap: h.handicap })),
          })),
        },
      };
      setSelectedCourse(converted);
      setGender("male");
    } else {
      const apiCourse = course as ApiCourse;
      setSelectedCourse(apiCourse);
      const g = apiCourse.tees.male?.length ? "male" : "female";
      setGender(g);
    }
  };

  const handleTeeSelect = (tee: ApiTee) => {
    setSelectedTee(tee);
    const n = tee.number_of_holes;
    setNumHoles(n);
    setHoles(
      Array.from({ length: n }, (_, i) =>
        makeDefaultHole(tee.holes[i]?.par ?? 4)
      )
    );
  };

  const handleStartRound = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseName.trim()) return;
    setStep("holes");
    setCurrentHole(0);
  };

  const updateHole = (field: keyof HoleEntry, value: number | boolean) => {
    setHoles((prev) => {
      const next = [...prev];
      next[currentHole] = { ...next[currentHole], [field]: value, touched: true };
      return next;
    });
  };

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleFinish = async () => {
    setSaving(true);
    setSaveError(null);
    const active = holes.slice(0, numHoles);
    const score = active.reduce((s, h) => s + h.score, 0);
    const par = active.reduce((s, h) => s + h.par, 0);

    const round: GolfRound = {
      id: Date.now().toString(),
      date,
      course: courseName,
      score,
      par,
      courseRating: selectedTee?.courseRating,
      slope: selectedTee?.slope,
      fairwaysHit: active.filter((h) => h.fairwayHit).length,
      fairwaysTotal: numHoles,
      greensInRegulation: active.filter((h) => h.gir).length,
      greensTotal: numHoles,
      putts: active.reduce((s, h) => s + h.putts, 0),
      totalChips: active.reduce((s, h) => s + h.chips, 0),
      totalBunkerShots: active.reduce((s, h) => s + h.bunkerShots, 0),
      totalPenalties: active.filter((h) => h.penalty).length,
      eagles: active.filter((h) => h.score <= h.par - 2).length,
      pars: active.filter((h) => h.score === h.par).length,
      birdies: active.filter((h) => h.score === h.par - 1).length,
      bogeys: active.filter((h) => h.score === h.par + 1).length,
      doubleBogeys: active.filter((h) => h.score === h.par + 2).length,
      tripleBogeys: active.filter((h) => h.score >= h.par + 3).length,
      holes: active.map((h, i) => ({ ...h, hole: i + 1 })),
    };

    try {
      await saveRound(round);
      navigate("/");
    } catch (err) {
      console.error("Save error:", err);
      setSaveError("Failed to save round. Please check you are logged in and try again.");
      setSaving(false);
    }
  };

  // ── Step 1: Course Details ──────────────────────────────────────────────

  if (step === "course") {
    return (
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 mb-1">
              <Flag className="size-5 text-green-600" />
              <CardTitle>Start Round</CardTitle>
            </div>
            <CardDescription>Enter course details to begin</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleStartRound} className="space-y-5">
              <div className="space-y-2">
                <Label>Date</Label>
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
              </div>

              <div className="space-y-2">
                <Label>Course</Label>
                <CourseSearch onSelect={(course, source) => handleCourseSelect(course, source)} />
              </div>

              {/* Tee selection — shown after course is picked */}
              {selectedCourse && (
                <div className="space-y-3 pt-1">
                  {/* Gender toggle */}
                  {selectedCourse.tees.male?.length && selectedCourse.tees.female?.length ? (
                    <div className="space-y-1.5">
                      <Label>Gender</Label>
                      <div className="flex rounded-lg border border-border overflow-hidden">
                        {(["male", "female"] as const).map((g) => (
                          <button key={g} type="button"
                            onClick={() => { setGender(g); setSelectedTee(null); }}
                            className={`flex-1 py-2 text-sm font-medium capitalize transition-colors ${gender === g ? "bg-primary text-white" : "bg-white text-muted-foreground hover:bg-muted/60"} ${g === "female" ? "border-l border-border" : ""}`}>
                            {g}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {/* Tee list */}
                  {availableTees.length > 0 && (
                    <div className="space-y-1.5">
                      <Label>Select Tee</Label>
                      <div className="grid grid-cols-3 gap-2">
                        {availableTees.map((tee) => (
                          <button key={tee.tee_name} type="button"
                            onClick={() => handleTeeSelect(tee)}
                            className={`py-2 px-3 text-sm rounded-lg border transition-colors ${selectedTee?.tee_name === tee.tee_name ? "bg-green-600 text-white border-green-600" : "bg-white text-foreground border-border hover:border-slate-400"}`}>
                            {tee.tee_name}
                          </button>
                        ))}
                      </div>
                      {selectedTee && (
                        <p className="text-xs text-muted-foreground">
                          {selectedTee.number_of_holes} holes · Par {selectedTee.par_total}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Manual holes selector if no API course chosen */}
              {!selectedCourse && (
                <div className="space-y-2">
                  <Label>Number of Holes</Label>
                  <div className="flex rounded-lg border border-border overflow-hidden">
                    {[9, 18].map((n, i) => (
                      <button key={n} type="button" onClick={() => { setNumHoles(n); setHoles(Array.from({ length: n }, () => makeDefaultHole(4))); }}
                        className={`flex-1 py-2.5 text-sm font-medium transition-colors ${numHoles === n ? "bg-primary text-white" : "bg-white text-muted-foreground hover:bg-muted/60"} ${i > 0 ? "border-l border-border" : ""}`}>
                        {n} Holes
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button type="submit" className="flex-1" disabled={!courseName.trim()}>
                  Start Round
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate("/")}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Step 2: Hole-by-hole Entry ──────────────────────────────────────────

  const hole = holes[currentHole];
  const isLast = currentHole === numHoles - 1;
  const completedCount = holes.slice(0, numHoles).filter((h) => h.touched).length;

  return (
    <div className="max-w-lg mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-foreground">{courseName}</span>
        <span className="text-muted-foreground">{completedCount}/{numHoles} holes entered</span>
      </div>

      {/* Hole selector grid */}
      <div className={`grid gap-1.5 ${numHoles === 9 ? "grid-cols-9" : "grid-cols-9"}`}>
        {Array.from({ length: numHoles }, (_, i) => {
          const h = holes[i];
          const isActive = i === currentHole;
          const isDone = h.touched;
          return (
            <button
              key={i}
              type="button"
              onClick={() => setCurrentHole(i)}
              className={`
                h-8 w-full rounded text-xs font-medium transition-colors flex items-center justify-center leading-none
                ${isActive
                  ? "bg-primary text-white"
                  : isDone
                  ? "bg-green-100 text-green-800 border border-green-300"
                  : "bg-white border border-border text-muted-foreground hover:border-slate-400"}
              `}
            >
              <span className="text-xs">{i + 1}</span>
            </button>
          );
        })}
      </div>

      {/* Hole entry card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Hole {currentHole + 1}</CardTitle>
              {selectedTee?.holes[currentHole] && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {selectedTee.holes[currentHole].yardage} yds / {Math.round(selectedTee.holes[currentHole].yardage * 0.9144)} m · Index {selectedTee.holes[currentHole].handicap}
                </p>
              )}
            </div>
            <span className="text-xl font-semibold text-muted-foreground">Par {hole.par}</span>
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          {/* Score */}
          {(() => {
            const diff = hole.score - hole.par;
            const label = diff <= -2 ? "Eagle" : diff === -1 ? "Birdie" : diff === 0 ? "Par" : diff === 1 ? "Bogey" : diff === 2 ? "Double Bogey" : "Triple+";
            const labelColor = diff <= -1 ? "text-yellow-500" : diff === 0 ? "text-green-700" : diff === 1 ? "text-blue-600" : diff === 2 ? "text-orange-500" : "text-red-600";
            return (
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-foreground">Score</div>
                  <div className={`text-sm font-medium mt-0.5 ${labelColor}`}>{label}</div>
                </div>
                <Stepper value={hole.score} onChange={(v) => updateHole("score", v)} min={1} max={15} />
              </div>
            );
          })()}

          <div className="border-t border-border" />

          {/* Fairway Hit */}
          <div className="flex items-center justify-between">
            <div className="font-medium text-foreground">Fairway Hit</div>
            <YesNoToggle value={hole.fairwayHit} onChange={(v) => updateHole("fairwayHit", v)} />
          </div>

          {/* GIR */}
          <div className="flex items-center justify-between">
            <div className="font-medium text-foreground">Green in Regulation</div>
            <YesNoToggle value={hole.gir} onChange={(v) => updateHole("gir", v)} />
          </div>

          {/* Penalty */}
          <div className="flex items-center justify-between">
            <div className="font-medium text-foreground">Penalty</div>
            <YesNoToggle value={hole.penalty} onChange={(v) => updateHole("penalty", v)} />
          </div>

          <div className="border-t border-border" />

          {/* Putts */}
          <div className="flex items-center justify-between">
            <div className="font-medium text-foreground">Putts</div>
            <Stepper value={hole.putts} onChange={(v) => updateHole("putts", v)} min={0} max={10} />
          </div>

          {/* Chips */}
          <div className="flex items-center justify-between">
            <div className="font-medium text-foreground">Chip Shots</div>
            <Stepper value={hole.chips} onChange={(v) => updateHole("chips", v)} min={0} max={10} />
          </div>

          {/* Bunker Shots */}
          <div className="flex items-center justify-between">
            <div className="font-medium text-foreground">Bunker Shots</div>
            <Stepper value={hole.bunkerShots} onChange={(v) => updateHole("bunkerShots", v)} min={0} max={10} />
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      
      <div className="flex gap-3">
        <Button variant="outline" onClick={() => setCurrentHole((h) => h - 1)} disabled={currentHole === 0}
          className="flex items-center gap-1">
          <ChevronLeft className="size-4" /> Prev
        </Button>

        {isLast ? (
          <Button onClick={handleFinish} disabled={saving} className="flex-1 flex items-center gap-2">
            <CheckCircle2 className="size-4" /> {saving ? "Saving..." : "Finish Round"}
          </Button>
        ) : (
          <Button onClick={() => setCurrentHole((h) => h + 1)}
            className="flex-1 flex items-center justify-center gap-1">
            Next Hole <ChevronRight className="size-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
