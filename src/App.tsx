import React, { useState } from "react";
import { motion } from "motion/react";
import {
  Shield,
  LogOut,
  Sliders,
  Bell,
  Settings,
  HelpCircle,
  Database,
  Building,
  User,
  Activity,
  Layers,
  ChevronDown,
  Menu,
  ChevronRight,
  ClipboardList,
  AlertTriangle,
  Receipt,
  FileCheck2,
  FolderTree
} from "lucide-react";

import {
  INITIAL_ASSETS,
  INITIAL_APPROVAL_QUEUE,
  INITIAL_AUDITS,
  INITIAL_LOCATIONS,
  INITIAL_OBSERVATIONS,
  INITIAL_SYSTEM_LOGS,
  INITIAL_VENDORS
} from "./data";

import {
  Asset,
  AssetStatus,
  AuditCampaign,
  Observation,
  ApprovalItem,
  ApprovalStatus,
  SystemLog,
  UserSession,
  UserRole
} from "./types";

import AuthScreens from "./components/AuthScreens";
import AIWidget from "./components/AIWidget";
import AuditorView from "./components/AuditorView";
import FinanceView from "./components/FinanceView";
import AssetManagerView from "./components/AssetManagerView";
import AdminView from "./components/AdminView";

export default function App() {
  // Session State
  const [session, setSession] = useState<UserSession | null>(null);

  // Core registries database states (Unified Shared State)
  const [assets, setAssets] = useState<Asset[]>(INITIAL_ASSETS);
  const [campaigns, setCampaigns] = useState<AuditCampaign[]>(INITIAL_AUDITS);
  const [observations, setObservations] = useState<Observation[]>(INITIAL_OBSERVATIONS);
  const [approvals, setApprovals] = useState<ApprovalItem[]>(INITIAL_APPROVAL_QUEUE);
  const [logs, setLogs] = useState<SystemLog[]>(INITIAL_SYSTEM_LOGS);
  const [locations, setLocations] = useState(INITIAL_LOCATIONS);
  const [vendors, setVendors] = useState(INITIAL_VENDORS);

  // Navigation controls
  const [activeMenuKey, setActiveMenuKey] = useState<string>("Audit Management");
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  // Event logger helper
  const addSystemLog = (module: string, message: string, actor: string, level: "INFO" | "SUCCESS" | "WARNING" | "CRITICAL") => {
    const timestamp = new Date().toISOString().replace("T", " ").substring(0, 19);
    const newLog: SystemLog = {
      id: `LOG-${Math.floor(10000 + Math.random() * 90000)}`,
      timestamp,
      level,
      module,
      message,
      actor
    };
    setLogs(prev => [newLog, ...prev]);
  };

  // Shared Action Handlers
  const handleLogin = (newSession: UserSession) => {
    setSession(newSession);
    addSystemLog("AUTH", `${newSession.name} successfully authenticated as ${newSession.role} via secure registry gateway.`, newSession.name, "INFO");
  };

  const handleLogout = () => {
    if (session) {
      addSystemLog("AUTH", `${session.name} signed out and invalidated current preview locks.`, session.name, "INFO");
    }
    setSession(null);
  };

  const handleAddCampaign = (newCamp: AuditCampaign) => {
    setCampaigns(prev => [newCamp, ...prev]);
    addSystemLog("AUDIT", `Created new audit campaign: "${newCamp.title}". Scope: ${newCamp.targetCount} targets.`, session?.name || "Auditor", "SUCCESS");
  };

  const handleVerifyAsset = (assetId: string) => {
    setAssets(prev =>
      prev.map(a => (a.id === assetId ? { ...a, status: AssetStatus.ACTIVE, lastInspectionDate: new Date().toISOString().split("T")[0] } : a))
    );

    // If there is an associated campaign, increase its verified count and progress
    setCampaigns(prev =>
      prev.map(c => {
        if (c.status === "In Progress") {
          const nextCount = c.verifiedCount + 1;
          const nextProgress = Math.min(100, Math.floor((nextCount / c.targetCount) * 100));
          return { ...c, verifiedCount: nextCount, progress: nextProgress };
        }
        return c;
      })
    );

    addSystemLog("COMPLIANCE", `Physical asset confirmed intact: ${assetId}. Ledger status flagged: ACTIVE.`, session?.name || "Auditor", "SUCCESS");
  };

  const handleRemediateObservation = (obsId: string) => {
    setObservations(prev =>
      prev.map(o => (o.id === obsId ? { ...o, status: "Remediated" } : o))
    );
    addSystemLog("COMPLIANCE", `Remediated and acquitted observation protocol: ${obsId}`, session?.name || "Auditor", "SUCCESS");
  };

  const handleAddAsset = (newAs: Asset, newApproval: ApprovalItem) => {
    setAssets(prev => [newAs, ...prev]);
    setApprovals(prev => [newApproval, ...prev]);
    addSystemLog("INVENTORY", `Registered asset "${newAs.name}" with PENDING_APPROVAL status. Added authorization pipeline "${newApproval.id}".`, session?.name || "AssetManager", "INFO");
  };

  const handleInitiateTransfer = (assetId: string, newLocation: string) => {
    const asset = assets.find(a => a.id === assetId);
    if (!asset) return;

    // Put asset into Under Audit while awaiting transfer approval
    setAssets(prev =>
      prev.map(a => (a.id === assetId ? { ...a, status: AssetStatus.UNDER_AUDIT } : a))
    );

    const aprId = `APR-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newApproval: ApprovalItem = {
      id: aprId,
      title: `Transfer Asset relocation: ${asset.name}`,
      requester: session?.name || "Elena Rostova",
      role: "Asset Manager",
      type: "Asset Transfer",
      status: ApprovalStatus.PENDING,
      dateCreated: new Date().toISOString().split("T")[0],
      details: `Transfer ${asset.id} from "${asset.location}" to "${newLocation}".`,
      targetId: assetId
    };

    setApprovals(prev => [newApproval, ...prev]);
    addSystemLog("TRANSFER", `Asset transfer proposed for ${assetId} to "${newLocation}". Pipeline APR: ${aprId}`, session?.name || "AssetManager", "INFO");
  };

  const handleInitiateDisposal = (assetId: string) => {
    const asset = assets.find(a => a.id === assetId);
    if (!asset) return;

    // Tag asset as Under Audit
    setAssets(prev =>
      prev.map(a => (a.id === assetId ? { ...a, status: AssetStatus.UNDER_AUDIT } : a))
    );

    const aprId = `APR-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newApproval: ApprovalItem = {
      id: aprId,
      title: `Dispose/Scrap Asset asset: ${asset.name}`,
      requester: session?.name || "Elena Rostova",
      role: "Asset Manager",
      type: "Asset Disposal",
      status: ApprovalStatus.PENDING,
      dateCreated: new Date().toISOString().split("T")[0],
      details: `Scrap asset ${asset.id} (Original Cost: $${asset.acquisitionValue}). Asset reported fully depreciated or physically unserviceable.`,
      targetId: assetId
    };

    setApprovals(prev => [newApproval, ...prev]);
    addSystemLog("DISPOSAL", `Retirement/scrap disposal proposed for asset ${assetId}. Pipeline: ${aprId}`, session?.name || "AssetManager", "INFO");
  };

  const handleApprovePipelineItem = (id: string, nextStatus: ApprovalStatus) => {
    const item = approvals.find(ap => ap.id === id);
    if (!item) return;

    // Update approval item status
    setApprovals(prev =>
      prev.map(ap => (ap.id === id ? { ...ap, status: nextStatus } : ap))
    );

    if (nextStatus === ApprovalStatus.APPROVED) {
      // 1. New Asset Entry
      if (item.type === "New Asset Entry") {
        setAssets(prev =>
          prev.map(a => (a.id === item.targetId ? { ...a, status: AssetStatus.ACTIVE } : a))
        );
        addSystemLog("INTEGRITY", `Authorized core Entry for ${item.targetId}. Status switched to ACTIVE active registry.`, session?.name || "Administrator", "SUCCESS");
      }

      // 2. Asset Transfer
      if (item.type === "Asset Transfer") {
        // Extract new location from details "to \"Denver Logistics...\""
        const detailsStr = item.details || "";
        const match = detailsStr.match(/to\s+"([^"]+)"/);
        const destination = match ? match[1] : "Authorized Relocation Depot";

        setAssets(prev =>
          prev.map(a => (a.id === item.targetId ? { ...a, status: AssetStatus.ACTIVE, location: destination } : a))
        );
        addSystemLog("TRANSFER", `Authorized core relocation for ${item.targetId} to destination: "${destination}".`, session?.name || "Administrator", "SUCCESS");
      }

      // 3. Asset Disposal
      if (item.type === "Asset Disposal") {
        setAssets(prev =>
          prev.map(a => (a.id === item.targetId ? { ...a, status: AssetStatus.DISPOSED, bookValue: 0, accumulatedDepreciation: a.acquisitionValue } : a))
        );
        addSystemLog("DISPOSAL", `Authorized absolute retirement of unserviceable node ${item.targetId}. Fully depreciated in book database.`, session?.name || "Administrator", "SUCCESS");
      }

      // 4. Depreciation adjustment
      if (item.type === "Depreciation Adjustment") {
        setAssets(prev =>
          prev.map(a => {
            if (a.id === item.targetId) {
              const matchedLife = item.details.match(/from\s+\d+\s+to\s+(\d+)/);
              const nextLife = matchedLife ? parseInt(matchedLife[1]) : a.usefulLifeYrs;
              return { ...a, usefulLifeYrs: nextLife, status: AssetStatus.ACTIVE };
            }
            return a;
          })
        );
        addSystemLog("TREASURY", `Authorized depreciation useful-life schedule adjustment on ${item.targetId}.`, session?.name || "Administrator", "SUCCESS");
      }
    } else {
      // Rejected path: restore target asset back to ACTIVE if it was in verification block
      if (item.targetId) {
        setAssets(prev =>
          prev.map(a => (a.id === item.targetId && a.status === AssetStatus.UNDER_AUDIT ? { ...a, status: AssetStatus.ACTIVE } : a))
        );
      }
      addSystemLog("INTEGRITY", `Declined proposal pipeline task ${id}. Restored baseline assets constraints.`, session?.name || "Administrator", "WARNING");
    }
  };

  const handleModifyDepreciationSchedule = (assetId: string, nextLifeYears: number, nextMethod: string) => {
    // Propose depreciation adjustment adding into pipeline approval
    const asset = assets.find(a => a.id === assetId);
    if (!asset) return;

    const aprId = `APR-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newApproval: ApprovalItem = {
      id: aprId,
      title: `Depreciation Adjustment: ${asset.name}`,
      requester: session?.name || "Jameson Finance",
      role: "Finance Officer",
      type: "Depreciation Adjustment",
      status: ApprovalStatus.PENDING,
      dateCreated: new Date().toISOString().split("T")[0],
      details: `Modify financial parameters for ${asset.id}. Alter useful life expectation from ${asset.usefulLifeYrs} years to ${nextLifeYears} years using protocol "${nextMethod}".`,
      targetId: assetId
    };

    setApprovals(prev => [newApproval, ...prev]);
    addSystemLog("TREASURY", `Financial depreciation alteration submitted for ${assetId}. Pipeline checklist: ${aprId}`, session?.name || "Finance", "INFO");
  };

  const handleToggleLocationStatus = (code: string) => {
    setLocations(prev =>
      prev.map(l => (l.code === code ? { ...l, status: l.status === "Active" ? "Inactive" : "Active" } : l))
    );
    addSystemLog("MASTERDATA", `Toggled directory location site master status for "${code}"`, session?.name || "Administrator", "INFO");
  };

  // Mock Export CSV Utility
  const handleExportDataToCSV = (type: string) => {
    // Formulate basic CSV mock content
    let csvContent = "data:text/csv;charset=utf-8,";
    if (type.includes("Asset")) {
      csvContent += "Asset ID,Name,Class,Acquisition Cost,Remaining Book Value,Location,Custodian\n";
      assets.forEach(a => {
        csvContent += `"${a.id}","${a.name}","${a.type}",${a.acquisitionValue},${a.bookValue},"${a.location}","${a.assignedUser}"\n`;
      });
    } else {
      csvContent += "Campaign ID,Title,Lead Auditor,Progress,Status,Target Scope\n";
      campaigns.forEach(c => {
        csvContent += `"${c.id}","${c.title}","${c.leadAuditor}",${c.progress}%,"${c.status}",${c.targetCount}\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `AAMS_Governance_${type}_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addSystemLog("EXPORT", `Secured audit ledger data successfully compiled and exported to CSV file for context: "${type}".`, session?.name || "System", "SUCCESS");
  };

  // Active workspace picker based on dynamic session role switch helper
  const handleRoleSwitch = (nextRole: UserRole) => {
    if (!session) return;
    
    // Choose presets
    let avatar = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80";
    let realName = "Marcus Thorne";
    
    if (nextRole === "Finance") {
      avatar = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80";
      realName = "Jameson Finance";
    } else if (nextRole === "AssetManager") {
      avatar = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80";
      realName = "Elena Rostova";
    } else if (nextRole === "Admin") {
      avatar = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80";
      realName = "Admin User";
    }

    setSession({
      ...session,
      name: realName,
      role: nextRole,
      avatar
    });
    
    // Auto reset selection context
    if (nextRole === "Auditor") setActiveMenuKey("Audit Management");
    else if (nextRole === "Finance") setActiveMenuKey("Approval Queue");
    else if (nextRole === "AssetManager") setActiveMenuKey("Asset Register");
    else setActiveMenuKey("Approval Queue");

    addSystemLog("WORKSPACE", `Simulated role changed to: ${nextRole}. Loading appropriate dashboard views...`, realName, "INFO");
  };

  // Switch workspace headers
  const getWorkspaceTitle = () => {
    if (!session) return "";
    switch (session.role) {
      case "Auditor":
        return "Auditor Dashboard / Governance Core";
      case "Finance":
        return "Financial Ledger & Treasury";
      case "AssetManager":
        return "Asset Manager Console";
      case "Admin":
        return "Master Data Administration";
    }
  };

  // Determine dynamic sidebars links depending on role
  const getSidebarLinks = () => {
    if (!session) return [];
    if (session.role === "Auditor") {
      return [
        { name: "Audit Management", icon: ClipboardList },
        { name: "Compliance", icon: Shield },
        { name: "Observations", icon: AlertTriangle },
        { name: "Approval Queue", icon: FolderTree }
      ];
    } else if (session.role === "Finance") {
      return [
        { name: "Approval Queue", icon: FileCheck2 },
        { name: "Asset Valuation", icon: Receipt },
        { name: "Depreciation Tool", icon: Sliders }
      ];
    } else if (session.role === "AssetManager") {
      return [
        { name: "Asset Register", icon: Layers },
        { name: "Approval Tracker", icon: FileCheck2 }
      ];
    } else {
      // Administrator
      return [
        { name: "Approval Queue", icon: FileCheck2 },
        { name: "Master Registries", icon: Database },
        { name: "System Logs & Telemetry", icon: Activity }
      ];
    }
  };

  // ----------------------------------------------------
  // GUEST GUARD: Render Access Gate if not authenticated
  if (!session) {
    return <AuthScreens onLoginSuccess={handleLogin} />;
  }

  const sidebarLinks = getSidebarLinks();

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased text-slate-900 select-none">
      {/* 1. MASTER HIGH STATUS APP BAR */}
      <header id="master_top_navigation_bar" className="h-16 bg-slate-900 text-white flex items-center justify-between px-6 border-b border-slate-800 shrink-0 z-40 relative">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded bg-teal-500 flex items-center justify-center">
              <Shield className="h-4 w-4 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <span className="font-bold tracking-tight text-sm text-white">AAMS Enterprise</span>
              <span className="text-[10px] text-teal-400 font-mono block leading-none">GOVERNANCE MASTER</span>
            </div>
          </div>

          <div className="hidden lg:block h-6 w-[1px] bg-slate-800"></div>

          {/* Quick switch environment widget */}
          <div className="hidden lg:flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded border border-slate-800/80">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
            <span className="text-[10px] font-mono text-slate-400 uppercase">Gateway Node live</span>
          </div>
        </div>

        {/* Dynamic switcher selector bar */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="hidden md:inline text-xs font-mono text-slate-400">Test Portal Role:</span>
            <div className="flex p-0.5 bg-slate-950 border border-slate-800 rounded-lg gap-0.5">
              {(["Auditor", "Finance", "AssetManager", "Admin"] as UserRole[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => handleRoleSwitch(r)}
                  className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                    session.role === r
                      ? "bg-slate-800 text-teal-400 shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {r === "AssetManager" ? "Asset Mgr" : r}
                </button>
              ))}
            </div>
          </div>

          <div className="h-6 w-[1px] bg-slate-800"></div>

          {/* Profile Controls block */}
          <div className="relative">
            <button
              id="profile_dropdown_trigger"
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="flex items-center gap-2.5 p-1 hover:bg-slate-800 rounded-lg transition-colors text-left cursor-pointer"
            >
              <img
                src={session.avatar}
                alt={session.name}
                className="h-8 w-8 rounded-full object-cover border border-slate-700 shrink-0"
              />
              <div className="hidden sm:block leading-none pr-1">
                <p className="font-bold text-xs text-slate-100">{session.name}</p>
                <span className="text-[10px] font-mono text-teal-400 uppercase tracking-widest">{session.role}</span>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-slate-450 hidden sm:block shrink-0" />
            </button>

            {/* User Profile dropdown panel */}
            {isProfileMenuOpen && (
              <div id="profile_dropdown_panel" className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-2 text-slate-200 z-50">
                <div className="p-3 border-b border-slate-800 text-xs">
                  <p className="font-bold text-slate-100">{session.name}</p>
                  <p className="text-[10px] text-slate-450 mt-0.5 truncate">{session.email}</p>
                </div>
                
                <div className="p-1">
                  <div className="p-2 text-[10px] font-mono uppercase text-slate-500">
                    Directory Scope
                  </div>
                  <button
                    type="button"
                    className="w-full text-left px-3 py-1.5 text-xs rounded hover:bg-slate-800 flex items-center gap-2 "
                  >
                    <Settings className="h-3.5 w-3.5 text-slate-400" />
                    Master Configurations
                  </button>
                  <button
                    id="logout_btn"
                    type="button"
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-1.5 text-xs text-rose-400 rounded hover:bg-slate-800 flex items-center gap-2"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Sign Out Gate
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 2. DYNAMIC WORKSPACE BODY CONTAINER */}
      <div id="app_body_container" className="flex-1 flex overflow-hidden">
        {/* Dynamic Sidebar Nav rail */}
        <aside id="workspace_sidebar_navigation" className="w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col justify-between shrink-0 hidden md:flex font-sans">
          <div className="p-4 space-y-6">
            <div className="px-3">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">Governance Workspace</span>
              <p className="text-sm font-bold text-slate-100 mt-1 truncate">{getWorkspaceTitle()}</p>
            </div>

            {/* Sidebar core links map */}
            <nav id="sidebar_links_menu" className="space-y-1">
              {sidebarLinks.map((link) => {
                const Icon = link.icon;
                const isSelected = activeMenuKey === link.name;
                return (
                  <button
                    key={link.name}
                    type="button"
                    onClick={() => setActiveMenuKey(link.name)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                      isSelected
                        ? "bg-teal-500 text-slate-950 font-bold"
                        : "text-slate-400 hover:text-white hover:bg-slate-800"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`h-4 w-4 ${isSelected ? "text-slate-950" : "text-slate-450"}`} />
                      <span>{link.name}</span>
                    </div>
                    {isSelected && <ChevronRight className="h-3.5 w-3.5 text-slate-950 stroke-[3]" />}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Persistent Sidebar Footer */}
          <div className="p-4 border-t border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 bg-slate-950 px-2.5 py-1.5 rounded">
              <span>LEDGER COMPLIANT</span>
              <div className="h-2 w-2 rounded-full bg-teal-400 animate-pulse"></div>
            </div>
            
            <div className="text-[10px] font-sans text-slate-600 text-center leading-relaxed">
              AAMS Governance Console — Secure
            </div>
          </div>
        </aside>

        {/* Dynamic Center Workstation View Router */}
        <main id="primary_view_pane" className="flex-1 flex flex-col overflow-hidden bg-slate-50">
          {/* AUDITOR ACTIVE VIEWS */}
          {session.role === "Auditor" && (
            <AuditorView
              assets={assets}
              campaigns={campaigns}
              observations={observations}
              logs={logs}
              onAddCampaign={handleAddCampaign}
              onVerifyAsset={handleVerifyAsset}
              onRemediateObservation={handleRemediateObservation}
              onExportData={handleExportDataToCSV}
            />
          )}

          {/* FINANCE ACTIVE VIEWS */}
          {session.role === "Finance" && (
            <FinanceView
              assets={assets}
              approvals={approvals}
              onApproveFinance={handleApprovePipelineItem}
              onModifyDepreciation={handleModifyDepreciationSchedule}
              onExportData={handleExportDataToCSV}
            />
          )}

          {/* ASSET MANAGER ACTIVE VIEWS */}
          {session.role === "AssetManager" && (
            <AssetManagerView
              assets={assets}
              onAddAsset={handleAddAsset}
              onInitiateTransfer={handleInitiateTransfer}
              onInitiateDisposal={handleInitiateDisposal}
              onExportData={handleExportDataToCSV}
            />
          )}

          {/* ADMINISTRATOR ACTIVE VIEWS */}
          {session.role === "Admin" && (
            <AdminView
              assets={assets}
              approvals={approvals}
              logs={logs}
              locations={locations}
              vendors={vendors}
              onApproveAdmin={handleApprovePipelineItem}
              onToggleLocationStatus={handleToggleLocationStatus}
            />
          )}
        </main>
      </div>

      {/* 3. COHESIVE FLOATING AI WORKSPACE COMPANION */}
      <AIWidget
        assets={assets}
        role={session.role}
        onRemediateAsset={handleVerifyAsset}
      />
    </div>
  );
}
