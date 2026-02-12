import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, CheckCircle, Circle } from "lucide-react";
import { sampleComplaints, statusSteps } from "@/lib/mockData";
import StatusBadge from "@/components/StatusBadge";
import type { Complaint } from "@/lib/mockData";

const TrackComplaint = () => {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<Complaint | null | "not_found">(null);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    const found = sampleComplaints.find((c) => c.id.toLowerCase() === query.trim().toLowerCase());
    setResult(found || "not_found");
  };

  const activeIndex = result && result !== "not_found"
    ? statusSteps.indexOf(result.status)
    : -1;

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <h1 className="text-2xl md:text-3xl font-bold mb-2">Track Your Complaint</h1>
      <p className="text-muted-foreground mb-8">Enter your Complaint ID to see real-time status updates.</p>

      <form onSubmit={handleTrack} className="flex gap-2 mb-10">
        <Input
          placeholder="e.g. HA-2025-001"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          required
          className="bg-card"
        />
        <Button type="submit">
          <Search className="h-4 w-4 mr-2" /> Track
        </Button>
      </form>

      {result === "not_found" && (
        <div className="rounded-lg border bg-card p-6 text-center card-shadow">
          <p className="text-muted-foreground">No complaint found with that ID. Please check and try again.</p>
        </div>
      )}

      {result && result !== "not_found" && (
        <div className="rounded-lg border bg-card p-6 card-shadow space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <p className="text-sm text-muted-foreground">Complaint ID</p>
              <p className="font-bold text-lg">{result.id}</p>
            </div>
            <StatusBadge status={result.status} />
          </div>

          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div><span className="text-muted-foreground">Title:</span> <span className="font-medium">{result.title}</span></div>
            <div><span className="text-muted-foreground">Category:</span> <span className="font-medium">{result.category}</span></div>
            <div><span className="text-muted-foreground">Location:</span> <span className="font-medium">{result.location}</span></div>
            <div><span className="text-muted-foreground">Date:</span> <span className="font-medium">{result.date}</span></div>
          </div>

          {/* Timeline */}
          <div>
            <h3 className="font-semibold mb-4">Status Timeline</h3>
            <div className="flex flex-col gap-1">
              {statusSteps.map((step, i) => {
                const done = i <= activeIndex;
                return (
                  <div key={step} className="flex items-start gap-3">
                    <div className="flex flex-col items-center">
                      {done ? (
                        <CheckCircle className="h-5 w-5 text-success" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground/40" />
                      )}
                      {i < statusSteps.length - 1 && (
                        <div className={`w-0.5 h-8 ${done ? "bg-success" : "bg-muted"}`} />
                      )}
                    </div>
                    <span className={`text-sm pt-0.5 ${done ? "font-medium" : "text-muted-foreground"}`}>
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <p className="text-xs text-muted-foreground mt-6 text-center">
        Try: HA-2025-001, HA-2025-002, HA-2025-003, HA-2025-004, HA-2025-005
      </p>
    </div>
  );
};

export default TrackComplaint;
