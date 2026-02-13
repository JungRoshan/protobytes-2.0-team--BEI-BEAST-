import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import StatusBadge from "@/components/StatusBadge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Shield, Loader2, ShieldAlert, X, MapPin, Calendar, Tag, Eye, User, ExternalLink, Building2, UserCheck } from "lucide-react";
import { statusSteps } from "@/lib/mockData";
import type { ComplaintStatus, Department, DepartmentAdmin } from "@/lib/mockData";
import { useAuth } from "@/contexts/AuthContext";
import { complaintsApi, departmentsApi } from "@/lib/api";


interface ComplaintImage {
  id: number;
  image: string;
  uploaded_at: string;
}

interface AdminComplaint {
  id: number;
  complaint_id: string;
  title: string;
  category: string;
  category_display: string;
  description: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
  status: ComplaintStatus;
  date: string;
  image: string | null;
  images: ComplaintImage[];
  created_at: string;
  updated_at: string;
  submitted_by: string | null;
  assigned_department: number | null;
  assigned_department_name: string | null;
  assigned_to: number | null;
  assigned_to_name: string | null;
}

const AdminDashboard = () => {
  const { isAuthenticated, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState<AdminComplaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedComplaint, setSelectedComplaint] = useState<AdminComplaint | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Department assignment state
  const [departments, setDepartments] = useState<Department[]>([]);
  const [deptAdmins, setDeptAdmins] = useState<DepartmentAdmin[]>([]);
  const [assignLoading, setAssignLoading] = useState(false);

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

    Promise.all([
      complaintsApi.list(),
      departmentsApi.list(),
    ])
      .then(([complaintsRes, deptsRes]) => {
        setComplaints(complaintsRes.data.results || complaintsRes.data);
        setDepartments(deptsRes.data.results || deptsRes.data);
      })
      .catch((err) => {
        setError(err.response?.data?.detail || "Failed to load data.");
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
    setDeptAdmins([]);
    try {
      const res = await complaintsApi.get(complaint.id);
      setSelectedComplaint(res.data);
      // Load department admins if department is assigned
      if (res.data.assigned_department) {
        const adminsRes = await departmentsApi.getAdmins(res.data.assigned_department);
        setDeptAdmins(adminsRes.data);
      }
    } catch {
      setSelectedComplaint(complaint);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleAssignDepartment = async (complaintId: number, departmentId: string) => {
    setAssignLoading(true);
    setError("");
    try {
      const deptId = departmentId === "none" ? null : Number(departmentId);
      const res = await complaintsApi.assign(complaintId, { assigned_department: deptId });
      const updated = res.data;
      setComplaints((prev) =>
        prev.map((c) => (c.id === complaintId ? { ...c, ...updated } : c))
      );
      setSelectedComplaint((prev) => prev?.id === complaintId ? { ...prev, ...updated } : prev);

      // Load admins for new department
      if (deptId) {
        const adminsRes = await departmentsApi.getAdmins(deptId);
        setDeptAdmins(adminsRes.data);
      } else {
        setDeptAdmins([]);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to assign department.");
    } finally {
      setAssignLoading(false);
    }
  };

  const handleAssignUser = async (complaintId: number, userId: string) => {
    setAssignLoading(true);
    setError("");
    try {
      const uid = userId === "none" ? null : Number(userId);
      const res = await complaintsApi.assign(complaintId, { assigned_to: uid });
      const updated = res.data;
      setComplaints((prev) =>
        prev.map((c) => (c.id === complaintId ? { ...c, ...updated } : c))
      );
      setSelectedComplaint((prev) => prev?.id === complaintId ? { ...prev, ...updated } : prev);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to assign user.");
    } finally {
      setAssignLoading(false);
    }
  };

  // Suggest department based on complaint category
  const suggestDepartment = (category: string): Department | undefined => {
    return departments.find((d) =>
      d.categories_list?.includes(category)
    );
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
      <p className="text-muted-foreground mb-8">Manage complaints, assign departments, and update statuses.</p>

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
            <div className="p-5 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
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
                      {selectedComplaint.latitude && selectedComplaint.longitude && (
                        <a
                          href={`https://www.google.com/maps?q=${selectedComplaint.latitude},${selectedComplaint.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 mt-1 text-xs text-primary hover:underline"
                        >
                          <ExternalLink className="h-3 w-3" /> Open in Google Maps
                        </a>
                      )}
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

                {/* Right: Images */}
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Uploaded Images</p>
                  {(selectedComplaint.images && selectedComplaint.images.length > 0) ? (
                    <div className="grid grid-cols-2 gap-2">
                      {selectedComplaint.images.map((img) => (
                        <a key={img.id} href={img.image} target="_blank" rel="noopener noreferrer">
                          <img
                            src={img.image}
                            alt={selectedComplaint.title}
                            className="rounded-lg border object-cover w-full h-36 hover:opacity-90 transition-opacity cursor-pointer"
                          />
                        </a>
                      ))}
                    </div>
                  ) : selectedComplaint.image ? (
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

              {/* Assignment Section */}
              <div className="border-t pt-4">
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-primary" /> Department Assignment
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground font-medium">Assign to Department</label>
                    <Select
                      value={selectedComplaint.assigned_department ? String(selectedComplaint.assigned_department) : "none"}
                      onValueChange={(v) => handleAssignDepartment(selectedComplaint.id, v)}
                      disabled={assignLoading}
                    >
                      <SelectTrigger className="bg-card">
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent className="bg-card z-50">
                        <SelectItem value="none">— Unassigned —</SelectItem>
                        {departments.map((d) => (
                          <SelectItem key={d.id} value={String(d.id)}>
                            {d.name}
                            {suggestDepartment(selectedComplaint.category)?.id === d.id
                              ? " ⭐ Suggested"
                              : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                      <UserCheck className="h-3 w-3" /> Assign to Officer
                    </label>
                    <Select
                      value={selectedComplaint.assigned_to ? String(selectedComplaint.assigned_to) : "none"}
                      onValueChange={(v) => handleAssignUser(selectedComplaint.id, v)}
                      disabled={assignLoading || !selectedComplaint.assigned_department}
                    >
                      <SelectTrigger className="bg-card">
                        <SelectValue placeholder={selectedComplaint.assigned_department ? "Select officer" : "Select department first"} />
                      </SelectTrigger>
                      <SelectContent className="bg-card z-50">
                        <SelectItem value="none">— Unassigned —</SelectItem>
                        {deptAdmins.map((a) => (
                          <SelectItem key={a.id} value={String(a.id)}>
                            {a.first_name} {a.last_name} ({a.role})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
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
              <TableHead className="hidden xl:table-cell">Department</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Action</TableHead>
              <TableHead className="w-[50px]">View</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {complaints.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
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
                  <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                    {c.latitude && c.longitude ? (
                      <a
                        href={`https://www.google.com/maps?q=${c.latitude},${c.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline inline-flex items-center gap-1"
                      >
                        {c.location} <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      c.location
                    )}
                  </TableCell>
                  <TableCell className="hidden xl:table-cell text-sm">
                    {c.assigned_department_name ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                        <Building2 className="h-3 w-3" /> {c.assigned_department_name}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
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
