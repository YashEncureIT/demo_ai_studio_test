import React, { useState } from "react";
import {
  ShieldAlert,
  MapPin,
  Users,
  Layers,
  Check,
  X,
  FileCheck2,
  ListFilter,
  Terminal,
  ChevronRight,
  TrendingDown,
  Building,
  Award
} from "lucide-react";
import {
  Asset,
  ApprovalItem,
  ApprovalStatus,
  SystemLog,
  LocationMaster,
  VendorMaster
} from "../types";

interface AdminViewProps {
  assets: Asset[];
  approvals: ApprovalItem[];
  logs: SystemLog[];
  locations: LocationMaster[];
  vendors: VendorMaster[];
  onApproveAdmin: (id: string, status: ApprovalStatus) => void;
  onToggleLocationStatus?: (code: string) => void;
}

export default function AdminView({
  assets,
  approvals,
  logs,
  locations,
  vendors,
  onApproveAdmin,
  onToggleLocationStatus
}: AdminViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<"pipeline" | "master-data" | "system-logs">("pipeline");
  const [logFilterLevel, setLogFilterLevel] = useState<string>("All");
  const [logSearch, setLogSearch] = useState("");

  // Filter logs
  const filteredLogs = logs.filter(l => {
    const matchesLevel = logFilterLevel === "All" || l.level === logFilterLevel;
    const matchesSearch = l.message.toLowerCase().includes(logSearch.toLowerCase()) ||
                          l.module.toLowerCase().includes(logSearch.toLowerCase()) ||
                          l.actor.toLowerCase().includes(logSearch.toLowerCase());
    return matchesLevel && matchesSearch;
  });

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-slate-50 text-slate-800 antialiased font-sans">
      {/* Dynamic Title Strip */}
      <div id="admin_header_pane" className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-mono tracking-widest text-slate-800 font-bold bg-slate-100 px-2.5 py-1 rounded border border-slate-300">
            Platform Administration
          </span>
          <h1 id="screen_title_admin" className="text-2xl font-bold tracking-tight text-slate-900 mt-2">
            Governance Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-0.5 leading-relaxed">
            Monitoring Master Data Integrity and Approval Pipelines.
          </p>
        </div>

        {/* Admin Navigation Controllers */}
        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
          <button
            id="subtab_approval_pipeline"
            onClick={() => setActiveSubTab("pipeline")}
            className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              activeSubTab === "pipeline" ? "bg-slate-900 text-white shadow-sm" : "text-slate-650 hover:text-slate-900"
            }`}
          >
            Approvals Pipeline ({approvals.filter(a => a.status === ApprovalStatus.PENDING).length})
          </button>
          <button
            id="subtab_master_data"
            onClick={() => setActiveSubTab("master-data")}
            className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              activeSubTab === "master-data" ? "bg-slate-900 text-white shadow-sm" : "text-slate-650 hover:text-slate-900"
            }`}
          >
            Master Data
          </button>
          <button
            id="subtab_system_logs"
            onClick={() => setActiveSubTab("system-logs")}
            className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              activeSubTab === "system-logs" ? "bg-slate-900 text-white shadow-sm" : "text-slate-650 hover:text-slate-900"
            }`}
          >
            Telemetry System Logs
          </button>
        </div>
      </div>

      {/* VIEW: APPROVALS PIPELINE TABLE SECTION */}
      {activeSubTab === "pipeline" && (
        <div id="admin_pipeline_workspace" className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider font-mono border-b border-slate-100 pb-3 mb-4">
              Pending Authorization Pipelines
            </h3>

            <div className="grid grid-cols-1 gap-4">
              {approvals.map((appr) => (
                <div key={appr.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col md:flex-row md:items-start justify-between gap-4 hover:shadow-sm transition-all">
                  <div className="space-y-2 max-w-2xl">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono uppercase bg-slate-200 text-slate-700 px-2 py-0.5 rounded">
                        {appr.id}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">|</span>
                      <span className="text-xs font-semibold text-indigo-700 font-medium">
                        {appr.type}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">|</span>
                      <span className="text-xs font-sans text-slate-500 font-normal">
                        Requested by {appr.requester} ({appr.role})
                      </span>
                    </div>

                    <h4 className="font-bold text-base text-slate-900 leading-snug">{appr.title}</h4>
                    <p className="text-xs text-slate-600 bg-white p-3 rounded-lg border border-slate-150 leading-relaxed font-normal">
                      {appr.details}
                    </p>
                  </div>

                  {appr.status === ApprovalStatus.PENDING ? (
                    <div className="flex items-center gap-2 self-end md:self-start">
                      <button
                        onClick={() => onApproveAdmin(appr.id, ApprovalStatus.REJECTED)}
                        className="flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 text-xs font-bold font-sans rounded-lg text-rose-700 bg-white hover:bg-rose-50 transition-colors cursor-pointer"
                      >
                        <X className="h-4 w-4" />
                        Refuse Change
                      </button>
                      <button
                        onClick={() => onApproveAdmin(appr.id, ApprovalStatus.APPROVED)}
                        className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold font-sans rounded-lg transition-colors cursor-pointer"
                      >
                        <Check className="h-4 w-4 text-emerald-400" />
                        Execute Change
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-200/50 rounded-lg border border-slate-200">
                      <Check className="h-4 w-4 text-emerald-600" />
                      <span className="text-xs font-bold text-slate-650">{appr.status}</span>
                    </div>
                  )}
                </div>
              ))}

              {approvals.length === 0 && (
                <div className="py-12 text-center text-slate-400 font-sans text-xs">
                  All active pipelines authorized. Compliance queue is silent.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* VIEW: MASTER DATA REGISTRIES (LOCATIONS & VENDORS) */}
      {activeSubTab === "master-data" && (
        <div id="admin_master_data_workspace" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Location Masters */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="border-b border-slate-100 pb-3 mb-4 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <MapPin className="h-4.5 w-4.5 text-slate-500" />
                  Registered Site Locations Master
                </h3>
                <p className="text-[11px] text-slate-405">Valid enterprise locations in active directory</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] font-mono uppercase text-slate-400">
                    <th className="py-2.5 font-semibold">LOC CODE</th>
                    <th className="py-2.5 font-semibold">Location Name</th>
                    <th className="py-2.5 font-semibold">Authorized Lead</th>
                    <th className="py-2.5 font-semibold text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700 font-sans">
                  {locations.map((loc) => (
                    <tr key={loc.code} className="hover:bg-slate-50/50">
                      <td className="py-3 font-mono text-[11px] text-slate-450 font-semibold">{loc.code}</td>
                      <td className="py-3 font-bold text-slate-900">{loc.name}</td>
                      <td className="py-3 text-slate-600">{loc.siteLead}</td>
                      <td className="py-3 text-right">
                        <button
                          type="button"
                          onClick={() => onToggleLocationStatus && onToggleLocationStatus(loc.code)}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono transition-colors cursor-pointer ${
                            loc.status === "Active"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-slate-150 text-slate-500"
                          }`}
                        >
                          {loc.status}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Vendor Masters */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Building className="h-4.5 w-4.5 text-slate-500" />
                Procurement Vendor Masters
              </h3>
              <p className="text-[11px] text-slate-405">Approved third-party physical supply brokers</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] font-mono uppercase text-slate-400">
                    <th className="py-2.5 font-semibold">Broker ID</th>
                    <th className="py-2.5 font-semibold">Supplier Name</th>
                    <th className="py-2.5 font-semibold">Category Scope</th>
                    <th className="py-2.5 font-semibold">Integrity Score</th>
                    <th className="py-2.5 font-semibold text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700 font-sans">
                  {vendors.map((vend) => (
                    <tr key={vend.id} className="hover:bg-slate-50/50">
                      <td className="py-3 font-mono text-[11px] text-slate-450 font-semibold">{vend.id}</td>
                      <td className="py-3 font-bold text-slate-900">{vend.name}</td>
                      <td className="py-3 text-slate-600">{vend.category}</td>
                      <td className="py-3 font-mono font-bold text-slate-700 flex items-center gap-1">
                        <Award className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                        {vend.score}/100
                      </td>
                      <td className="py-3 text-right">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          vend.status === "Preferred"
                            ? "bg-teal-50 text-teal-800"
                            : "bg-slate-100 text-slate-700"
                        }`}>
                          {vend.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW: SYSTEM TELEMETRY AUDIT LOGS INTERACTIVE TERMINAL */}
      {activeSubTab === "system-logs" && (
        <div id="admin_system_logs_workspace" className="bg-slate-950 text-slate-300 rounded-xl p-5 font-mono shadow-2xl border border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-4 mb-4 gap-4">
            <div className="flex items-center gap-2">
              <Terminal className="h-5 w-5 text-teal-400" />
              <div>
                <h3 className="text-sm font-bold text-teal-400">AAMS SECURE AUDIT CONSOLE</h3>
                <p className="text-[10px] text-slate-500">Live system events track file integrity</p>
              </div>
            </div>

            {/* Terminal Actions */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Filter grep messages..."
                  value={logSearch}
                  onChange={(e) => setLogSearch(e.target.value)}
                  className="bg-slate-900 border border-slate-800 text-xs rounded px-2.5 py-1 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-teal-400 w-44"
                />
              </div>

              <select
                value={logFilterLevel}
                onChange={(e) => setLogFilterLevel(e.target.value)}
                className="bg-slate-900 border border-slate-800 text-xs rounded px-2 py-1 text-slate-205 focus:outline-none"
              >
                <option value="All">All Signals</option>
                <option value="INFO">INFO</option>
                <option value="SUCCESS">SUCCESS</option>
                <option value="WARNING">WARNING</option>
                <option value="CRITICAL">CRITICAL</option>
              </select>
            </div>
          </div>

          {/* Interactive Logs Shell representation */}
          <div className="space-y-1.5 max-h-[440px] overflow-y-auto text-xs scrollbar-thin select-text">
            {filteredLogs.map((log) => (
              <div key={log.id} className="hover:bg-slate-900/60 p-1 rounded flex items-start gap-3 transition-colors break-all leading-relaxed">
                <span className="text-slate-600 shrink-0 select-none text-[10px]">[{log.timestamp}]</span>
                <span className={`shrink-0 select-none text-[10px] font-bold px-1.5 rounded ${
                  log.level === "INFO"
                    ? "text-blue-400 bg-blue-950/40"
                    : log.level === "SUCCESS"
                    ? "text-emerald-400 bg-emerald-950/40"
                    : log.level === "WARNING"
                    ? "text-amber-400 bg-amber-950/40"
                    : "text-rose-400 bg-rose-950/40 animate-pulse"
                }`}>
                  {log.level}
                </span>
                <span className="text-teal-500 shrink-0 font-semibold text-[10px] select-none">[{log.module}]</span>
                <span className="text-slate-300">
                  {log.message} <strong className="text-slate-500 font-normal">({log.actor})</strong>
                </span>
              </div>
            ))}

            {filteredLogs.length === 0 && (
              <div className="text-slate-600 text-center py-6">
                No telemetry sequences detected matching criteria. Check filters.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
