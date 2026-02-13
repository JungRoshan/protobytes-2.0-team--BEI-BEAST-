import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Calendar, Tag, ThumbsUp, Loader2, ExternalLink, User, Clock, Share2 } from "lucide-react";
import { complaintsApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

interface ComplaintImage {
    id: number;
    image: string;
    uploaded_at: string;
}

interface ComplaintDetail {
    id: number;
    complaint_id: string;
    title: string;
    category: string;
    category_display: string;
    description: string;
    location: string;
    latitude: number | null;
    longitude: number | null;
    status: string;
    image: string | null;
    images: ComplaintImage[];
    date: string;
    created_at: string;
    upvote_count: number;
    is_upvoted: boolean;
    submitted_by: string | null;
}

const statusColors: Record<string, string> = {
    Submitted: "bg-yellow-100 text-yellow-800 border-yellow-200",
    Assigned: "bg-blue-100 text-blue-800 border-blue-200",
    "In Progress": "bg-purple-100 text-purple-800 border-purple-200",
    Resolved: "bg-green-100 text-green-800 border-green-200",
};

const statusTimeline = ["Submitted", "Assigned", "In Progress", "Resolved"];

const ComplaintDetailPage = () => {
    const { complaintId } = useParams<{ complaintId: string }>();
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [complaint, setComplaint] = useState<ComplaintDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [upvoting, setUpvoting] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    useEffect(() => {
        if (!complaintId) return;
        setLoading(true);
        complaintsApi
            .track(complaintId)
            .then((res) => setComplaint(res.data))
            .catch(() => setError("Complaint not found."))
            .finally(() => setLoading(false));
    }, [complaintId]);

    const handleUpvote = async () => {
        if (!complaint) return;
        if (!isAuthenticated) {
            navigate("/login");
            return;
        }
        setUpvoting(true);
        try {
            const res = await complaintsApi.toggleUpvote(complaint.id);
            setComplaint((prev) =>
                prev
                    ? { ...prev, upvote_count: res.data.upvote_count, is_upvoted: res.data.upvoted }
                    : null
            );
        } catch {
            // ignore
        } finally {
            setUpvoting(false);
        }
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: complaint?.title,
                text: complaint?.description,
                url: window.location.href,
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
        }
    };

    const allImages: string[] = complaint
        ? complaint.images?.length
            ? complaint.images.map((i) => i.image)
            : complaint.image
                ? [complaint.image]
                : []
        : [];

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-20 flex justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error || !complaint) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <h1 className="text-2xl font-bold mb-2">Complaint Not Found</h1>
                <p className="text-muted-foreground mb-4">{error || "This complaint does not exist."}</p>
                <Link to="/complaints">
                    <Button variant="outline"><ArrowLeft className="h-4 w-4 mr-2" /> Back to Complaints</Button>
                </Link>
            </div>
        );
    }

    const currentStepIndex = statusTimeline.indexOf(complaint.status);

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            {/* Back Button */}
            <Link to="/complaints" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
                <ArrowLeft className="h-4 w-4" /> Back to Complaints
            </Link>

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
                <div>
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <Badge variant="outline" className={statusColors[complaint.status] || ""}>
                            {complaint.status}
                        </Badge>
                        <span className="text-xs font-mono text-muted-foreground">{complaint.complaint_id}</span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold leading-tight">{complaint.title}</h1>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant={complaint.is_upvoted ? "default" : "outline"}
                        size="sm"
                        className="gap-1.5"
                        onClick={handleUpvote}
                        disabled={upvoting}
                    >
                        {upvoting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <ThumbsUp className={`h-4 w-4 ${complaint.is_upvoted ? "fill-current" : ""}`} />
                        )}
                        {complaint.upvote_count}
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleShare}>
                        <Share2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Main Column */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Image Gallery */}
                    {allImages.length > 0 && (
                        <div className="rounded-xl border bg-card overflow-hidden card-shadow">
                            {/* Main Image */}
                            <div className="relative">
                                <img
                                    src={selectedImage || allImages[0]}
                                    alt={complaint.title}
                                    className="w-full h-80 object-cover cursor-pointer"
                                    onClick={() => window.open(selectedImage || allImages[0], "_blank")}
                                />
                            </div>
                            {/* Thumbnails */}
                            {allImages.length > 1 && (
                                <div className="flex gap-2 p-3 overflow-x-auto">
                                    {allImages.map((img, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setSelectedImage(img)}
                                            className={`shrink-0 rounded-lg overflow-hidden border-2 transition-all ${(selectedImage || allImages[0]) === img
                                                    ? "border-primary ring-2 ring-primary/20"
                                                    : "border-transparent hover:border-muted-foreground/30"
                                                }`}
                                        >
                                            <img
                                                src={img}
                                                alt={`Photo ${idx + 1}`}
                                                className="h-16 w-16 object-cover"
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Description */}
                    <div className="rounded-xl border bg-card p-6 card-shadow">
                        <h2 className="font-semibold mb-3">Description</h2>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{complaint.description}</p>
                    </div>

                    {/* Map */}
                    {complaint.latitude && complaint.longitude && (
                        <div className="rounded-xl border bg-card overflow-hidden card-shadow">
                            <div className="p-4 border-b flex items-center justify-between">
                                <h2 className="font-semibold flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-primary" /> Location
                                </h2>
                                <a
                                    href={`https://www.google.com/maps?q=${complaint.latitude},${complaint.longitude}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                                >
                                    <ExternalLink className="h-3 w-3" /> Open in Google Maps
                                </a>
                            </div>
                            <iframe
                                title="Complaint Location"
                                width="100%"
                                height="250"
                                style={{ border: 0 }}
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                src={`https://maps.google.com/maps?q=${complaint.latitude},${complaint.longitude}&z=15&output=embed`}
                            />
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Details Card */}
                    <div className="rounded-xl border bg-card p-5 card-shadow space-y-4">
                        <h2 className="font-semibold">Details</h2>
                        <div className="space-y-3 text-sm">
                            <div className="flex items-start gap-2">
                                <Tag className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                                <div>
                                    <p className="text-xs text-muted-foreground">Category</p>
                                    <p className="font-medium">{complaint.category_display}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-2">
                                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                                <div>
                                    <p className="text-xs text-muted-foreground">Location</p>
                                    <p className="font-medium">{complaint.location}</p>
                                    {complaint.latitude && complaint.longitude && (
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            📍 {complaint.latitude}, {complaint.longitude}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-start gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                                <div>
                                    <p className="text-xs text-muted-foreground">Date Reported</p>
                                    <p className="font-medium">{complaint.date}</p>
                                </div>
                            </div>
                            {complaint.submitted_by && (
                                <div className="flex items-start gap-2">
                                    <User className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-xs text-muted-foreground">Submitted By</p>
                                        <p className="font-medium">{complaint.submitted_by}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Status Timeline */}
                    <div className="rounded-xl border bg-card p-5 card-shadow">
                        <h2 className="font-semibold mb-4 flex items-center gap-2">
                            <Clock className="h-4 w-4 text-primary" /> Progress
                        </h2>
                        <div className="space-y-0">
                            {statusTimeline.map((step, idx) => {
                                const isCompleted = idx <= currentStepIndex;
                                const isCurrent = idx === currentStepIndex;
                                return (
                                    <div key={step} className="flex items-start gap-3">
                                        <div className="flex flex-col items-center">
                                            <div
                                                className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${isCurrent
                                                        ? "bg-primary text-primary-foreground border-primary scale-110"
                                                        : isCompleted
                                                            ? "bg-primary/20 text-primary border-primary/40"
                                                            : "bg-muted text-muted-foreground border-muted-foreground/30"
                                                    }`}
                                            >
                                                {isCompleted ? "✓" : idx + 1}
                                            </div>
                                            {idx < statusTimeline.length - 1 && (
                                                <div
                                                    className={`w-0.5 h-6 ${isCompleted ? "bg-primary/40" : "bg-muted-foreground/20"
                                                        }`}
                                                />
                                            )}
                                        </div>
                                        <div className="pt-0.5">
                                            <p
                                                className={`text-sm font-medium ${isCurrent
                                                        ? "text-primary"
                                                        : isCompleted
                                                            ? "text-foreground"
                                                            : "text-muted-foreground"
                                                    }`}
                                            >
                                                {step}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Upvote Card */}
                    <div className="rounded-xl border bg-card p-5 card-shadow text-center">
                        <p className="text-3xl font-bold text-primary mb-1">{complaint.upvote_count}</p>
                        <p className="text-xs text-muted-foreground mb-3">people support this issue</p>
                        <Button
                            variant={complaint.is_upvoted ? "default" : "outline"}
                            className="w-full gap-2"
                            onClick={handleUpvote}
                            disabled={upvoting}
                        >
                            {upvoting ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <ThumbsUp className={`h-4 w-4 ${complaint.is_upvoted ? "fill-current" : ""}`} />
                            )}
                            {complaint.is_upvoted ? "Upvoted" : "Upvote this Issue"}
                        </Button>
                        {!isAuthenticated && (
                            <p className="text-xs text-muted-foreground mt-2">
                                <Link to="/login" className="text-primary hover:underline">Sign in</Link> to upvote
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ComplaintDetailPage;
