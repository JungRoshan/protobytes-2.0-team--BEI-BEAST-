import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ThumbsUp, MapPin, Calendar, Tag, Loader2, Filter, ArrowUpDown, ExternalLink } from "lucide-react";
import { complaintsApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { categories } from "@/lib/mockData";

interface ComplaintImage {
    id: number;
    image: string;
    uploaded_at: string;
}

interface PublicComplaint {
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

const Complaints = () => {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [complaints, setComplaints] = useState<PublicComplaint[]>([]);
    const [loading, setLoading] = useState(true);
    const [upvoting, setUpvoting] = useState<number | null>(null);

    // Filters
    const [category, setCategory] = useState("");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [sort, setSort] = useState("recent");

    const fetchComplaints = async () => {
        setLoading(true);
        try {
            const params: Record<string, string> = {};
            if (category && category !== "all") params.category = category;
            if (dateFrom) params.date_from = dateFrom;
            if (dateTo) params.date_to = dateTo;
            if (sort) params.sort = sort;
            const res = await complaintsApi.publicList(params);
            setComplaints(res.data);
        } catch {
            setComplaints([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchComplaints();
    }, [category, dateFrom, dateTo, sort]);

    const handleUpvote = async (id: number) => {
        if (!isAuthenticated) {
            navigate("/login");
            return;
        }
        setUpvoting(id);
        try {
            const res = await complaintsApi.toggleUpvote(id);
            setComplaints((prev) =>
                prev.map((c) =>
                    c.id === id
                        ? { ...c, upvote_count: res.data.upvote_count, is_upvoted: res.data.upvoted }
                        : c
                )
            );
        } catch {
            // ignore
        } finally {
            setUpvoting(null);
        }
    };

    const clearFilters = () => {
        setCategory("");
        setDateFrom("");
        setDateTo("");
        setSort("recent");
    };

    // Get the display image(s) for a complaint
    const getCardImage = (c: PublicComplaint): string | null => {
        if (c.images && c.images.length > 0) return c.images[0].image;
        return c.image;
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold flex items-center gap-2">
                    🗣️ Community Complaints
                </h1>
                <p className="text-muted-foreground mt-1">
                    Browse all reported issues. Upvote to show urgency — your voice matters!
                </p>
            </div>

            {/* Filter Bar */}
            <div className="mb-6 rounded-xl border bg-card p-4 card-shadow">
                <div className="flex items-center gap-2 mb-3">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">Filters</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                    <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger className="bg-background">
                            <SelectValue placeholder="All Categories" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {categories.map((c) => (
                                <SelectItem key={c.id} value={c.id}>
                                    {c.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Input
                        type="date"
                        placeholder="From"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        className="bg-background"
                    />
                    <Input
                        type="date"
                        placeholder="To"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        className="bg-background"
                    />

                    <Select value={sort} onValueChange={setSort}>
                        <SelectTrigger className="bg-background">
                            <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="recent">
                                <span className="flex items-center gap-1"><ArrowUpDown className="h-3 w-3" /> Most Recent</span>
                            </SelectItem>
                            <SelectItem value="oldest">Oldest First</SelectItem>
                            <SelectItem value="most_upvoted">
                                <span className="flex items-center gap-1"><ThumbsUp className="h-3 w-3" /> Most Upvoted</span>
                            </SelectItem>
                        </SelectContent>
                    </Select>

                    <Button variant="outline" onClick={clearFilters} className="w-full">
                        Clear Filters
                    </Button>
                </div>
            </div>

            {/* Complaint Cards */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : complaints.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground">
                    <p className="text-lg font-medium">No complaints found</p>
                    <p className="text-sm mt-1">Try adjusting your filters</p>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2">
                    {complaints.map((c) => {
                        const cardImg = getCardImage(c);
                        const extraCount = c.images ? c.images.length - 1 : 0;

                        return (
                            <div
                                key={c.id}
                                className="rounded-xl border bg-card card-shadow overflow-hidden hover:shadow-lg transition-shadow"
                            >
                                {/* Image */}
                                {cardImg && (
                                    <div className="relative h-48 overflow-hidden border-b">
                                        <img
                                            src={cardImg}
                                            alt={c.title}
                                            className="w-full h-full object-cover"
                                        />
                                        {extraCount > 0 && (
                                            <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                                                +{extraCount} photo{extraCount > 1 ? "s" : ""}
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="p-5">
                                    {/* Top row: ID + Status */}
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-mono text-muted-foreground">{c.complaint_id}</span>
                                        <Badge variant="outline" className={statusColors[c.status] || ""}>
                                            {c.status}
                                        </Badge>
                                    </div>

                                    {/* Title */}
                                    <h3 className="font-semibold text-lg leading-tight mb-2">{c.title}</h3>

                                    {/* Description */}
                                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                                        {c.description}
                                    </p>

                                    {/* Meta */}
                                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-4">
                                        <span className="flex items-center gap-1">
                                            <Tag className="h-3 w-3" /> {c.category_display}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <MapPin className="h-3 w-3" />
                                            {c.latitude && c.longitude ? (
                                                <a
                                                    href={`https://www.google.com/maps?q=${c.latitude},${c.longitude}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-primary hover:underline inline-flex items-center gap-0.5"
                                                >
                                                    {c.location} <ExternalLink className="h-2.5 w-2.5" />
                                                </a>
                                            ) : (
                                                c.location
                                            )}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3" /> {c.date}
                                        </span>
                                        {c.submitted_by && (
                                            <span className="flex items-center gap-1">
                                                👤 {c.submitted_by}
                                            </span>
                                        )}
                                    </div>

                                    {/* Upvote Button */}
                                    <div className="flex items-center justify-between border-t pt-3">
                                        <Button
                                            variant={c.is_upvoted ? "default" : "outline"}
                                            size="sm"
                                            className={`gap-1.5 ${c.is_upvoted ? "bg-primary text-primary-foreground" : ""}`}
                                            onClick={() => handleUpvote(c.id)}
                                            disabled={upvoting === c.id}
                                        >
                                            {upvoting === c.id ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <ThumbsUp className={`h-4 w-4 ${c.is_upvoted ? "fill-current" : ""}`} />
                                            )}
                                            Upvote
                                            <span className="ml-0.5 font-bold">{c.upvote_count}</span>
                                        </Button>
                                        {!isAuthenticated && (
                                            <span className="text-xs text-muted-foreground">Sign in to upvote</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Complaints;
