import {
  Asset,
  AssetType,
  AssetStatus,
  AuditCampaign,
  AuditStatus,
  Observation,
  Severity,
  ApprovalItem,
  ApprovalStatus,
  SystemLog,
  LocationMaster,
  VendorMaster
} from "./types";

export const INITIAL_ASSETS: Asset[] = [
  {
    id: "AST-2026-9041",
    name: "MacBook Pro M3 Max - AI Development Unit",
    type: AssetType.IT_HARDWARE,
    status: AssetStatus.ACTIVE,
    acquisitionValue: 4500,
    accumulatedDepreciation: 1500,
    bookValue: 3000,
    depreciationMethod: "Straight-Line",
    usefulLifeYrs: 3,
    location: "San Francisco HQ - Floor 4",
    assignedUser: "Marcus Thorne",
    lastInspectionDate: "2026-05-12",
    leaseDocStatus: "Attached",
    governanceFlags: [],
    daysInactive: 12
  },
  {
    id: "AST-2026-1022",
    name: "High-Capacity Server Rack #33",
    type: AssetType.IT_HARDWARE,
    status: AssetStatus.UNDER_AUDIT,
    acquisitionValue: 18500,
    accumulatedDepreciation: 6160,
    bookValue: 12340,
    depreciationMethod: "Straight-Line",
    usefulLifeYrs: 5,
    location: "Seattle Data Center - Room 4A",
    assignedUser: "SysAdmin - Team Beta",
    lastInspectionDate: "2026-06-01",
    leaseDocStatus: "Attached",
    governanceFlags: [],
    daysInactive: 2
  },
  {
    id: "AST-2026-4402",
    name: "Industrial Precision laser Cutter v12",
    type: AssetType.MACHINERY,
    status: AssetStatus.ACTIVE,
    acquisitionValue: 124000,
    accumulatedDepreciation: 31000,
    bookValue: 93000,
    depreciationMethod: "Double Declining Balance",
    usefulLifeYrs: 10,
    location: "Detroit Production Plant - Lab B",
    assignedUser: "Sarah Jenkins",
    lastInspectionDate: "2026-04-10",
    leaseDocStatus: "N/A",
    governanceFlags: ["Safety inspection overdue"],
    daysInactive: 45
  },
  {
    id: "AST-2026-1215",
    name: "Autonomous Warehouse Forklift Unit G",
    type: AssetType.VEHICLE,
    status: AssetStatus.TRANSFERRED,
    acquisitionValue: 32000,
    accumulatedDepreciation: 8000,
    bookValue: 24000,
    depreciationMethod: "Straight-Line",
    usefulLifeYrs: 8,
    location: "Denver Distribution Block 2",
    assignedUser: "Logistics Team East",
    lastInspectionDate: "2026-03-24",
    leaseDocStatus: "Attached",
    governanceFlags: [],
    daysInactive: 90
  },
  {
    id: "AST-2026-8801",
    name: "Ergonomic Mesh Task Chairs (Set of 15)",
    type: AssetType.FURNITURE,
    status: AssetStatus.ACTIVE,
    acquisitionValue: 9000,
    accumulatedDepreciation: 4500,
    bookValue: 4500,
    depreciationMethod: "Straight-Line",
    usefulLifeYrs: 5,
    location: "San Francisco HQ - Floor 2",
    assignedUser: "Workplace Experience Team",
    lastInspectionDate: "2026-01-18",
    leaseDocStatus: "N/A",
    governanceFlags: ["15 laptops or accessories inactive > 180 days"],
    daysInactive: 184
  },
  {
    id: "AST-2026-4410",
    name: "CEO Boardroom Custom Oak Table",
    type: AssetType.FURNITURE,
    status: AssetStatus.ACTIVE,
    acquisitionValue: 12000,
    accumulatedDepreciation: 2400,
    bookValue: 9600,
    depreciationMethod: "Straight-Line",
    usefulLifeYrs: 10,
    location: "New York Corporate Suite 400",
    assignedUser: "Executive Admin",
    lastInspectionDate: "2025-11-04",
    leaseDocStatus: "Missing",
    governanceFlags: ["Lease / Purchase Doc Missing"],
    daysInactive: 4
  },
  {
    id: "AST-2026-9055",
    name: "Tesla Model Y - Executive Fleet",
    type: AssetType.VEHICLE,
    status: AssetStatus.ACTIVE,
    acquisitionValue: 52000,
    accumulatedDepreciation: 13000,
    bookValue: 39000,
    depreciationMethod: "Straight-Line",
    usefulLifeYrs: 5,
    location: "Austin Gigafactory Site Hub",
    assignedUser: "Elena Rostova",
    lastInspectionDate: "2026-05-20",
    leaseDocStatus: "Attached",
    governanceFlags: [],
    daysInactive: 1
  },
  {
    id: "AST-2026-3091",
    name: "Rooftop Commercial HVAC Compressor",
    type: AssetType.REAL_ESTATE,
    status: AssetStatus.ACTIVE,
    acquisitionValue: 78000,
    accumulatedDepreciation: 19500,
    bookValue: 58500,
    depreciationMethod: "Straight-Line",
    usefulLifeYrs: 15,
    location: "Denver Distribution Facility (Rooftop)",
    assignedUser: "Facilities Lead",
    lastInspectionDate: "2026-02-14",
    leaseDocStatus: "Attached",
    governanceFlags: [],
    daysInactive: 0
  },
  {
    id: "AST-2026-4890",
    name: "Enterprise Multi-Core Threadripper Workstation",
    type: AssetType.IT_HARDWARE,
    status: AssetStatus.DISPOSED,
    acquisitionValue: 8500,
    accumulatedDepreciation: 8500,
    bookValue: 0,
    depreciationMethod: "Straight-Line",
    usefulLifeYrs: 3,
    location: "SF HQ - Storage Locker B",
    assignedUser: "Unassigned",
    lastInspectionDate: "2026-05-10",
    leaseDocStatus: "N/A",
    governanceFlags: [],
    daysInactive: 240
  }
];

