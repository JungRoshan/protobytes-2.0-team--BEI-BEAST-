import { Badge } from "@/components/ui/badge";
import type { ComplaintStatus } from "@/lib/mockData";

const statusStyles: Record<ComplaintStatus, string> = {
  Submitted: "bg-info/15 text-info border-info/30",
  Assigned: "bg-warning/15 text-warning border-warning/30",
  "In Progress": "bg-primary/15 text-primary border-primary/30",
  Resolved: "bg-success/15 text-success border-success/30",
};

const StatusBadge = ({ status }: { status: ComplaintStatus }) => (
  <Badge variant="outline" className={`font-medium ${statusStyles[status]}`}>
    {status}
  </Badge>
);

export default StatusBadge;
