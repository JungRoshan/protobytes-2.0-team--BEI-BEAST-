import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, Upload, Loader2, MapPin } from "lucide-react";
import { categories } from "@/lib/mockData";
import { complaintsApi } from "@/lib/api";

const ReportIssue = () => {
  const [submitted, setSubmitted] = useState(false);
  const [complaintId, setComplaintId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchParams] = useSearchParams();
  const [category, setCategory] = useState("");

  useEffect(() => {
    const catParam = searchParams.get("category");
    if (catParam && categories.some((c) => c.id === catParam)) {
      setCategory(catParam);
    }
  }, [searchParams]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
            { headers: { "Accept-Language": "en" } }
          );
          const data = await res.json();
          const addr = data.address;
          const parts = [
            addr.road,
            addr.neighbourhood || addr.suburb,
            addr.city || addr.town || addr.village,
            addr.state,
          ].filter(Boolean);
          setLocation(parts.join(", ") || data.display_name || `${latitude}, ${longitude}`);
        } catch {
          setLocation(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
        } finally {
          setGeoLoading(false);
        }
      },
      (err) => {
        setError("Could not get your location. Please allow location access.");
        setGeoLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("category", category);
      formData.append("title", title);
      formData.append("description", description);
      formData.append("location", location);
      if (image) {
        formData.append("image", image);
      }

      const res = await complaintsApi.submit(formData);
      setComplaintId(res.data.complaint_id);
      setSubmitted(true);
    } catch (err: any) {
      const data = err.response?.data;
      if (data) {
        const firstError = typeof data === "string"
          ? data
          : Object.values(data).flat()[0] as string;
        setError(firstError || "Failed to submit complaint.");
      } else {
        setError("Failed to submit complaint. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="container mx-auto px-4 py-20 flex flex-col items-center text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-success/15 mb-6">
          <CheckCircle className="h-10 w-10 text-success" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Complaint Submitted!</h1>
        <p className="text-muted-foreground mb-4">Your complaint has been registered successfully.</p>
        <div className="rounded-lg border bg-card p-4 card-shadow">
          <p className="text-sm text-muted-foreground">Your Complaint ID</p>
          <p className="text-2xl font-bold text-primary">{complaintId}</p>
        </div>
        <p className="text-sm text-muted-foreground mt-4">Save this ID to track your complaint status.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <h1 className="text-2xl md:text-3xl font-bold mb-2">Report an Issue</h1>
      <p className="text-muted-foreground mb-8">Fill in the details below. We'll route it to the right department.</p>

      {error && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/30 text-destructive p-3 mb-4 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select required value={category} onValueChange={setCategory}>
            <SelectTrigger id="category" className="bg-card">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent className="bg-card z-50">
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            placeholder="e.g. Pothole on Main Road"
            required
            className="bg-card"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Describe the issue in detail..."
            rows={4}
            required
            className="bg-card"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location / Address</Label>
          <div className="flex gap-2">
            <Input
              id="location"
              placeholder="e.g. Ward 5, Main Street"
              required
              className="bg-card flex-1"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
            <Button
              type="button"
              variant="outline"
              className="shrink-0"
              onClick={handleUseMyLocation}
              disabled={geoLoading}
            >
              {geoLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <><MapPin className="h-4 w-4 mr-1" /> Use My Location</>
              )}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Image (optional)</Label>
          <label className="flex items-center gap-3 rounded-lg border border-dashed bg-card p-6 cursor-pointer hover:bg-muted/50 transition-colors">
            <Upload className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {image ? image.name : "Click or drag to upload an image"}
            </span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setImage(e.target.files?.[0] || null)}
            />
          </label>
        </div>

        <Button type="submit" size="lg" className="w-full font-semibold" disabled={loading}>
          {loading ? (
            <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Submitting...</>
          ) : (
            "Submit Complaint"
          )}
        </Button>
      </form>
    </div>
  );
};

export default ReportIssue;
