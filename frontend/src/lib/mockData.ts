export const categories = [
  { id: "road", label: "Road Issues", icon: "Construction" },
  { id: "waste", label: "Waste Management", icon: "Trash2" },
  { id: "water", label: "Water Problems", icon: "Droplets" },
  { id: "electricity", label: "Electricity", icon: "Zap" },
  { id: "streetlight", label: "Streetlight", icon: "Lightbulb" },
  { id: "other", label: "Other Issues", icon: "MessageSquare" },
] as const;

export type ComplaintStatus = "Submitted" | "Assigned" | "In Progress" | "Resolved";

export interface Complaint {
  id: string;
  title: string;
  category: string;
  description: string;
  location: string;
  status: ComplaintStatus;
  date: string;
}

export const sampleComplaints: Complaint[] = [
  {
    id: "HA-2025-001",
    title: "Pothole on Main Street",
    category: "Road Issues",
    description: "Large pothole near the intersection causing traffic issues.",
    location: "Main Street, Ward 5",
    status: "In Progress",
    date: "2025-02-10",
  },
  {
    id: "HA-2025-002",
    title: "Overflowing garbage bin",
    category: "Waste Management",
    description: "Garbage bin at the park hasn't been collected for a week.",
    location: "City Park, Ward 3",
    status: "Assigned",
    date: "2025-02-09",
  },
  {
    id: "HA-2025-003",
    title: "Water pipe leakage",
    category: "Water Problems",
    description: "Water leaking from a broken pipe on the roadside.",
    location: "Ring Road, Ward 7",
    status: "Submitted",
    date: "2025-02-11",
  },
  {
    id: "HA-2025-004",
    title: "Streetlight not working",
    category: "Streetlight",
    description: "Two streetlights near the school are not functioning.",
    location: "School Road, Ward 2",
    status: "Resolved",
    date: "2025-02-05",
  },
  {
    id: "HA-2025-005",
    title: "Power outage in residential area",
    category: "Electricity",
    description: "Frequent power cuts in the area for the past 3 days.",
    location: "Lakeside Colony, Ward 9",
    status: "In Progress",
    date: "2025-02-08",
  },
];

export const statusSteps: ComplaintStatus[] = ["Submitted", "Assigned", "In Progress", "Resolved"];
