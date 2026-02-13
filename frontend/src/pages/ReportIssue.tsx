import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, Upload, Loader2, MapPin, ExternalLink, X, ImagePlus } from "lucide-react";
import { categories } from "@/lib/mockData";
import { complaintsApi } from "@/lib/api";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icon for leaflet
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const MAX_IMAGES = 5;

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
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [geoLoading, setGeoLoading] = useState(false);
  const [showMap, setShowMap] = useState(false);

  // Leaflet map refs
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  // Reverse geocode helper
  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
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
      return parts.join(", ") || data.display_name || `${lat}, ${lng}`;
    } catch {
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    }
  };

  // Initialize or update Leaflet map
  useEffect(() => {
    if (!showMap || !mapContainerRef.current) return;

    const lat = latitude ?? 27.7;
    const lng = longitude ?? 85.3;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current).setView([lat, lng], 14);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      const marker = L.marker([lat, lng], { draggable: true }).addTo(map);
      marker.on("dragend", async () => {
        const pos = marker.getLatLng();
        setLatitude(pos.lat);
        setLongitude(pos.lng);
        const addr = await reverseGeocode(pos.lat, pos.lng);
        setLocation(addr);
      });

      map.on("click", async (e: L.LeafletMouseEvent) => {
        const { lat: cLat, lng: cLng } = e.latlng;
        marker.setLatLng([cLat, cLng]);
        setLatitude(cLat);
        setLongitude(cLng);
        const addr = await reverseGeocode(cLat, cLng);
        setLocation(addr);
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;

      // Force resize after render
      setTimeout(() => map.invalidateSize(), 200);
    } else {
      mapInstanceRef.current.setView([lat, lng], 14);
      markerRef.current?.setLatLng([lat, lng]);
    }
  }, [showMap, latitude, longitude]);

  // Cleanup map on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
  }, []);

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude: lat, longitude: lng } = position.coords;
        setLatitude(lat);
        setLongitude(lng);
        const addr = await reverseGeocode(lat, lng);
        setLocation(addr);
        setShowMap(true);
        setGeoLoading(false);
      },
      () => {
        setError("Could not get your location. Please allow location access.");
        setGeoLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleOpenMap = () => {
    if (!latitude || !longitude) {
      // Default to Kathmandu
      setLatitude(27.7172);
      setLongitude(85.324);
    }
    setShowMap(true);
  };

  // Multi-image handlers
  const handleAddImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remaining = MAX_IMAGES - images.length;
    const toAdd = files.slice(0, remaining);

    const newImages = [...images, ...toAdd];
    setImages(newImages);

    // Generate previews
    const newPreviews = [...imagePreviews];
    toAdd.forEach((file) => {
      newPreviews.push(URL.createObjectURL(file));
    });
    setImagePreviews(newPreviews);

    // Reset file input value
    e.target.value = "";
  };

  const handleRemoveImage = (index: number) => {
    URL.revokeObjectURL(imagePreviews[index]);
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
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
      if (latitude !== null) formData.append("latitude", String(latitude));
      if (longitude !== null) formData.append("longitude", String(longitude));
      // First image goes to the legacy 'image' field
      if (images.length > 0) {
        formData.append("image", images[0]);
      }
      // All images go to 'images' for the new multi-image support
      images.forEach((img) => {
        formData.append("images", img);
      });

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

        {/* Location Section */}
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

          {/* Coords + Map toggle */}
          <div className="flex items-center gap-3 flex-wrap mt-1">
            {latitude !== null && longitude !== null && (
              <>
                <span className="text-xs text-muted-foreground">📍 {latitude.toFixed(6)}, {longitude.toFixed(6)}</span>
                <a
                  href={`https://www.google.com/maps?q=${latitude},${longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  <ExternalLink className="h-3 w-3" /> View on Google Maps
                </a>
              </>
            )}
            {!showMap && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-xs h-7 px-2"
                onClick={handleOpenMap}
              >
                <MapPin className="h-3 w-3 mr-1" /> Pick on Map
              </Button>
            )}
          </div>

          {/* Leaflet Map */}
          {showMap && (
            <div className="mt-2 rounded-lg border overflow-hidden">
              <div className="bg-muted/30 px-3 py-1.5 flex items-center justify-between border-b">
                <span className="text-xs text-muted-foreground font-medium">📍 Click or drag the marker to set location</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => setShowMap(false)}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
              <div ref={mapContainerRef} style={{ height: "300px", width: "100%" }} />
            </div>
          )}
        </div>

        {/* Multi-Image Upload */}
        <div className="space-y-2">
          <Label>Photos (up to {MAX_IMAGES})</Label>

          {/* Thumbnails */}
          {imagePreviews.length > 0 && (
            <div className="flex flex-wrap gap-3 mb-2">
              {imagePreviews.map((src, idx) => (
                <div key={idx} className="relative group">
                  <img
                    src={src}
                    alt={`Upload ${idx + 1}`}
                    className="h-20 w-20 rounded-lg object-cover border"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute -top-2 -right-2 bg-destructive text-white rounded-full h-5 w-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {images.length < MAX_IMAGES && (
            <label className="flex items-center gap-3 rounded-lg border border-dashed bg-card p-6 cursor-pointer hover:bg-muted/50 transition-colors">
              <ImagePlus className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {images.length === 0
                  ? "Click to upload photos"
                  : `Add more photos (${images.length}/${MAX_IMAGES})`}
              </span>
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleAddImages}
              />
            </label>
          )}
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