export const INITIAL_AUDITS: AuditCampaign[] = [
  {
    id: "AUD-2026-Q2-IT",
    title: "Q2 2026 IT Hardware Governance Visual Audit",
    leadAuditor: "Marcus Thorne",
    progress: 72,
    startDate: "2026-05-01",
    endDate: "2026-06-30",
    status: AuditStatus.IN_PROGRESS,
    targetCount: 150,
    verifiedCount: 108
  },
  {
    id: "AUD-2026-WEST-FAC",
    title: "Western Regional Facility Asset Assessment",
    leadAuditor: "Jane Caldwell",
    progress: 100,
    startDate: "2026-04-01",
    endDate: "2026-05-15",
    status: AuditStatus.COMPLETED,
    targetCount: 45,
    verifiedCount: 45
  },
  {
    id: "AUD-2026-MFG-LOG",
    title: "Midwest Machinery Integrity & Lease Verification",
    leadAuditor: "Marcus Thorne",
    progress: 15,
    startDate: "2026-06-10",
    endDate: "2026-08-31",
    status: AuditStatus.IN_PROGRESS,
    targetCount: 80,
    verifiedCount: 12
  }
];

export const INITIAL_OBSERVATIONS: Observation[] = [
  {
    id: "OBS-2026-1011",
    assetId: "AST-2026-4410",
    assetName: "CEO Boardroom Custom Oak Table",
    severity: Severity.HIGH,
    description: "Lease/purchase authorization document missing. Vendor claims item was acquired via temporary lease, ledger notes purchase.",
    dateLogged: "2026-05-14",
    status: "Open"
  },
  {
    id: "OBS-2026-1012",
    assetId: "AST-2026-8801",
    assetName: "Ergonomic Mesh Task Chairs (Set of 15)",
    severity: Severity.MEDIUM,
    description: "Asset registry reports 15 chairs, physical inspection located only 12 in the designated SF HQ Floor 2 conference space. Room 204 holds rest unlogged.",
    dateLogged: "2026-05-18",
    status: "Remediated"
  },
  {
    id: "OBS-2026-1013",
    assetId: "AST-2026-4402",
    assetName: "Industrial Precision Laser Cutter v12",
    severity: Severity.CRITICAL,
    description: "Annual OSHA certification expired on April 15. Laser cutter remains active in production stream, creating material high safety compliance risk.",
    dateLogged: "2026-06-05",
    status: "Open"
  }
];

