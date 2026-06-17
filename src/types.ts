/**
 * AAMS Enterprise Governance & Asset Intelligence - Type Declarations
 */

export enum AssetType {
  IT_HARDWARE = "IT Hardware",
  FURNITURE = "Furniture & Fixtures",
  MACHINERY = "Production Machinery",
  VEHICLE = "Enterprise Vehicle",
  REAL_ESTATE = "Facility / Real Estate"
}

export enum AssetStatus {
  ACTIVE = "Active",
  UNDER_AUDIT = "Under Audit",
  TRANSFERRED = "Transferred",
  DISPOSED = "Disposed",
  PENDING_APPROVAL = "Pending Approval"
}

export enum AuditStatus {
  DRAFT = "Draft",
  IN_PROGRESS = "In Progress",
  COMPLETED = "Completed"
}

export enum Severity {
  LOW = "Low",
  MEDIUM = "Medium",
  HIGH = "High",
  CRITICAL = "Critical"
}

export enum ApprovalStatus {
  PENDING = "Pending Approval",
  APPROVED = "Approved",
  REJECTED = "Rejected"
}

export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  status: AssetStatus;
  acquisitionValue: number;
  accumulatedDepreciation: number;
  bookValue: number;
  depreciationMethod: string;
  usefulLifeYrs: number;
  location: string;
  assignedUser: string;
  lastInspectionDate: string;
  leaseDocStatus: "Attached" | "Missing" | "N/A";
  governanceFlags: string[];
  daysInactive: number;
}

export interface AuditCampaign {
  id: string;
  title: string;
  leadAuditor: string;
  progress: number;
  startDate: string;
  endDate: string;
  status: AuditStatus;
  targetCount: number;
  verifiedCount: number;
}

export interface Observation {
  id: string;
  assetId: string;
  assetName: string;
  severity: Severity;
  description: string;
  dateLogged: string;
  status: "Open" | "Remediated" | "Acquitted";
}

export interface ApprovalItem {
  id: string;
  title: string;
  requester: string;
  role: string;
  type: "New Asset Entry" | "Asset Transfer" | "Asset Disposal" | "Depreciation Adjustment" | "Vendor Master Update";
  status: ApprovalStatus;
  dateCreated: string;
  details: string;
  targetId?: string; // Associated asset or item ID
}

export interface SystemLog {
  id: string;
  timestamp: string;
  level: "INFO" | "WARNING" | "CRITICAL" | "SUCCESS";
  module: string;
  message: string;
  actor: string;
}

export type UserRole = "Auditor" | "Finance" | "AssetManager" | "Admin";

export interface UserSession {
  name: string;
  email: string;
  companyName: string;
  role: UserRole;
  avatar: string;
}

export interface LocationMaster {
  code: string;
  name: string;
  siteLead: string;
  status: "Active" | "Inactive";
}

export interface VendorMaster {
  id: string;
  name: string;
  category: string;
  score: number;
  status: "Preferred" | "Approved" | "Under Review";
}
