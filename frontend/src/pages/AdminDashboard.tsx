import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import StatusBadge from "@/components/StatusBadge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Shield, Loader2, ShieldAlert, X, MapPin, Calendar, Tag, Eye, User } from "lucide-react";
import { statusSteps } from "@/lib/mockData";
import type { ComplaintStatus } from "@/lib/mockData";
import { useAuth } from "@/contexts/AuthContext";
import { complaintsApi } from "@/lib/api";



interface AdminComplaint {
  id: number;
  complaint_id: string;
  title: string;
  category: string;
  category_display: string;
  description: string;
  location: string;
  status: ComplaintStatus;
  date: string;
  image: string | null;
  created_at: string;
  updated_at: string;
  submitted_by: string | null;
}

const AdminDashboard = () => {
  const { isAuthenticated, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState<AdminComplaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedComplaint, setSelectedComplaint] = useState<AdminComplaint | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    complaintsApi.list()
      .then((res) => {
        setComplaints(res.data.results || res.data);
      })
      .catch((err) => {
        setError(err.response?.data?.detail || "Failed to load complaints.");
      })
      .finally(() => setLoading(false));
  }, [isAuthenticated, isAdmin, authLoading, navigate]);

  const updateStatus = async (id: number, newStatus: ComplaintStatus) => {
    try {
      await complaintsApi.updateStatus(id, newStatus);
      setComplaints((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
      );
      if (selectedComplaint?.id === id) {
        setSelectedComplaint((prev) => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to update status.");
    }
  };

  const viewDetail = async (complaint: AdminComplaint) => {
    setDetailLoading(true);
    try {
      const res = await complaintsApi.get(complaint.id);
      setSelectedComplaint(res.data);
    } catch {
      setSelectedComplaint(complaint);
    } finally {
      setDetailLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-20 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-20 flex flex-col items-center text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-destructive/15 mb-6">
          <ShieldAlert className="h-10 w-10 text-destructive" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
        <p className="text-muted-foreground">You don't have permission to access the admin dashboard.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex items-center gap-3 mb-2">
        <Shield className="h-6 w-6 text-primary" />
        <h1 className="text-2xl md:text-3xl font-bold">Admin Dashboard</h1>
      </div>
      <p className="text-muted-foreground mb-8">Manage and update complaint statuses. Click the eye icon to view full details.</p>

      {error && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/30 text-destructive p-3 mb-4 text-sm">
          {error}
        </div>
      )}

      {/* Detail Panel */}
      {selectedComplaint && (
        <div className="mb-6 rounded-xl border bg-card card-shadow overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b bg-muted/30">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Tag className="h-4 w-4 text-primary" />
              Complaint Details — {selectedComplaint.complaint_id}
            </h2>
            <Button variant="ghost" size="icon" onClick={() => setSelectedComplaint(null)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {detailLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <div className="p-5 grid md:grid-cols-2 gap-6">
              {/* Left: Info */}
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Title</p>
                  <p className="font-semibold text-lg">{selectedComplaint.title}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Description</p>
                  <p className="text-sm leading-relaxed">{selectedComplaint.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Tag className="h-3 w-3" /> Category
                    </p>
                    <p className="text-sm font-medium">{selectedComplaint.category_display || selectedComplaint.category}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> Location
                    </p>
                    <p className="text-sm font-medium">{selectedComplaint.location}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Status</p>
                    <StatusBadge status={selectedComplaint.status} />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> Date Reported
                    </p>
                    <p className="text-sm font-medium">{selectedComplaint.date}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
                      <User className="h-3 w-3" /> Submitted By
                    </p>
                    <p className="text-sm font-medium">{selectedComplaint.submitted_by || "Unknown"}</p>
                  </div>
                </div>
              </div>

              {/* Right: Image */}
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Uploaded Image</p>
                {selectedComplaint.image ? (
                  <a href={selectedComplaint.image} target="_blank" rel="noopener noreferrer">
                    <img
                      src={selectedComplaint.image}
                      alt={selectedComplaint.title}
                      className="rounded-lg border object-cover w-full max-h-80 hover:opacity-90 transition-opacity cursor-pointer"
                    />
                  </a>
                ) : (
                  <div className="flex items-center justify-center rounded-lg border border-dashed bg-muted/30 h-48">
                    <p className="text-sm text-muted-foreground">No image uploaded</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Table */}
      <div className="rounded-lg border bg-card card-shadow overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Title</TableHead>
              <TableHead className="hidden md:table-cell">Category</TableHead>
              <TableHead className="hidden lg:table-cell">Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Action</TableHead>
              <TableHead className="w-[50px]">View</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {complaints.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  No complaints found.
                </TableCell>
              </TableRow>
            ) : (
              complaints.map((c) => (
                <TableRow
                  key={c.id}
                  className={selectedComplaint?.id === c.id ? "bg-primary/5" : ""}
                >
                  <TableCell className="font-mono text-xs">{c.complaint_id}</TableCell>
                  <TableCell className="font-medium max-w-[200px] truncate">{c.title}</TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{c.category_display}</TableCell>
                  <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">{c.location}</TableCell>
                  <TableCell><StatusBadge status={c.status} /></TableCell>
                  <TableCell>
                    <Select
                      value={c.status}
                      onValueChange={(v) => updateStatus(c.id, v as ComplaintStatus)}
                    >
                      <SelectTrigger className="w-[140px] h-8 text-xs bg-card">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-card z-50">
                        {statusSteps.map((s) => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => viewDetail(c)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminDashboard;
