import { useState } from "react";
import { sampleComplaints, statusSteps } from "@/lib/mockData";
import StatusBadge from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Shield } from "lucide-react";
import type { Complaint, ComplaintStatus } from "@/lib/mockData";

const AdminDashboard = () => {
  const [complaints, setComplaints] = useState<Complaint[]>(sampleComplaints);

  const updateStatus = (id: string, newStatus: ComplaintStatus) => {
    setComplaints((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
    );
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex items-center gap-3 mb-2">
        <Shield className="h-6 w-6 text-primary" />
        <h1 className="text-2xl md:text-3xl font-bold">Admin Dashboard</h1>
      </div>
      <p className="text-muted-foreground mb-8">Manage and update complaint statuses.</p>

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
            {complaints.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-mono text-xs">{c.id}</TableCell>
                <TableCell className="font-medium max-w-[200px] truncate">{c.title}</TableCell>
                <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{c.category}</TableCell>
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
            ))}
          </TableBody>
        </Table>
      </div>

      <p className="text-xs text-muted-foreground mt-4 text-center">
        This is a UI prototype — changes are not persisted.
      </p>
    </div>
  );
};

export default AdminDashboard;