export const INITIAL_APPROVAL_QUEUE: ApprovalItem[] = [
  {
    id: "APR-2026-8012",
    title: "Transfer Autonomous Warehouse Forklift AST-1215 to Denver",
    requester: "Elena Rostova",
    role: "Asset Manager",
    type: "Asset Transfer",
    status: ApprovalStatus.PENDING,
    dateCreated: "2026-06-12",
    details: "Transferring Forklift Unit G from Dallas Storage to Denver Distribution Block 2 due to increased peak logistics queue demands.",
    targetId: "AST-2026-1215"
  },
  {
    id: "APR-2026-3029",
    title: "Register New Asset: Heavy Welding Robot AX-9",
    requester: "Elena Rostova",
    role: "Asset Manager",
    type: "New Asset Entry",
    status: ApprovalStatus.PENDING,
    dateCreated: "2026-06-15",
    details: "Acquisition value $85,000, 10-year Straight-Line depreciation, Detroit Plant Floor 1. Supplier: Fanuc Robotics.",
    targetId: "AST-2026-PENDING- welder"
  },
  {
    id: "APR-2026-9041",
    title: "Dispose Unserviceable Core Workstation AST-4890",
    requester: "Elena Rostova",
    role: "Asset Manager",
    type: "Asset Disposal",
    status: ApprovalStatus.PENDING,
    dateCreated: "2026-06-16",
    details: "Liquidate system for scrap materials. Fully depreciated, Motherboard and processor diagnosed as unrepairable.",
    targetId: "AST-2026-4890"
  },
  {
    id: "APR-2026-4401",
    title: "Depreciation Adjustment: HVAC Compressor AST-3091 Schedule",
    requester: "Jameson Finance",
    role: "Finance Officer",
    type: "Depreciation Adjustment",
    status: ApprovalStatus.PENDING,
    dateCreated: "2026-06-14",
    details: "Adjust useful life from 15 to 12 years due to high wear from environmental heat indexes in Denver.",
    targetId: "AST-2026-3091"
  }
];

export const INITIAL_SYSTEM_LOGS: SystemLog[] = [
  {
    id: "LOG-10024",
    timestamp: "2026-06-17 08:31:02",
    level: "INFO",
    module: "LEDGER",
    message: "Automated calculations run: daily straight-line depreciation calculated for all active assets.",
    actor: "SYSTEM"
  },
  {
    id: "LOG-10023",
    timestamp: "2026-06-17 07:11:15",
    level: "SUCCESS",
    module: "COMPLIANCE",
    message: "Audit Campaign AUD-2026-WEST-FAC successfully submitted and marked as COMPLETED by Jane Caldwell.",
    actor: "Jane Caldwell"
  },
  {
    id: "LOG-10022",
    timestamp: "2026-06-16 18:45:30",
    level: "WARNING",
    module: "INTEGRITY",
    message: "Integrity alert: Asset AST-2026-4410 CEO Boardroom Table has leaseDocStatus: Missing but recorded acquisitionValue is $12,000.",
    actor: "Compliance_Scanner"
  },
  {
    id: "LOG-10021",
    timestamp: "2026-06-16 14:12:00",
    level: "INFO",
    module: "TRANSFER",
    message: "Initiated approval pipeline request APR-2026-8012 for transferring Forklift AST-1215.",
    actor: "Elena Rostova"
  },
  {
    id: "LOG-10020",
    timestamp: "2026-06-15 09:00:22",
    level: "CRITICAL",
    module: "INTEGRITY",
    message: "Device scan: 15 assets flagged with status daysInactive > 180 days. Immediate visual audit recommended.",
    actor: "SYSTEM"
  }
];

export const INITIAL_LOCATIONS: LocationMaster[] = [
  { code: "LOC-SF-01", name: "SF Headquarters (Fremont St)", siteLead: "Marcus Thorne", status: "Active" },
  { code: "LOC-SEA-02", name: "Seattle Data Center - Block D", siteLead: "DevOps Core Team", status: "Active" },
  { code: "LOC-DET-08", name: "Detroit Production Complex v4", siteLead: "Mark Kowalski", status: "Active" },
  { code: "LOC-DEN-12", name: "Denver Logistics Distribution Facility", siteLead: "Sarah Lopez", status: "Active" },
  { code: "LOC-AUST-04", name: "Austin Gigafactory Site Hub", siteLead: "Elon Vance", status: "Active" }
];

export const INITIAL_VENDORS: VendorMaster[] = [
  { id: "VND-8022", name: "Pacific IT Hardware Supplier Corp", category: "IT Hardware", score: 98, status: "Preferred" },
  { id: "VND-4100", name: "Fanuc Robotics Industrial Ltd", category: "Industrial Machinery", score: 95, status: "Preferred" },
  { id: "VND-1929", name: "Stellar Workplace Solutions office supplies", category: "Furniture & Accessories", score: 82, status: "Approved" },
  { id: "VND-0912", name: "Giga Motors Fleet & Commercial Leases", category: "Vehicles", score: 90, status: "Approved" },
  { id: "VND-7011", name: "HVAC Climate Control Associates", category: "Facility & Engineering", score: 88, status: "Under Review" }
];
