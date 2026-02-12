import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import StatusBadge from "@/components/StatusBadge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Shield, Loader2, ShieldAlert } from "lucide-react";
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
  location: string;
  status: ComplaintStatus;
  date: string;
}

const AdminDashboard = () => {
  const { isAuthenticated, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState<AdminComplaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to update status.");
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
      <p className="text-muted-foreground mb-8">Manage and update complaint statuses.</p>

      {error && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/30 text-destructive p-3 mb-4 text-sm">
          {error}
        </div>
      )}

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
            </TableRow>
          </TableHeader>
          <TableBody>
            {complaints.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No complaints found.
                </TableCell>
              </TableRow>
            ) : (
              complaints.map((c) => (
                <TableRow key={c.id}>
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
