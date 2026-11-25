export type UserRole =
  | "farmer"
  | "warehouse_owner"
  | "psychiatrist"
  | "support_staff";

export type EffectivePortalRole = UserRole | "admin";

export const ADMIN_BOOTSTRAP_EMAIL = "pranav25dhiman1107@gmail.com";

export interface DemoAccountCredential {
  id: string;
  role: UserRole;
  isAdminDemo?: boolean;
  label: string;
  badge: string;
  name: string;
  email: string;
  password: string;
  state: string;
  district: string;
  phone: string;
  landSizeAcres: number;
  primaryCrops: string[];
  specialization?: string;
  qualification?: string;
  department?: string;
  summary: string;
}

export const DEMO_ACCOUNTS: DemoAccountCredential[] = [
  {
    id: "demo-farmer-1",
    role: "farmer",
    label: "Farmer Profile",
    badge: "Farmer",
    name: "Harpreet Singh Gill",
    email: "farmer.test@bhoomibandhu.in",
    password: "Farmer@123",
    state: "Punjab",
    district: "Ludhiana",
    phone: "+91 98140 11223",
    landSizeAcres: 4.5,
    primaryCrops: ["Wheat", "Paddy", "Mustard"],
    summary: "Browse schemes, weather crop advisor, insurance, loans, storage & psychiatrist care.",
  },
  {
    id: "demo-owner-1",
    role: "warehouse_owner",
    label: "Warehouse Owner",
    badge: "Warehouse",
    name: "Rajeshwar Patel",
    email: "owner.test@bhoomibandhu.in",
    password: "Owner@123",
    state: "Gujarat",
    district: "Rajkot",
    phone: "+91 98250 44556",
    landSizeAcres: 0,
    primaryCrops: ["Cotton", "Groundnut", "Wheat"],
    summary: "List godowns, update capacity, and approve or reject farmer storage bookings.",
  },
  {
    id: "demo-psychiatrist-1",
    role: "psychiatrist",
    label: "Psychiatrist (Mental Health)",
    badge: "Doctor",
    name: "Dr. Ananya Deshmukh",
    email: "doctor.test@bhoomibandhu.in",
    password: "Doctor@123",
    state: "Maharashtra",
    district: "Pune",
    phone: "+91 97650 77889",
    landSizeAcres: 0,
    primaryCrops: [],
    specialization: "Rural Stress, Financial Anxiety & Family Support",
    qualification: "MD Psychiatry, NIMHANS Fellow",
    summary: "Manage availability, review confidential farmer consultations, and send guidance notes.",
  },
  {
    id: "demo-support-1",
    role: "support_staff",
    label: "Company Support Employee",
    badge: "Support Staff",
    name: "Vikram Verma",
    email: "support.test@bhoomibandhu.in",
    password: "Support@123",
    state: "Uttar Pradesh",
    district: "Lucknow",
    phone: "+91 94150 33445",
    landSizeAcres: 0,
    primaryCrops: [],
    department: "Farmer Help & Operations Desk",
    summary: "Claim open farmer help & well-being tickets, send replies, and resolve cases.",
  },
  {
    id: "demo-admin-preview",
    role: "farmer",
    isAdminDemo: true,
    label: "Admin Sandbox Preview",
    badge: "Admin Preview",
    name: "Pranav Dhiman (Admin Preview)",
    email: "admin.demo@bhoomibandhu.in",
    password: "Admin@123",
    state: "Punjab",
    district: "Chandigarh",
    phone: "+91 98000 00001",
    landSizeAcres: 0,
    primaryCrops: [],
    department: "Platform Administration",
    summary:
      "Preview full Admin Portal (Loan/Insurance companies, all users, psychiatrists, warehouses & tickets). Real live DB admin uses pranav25dhiman1107@gmail.com via Google/Firebase Auth.",
  },
];

export function matchDemoCredential(
  email: string,
  password: string
): DemoAccountCredential | null {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !password) return null;
  return (
    DEMO_ACCOUNTS.find(
      (acc) => acc.email.toLowerCase() === cleanEmail && acc.password === password
    ) || null
  );
}

export function getRoleDisplayLabel(
  role?: UserRole | null,
  isAdmin?: boolean
): string {
  if (isAdmin) return "Administrator";
  switch (role) {
    case "warehouse_owner":
      return "Warehouse Owner";
    case "psychiatrist":
      return "Psychiatrist";
    case "support_staff":
      return "Support Employee";
    case "farmer":
    default:
      return "Farmer";
  }
}

export function getDefaultRouteForRole(
  role?: UserRole | null,
  isAdmin?: boolean
): string {
  if (isAdmin) return "/admin";
  switch (role) {
    case "psychiatrist":
      return "/psychiatrist";
    case "support_staff":
      return "/support-desk";
    case "warehouse_owner":
    case "farmer":
    default:
      return "/";
  }
}

export const ADMIN_ALLOWED_PREFIXES = [
  "/admin",
  "/psychiatrist",
  "/support-desk",
  "/notifications",
  "/profile",
] as const;

const FARMER_ONLY_PREFIXES = [
  "/schemes",
  "/eligibility",
  "/crop-advisor",
  "/chat",
  "/wellbeing",
  "/services",
] as const;

export function canAccessRoute(
  role: UserRole | undefined | null,
  isAdmin: boolean,
  path: string
): boolean {
  if (isAdmin) {
    return ADMIN_ALLOWED_PREFIXES.some((prefix) => path.startsWith(prefix));
  }
  if (path.startsWith("/admin")) {
    return false;
  }
  if (path.startsWith("/psychiatrist")) {
    return role === "psychiatrist";
  }
  if (path.startsWith("/support-desk")) {
    return role === "support_staff";
  }
  if (path.startsWith("/wellbeing")) {
    return role === "farmer";
  }
  if (
    role === "warehouse_owner" &&
    FARMER_ONLY_PREFIXES.some((prefix) => path.startsWith(prefix))
  ) {
    return false;
  }
  return true;
}

export function isValidRole(value: unknown): value is UserRole {
  return (
    value === "farmer" ||
    value === "warehouse_owner" ||
    value === "psychiatrist" ||
    value === "support_staff"
  );
}
