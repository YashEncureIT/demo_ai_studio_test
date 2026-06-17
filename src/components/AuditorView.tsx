import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  FileText,
  AlertTriangle,
  ClipboardList,
  CheckCircle2,
  Plus,
  Search,
  Filter,
  Check,
  Building,
  UserCheck,
  Calendar,
  Layers,
  ArrowUpRight,
  Download
} from "lucide-react";
import {
  Asset,
  AuditCampaign,
  Observation,
  AuditStatus,
  Severity,
  SystemLog
} from "../types";

interface AuditorViewProps {
  assets: Asset[];
  campaigns: AuditCampaign[];
  observations: Observation[];
  logs: SystemLog[];
  onAddCampaign: (newCampaign: AuditCampaign) => void;
  onVerifyAsset: (assetId: string) => void;
  onRemediateObservation: (obsId: string) => void;
  onExportData: (type: string) => void;
}

export default function AuditorView({
  assets,
  campaigns,
  observations,
  logs,
  onAddCampaign,
  onVerifyAsset,
  onRemediateObservation,
  onExportData
}: AuditorViewProps) {
  // UI state
  const [searchTerm, setSearchTerm] = useState("");
  const [severityFilter, setSeverityFilter] = useState<string>("All");
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form state
  const [newTitle, setNewTitle] = useState("");
  const [newLead, setNewLead] = useState("Marcus Thorne");
  const [newTargets, setNewTargets] = useState("50");
  const [newStartDate, setNewStartDate] = useState("2026-06-17");
  const [newEndDate, setNewEndDate] = useState("2026-09-30");

  const handleCreateCampaignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;

    const targetNum = parseInt(newTargets) || 30;
    const newCamp: AuditCampaign = {
      id: `AUD-2026-REG-${Math.floor(100+Math.random()*900)}`,
      title: newTitle,
      leadAuditor: newLead,
      progress: 0,
      startDate: newStartDate,
      endDate: newEndDate,
      status: AuditStatus.IN_PROGRESS,
      targetCount: targetNum,
      verifiedCount: 0
    };

    onAddCampaign(newCamp);
    setShowCreateModal(false);
    
    // Reset form
    setNewTitle("");
    setNewTargets("50");
  };

  // Calculations
  const activeCampaigns = campaigns.filter(c => c.status === AuditStatus.IN_PROGRESS);
  const openObservations = observations.filter(o => o.status === "Open");
  const criticalCount = observations.filter(o => o.severity === Severity.CRITICAL && o.status === "Open").length;
  
  // Search and Filter assets / observations
  const filteredObservations = observations.filter(o => {
    const matchesSearch = o.assetName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          o.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = severityFilter === "All" || o.severity === severityFilter;
    return matchesSearch && matchesSeverity;
  });

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-slate-50 antialiased text-slate-800">
      {/* Title Bar block */}
      <div id="auditor_header_strip" className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-mono tracking-widest text-teal-600 font-bold bg-teal-50 px-2.5 py-1 rounded border border-teal-200">
            Audit Workspace Active
          </span>
          <h1 id="screen_title_auditor" className="text-2xl font-bold tracking-tight text-slate-900 mt-2">
            Auditor Overview
          </h1>
          <p className="text-sm text-slate-500 mt-0.5 font-sans leading-relaxed">
            Real-time governance oversight and operational integrity monitoring.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="export_auditor_csv"
            onClick={() => onExportData("Audits")}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 shadow-sm cursor-pointer transition-colors"
          >
            <Download className="h-3.5 w-3.5 text-slate-500" />
            Export Audit Ledger
          </button>
          <button
            id="create_new_audit_btn"
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-teal-600 hover:bg-teal-500 text-slate-950 font-bold rounded-lg shadow-sm hover:shadow transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4 text-slate-950 stroke-[2.5]" />
            Create New Audit
          </button>
        </div>
      </div>

      {/* Metric Cards Banner Grid */}
      <div id="compliance_metric_grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-semibold uppercase text-slate-400">Total Campaigns</span>
            <div className="h-8 w-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <ClipboardList className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold font-sans text-slate-900 mt-2">{campaigns.length}</p>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <span className="font-semibold text-teal-600">{activeCampaigns.length}</span> In progress
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-semibold uppercase text-slate-400">Governance Compliance Rate</span>
            <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold font-sans text-slate-900 mt-2">95.8%</p>
          <p className="text-xs text-emerald-600 mt-1 font-medium">Standard baseline threshold: &gt;90%</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-semibold uppercase text-slate-400">Critical / Open Obs</span>
            <div className="h-8 w-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold font-sans text-slate-900 mt-2">{openObservations.length}</p>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <span className="font-semibold text-rose-600">{criticalCount}</span> Critical level triggers
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-semibold uppercase text-slate-400">Ledger Verification Assets</span>
            <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Layers className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-bold font-sans text-slate-900 mt-2">
            {assets.filter(a => a.status === "Active").length} / {assets.length}
          </p>
          <p className="text-xs text-slate-500 mt-1">Confirmed intact in visual masters</p>
        </div>
      </div>

      {/* Main Campaign Grid */}
      <h2 className="text-base font-bold text-slate-900 mb-3 uppercase tracking-wider font-mono">Active Verification Campaigns</h2>
      <div id="active_verification_campaigns_grid" className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        {campaigns.map((camp) => (
          <div key={camp.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-mono uppercase bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                  {camp.id}
                </span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                  camp.status === AuditStatus.COMPLETED
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-teal-50 text-teal-700 animate-pulse"
                }`}>
                  {camp.status}
                </span>
              </div>
              <h3 className="font-bold text-sm text-slate-800 line-clamp-2 leading-tight mb-2">
                {camp.title}
              </h3>
              <p className="text-xs text-slate-500 font-sans leading-none mb-4">
                Lead Auditor: <span className="font-semibold text-slate-700">{camp.leadAuditor}</span>
              </p>
            </div>

            <div>
              <div className="flex justify-between items-center text-[11px] text-slate-500 mb-1">
                <span>Verification Scope</span>
                <span className="font-mono font-bold text-slate-800">{camp.verifiedCount} / {camp.targetCount}</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-3">
                <div
                  className="bg-teal-600 h-full rounded-full"
                  style={{ width: `${camp.progress}%` }}
                ></div>
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span>Start: {camp.startDate}</span>
                <span>Due: {camp.endDate}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Compliance / Observations Console Grid */}
      <div id="observations_block_grid" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Compliance Non-conformances Ledger */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-100 gap-4 mb-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider font-mono">
                Systemic Observations & Audits Logs
              </h3>
              <p className="text-xs text-slate-400 font-sans">
                Logged operational discrepancies flagged in database registries.
              </p>
            </div>

            {/* Quick Filters */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter records..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 pr-3 py-1 bg-slate-50 text-xs border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-teal-500 w-44"
                />
              </div>

              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="bg-slate-50 text-xs border border-slate-200 rounded-lg px-2 py-1 text-slate-700 focus:outline-none"
              >
                <option value="All">All Severity</option>
                <option value={Severity.CRITICAL}>Critical</option>
                <option value={Severity.HIGH}>High</option>
                <option value={Severity.MEDIUM}>Medium</option>
                <option value={Severity.LOW}>Low</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-mono uppercase text-slate-400">
                  <th className="py-2.5 font-semibold">Ref Code</th>
                  <th className="py-2.5 font-semibold">Target Asset</th>
                  <th className="py-2.5 font-semibold">Severity</th>
                  <th className="py-2.5 font-semibold">Summary / Issue Description</th>
                  <th className="py-2.5 font-semibold">Status</th>
                  <th className="py-2.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredObservations.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 font-sans">
                      No matching compliance observations are active in ledger scope.
                    </td>
                  </tr>
                ) : (
                  filteredObservations.map((obs) => (
                    <tr key={obs.id} className="hover:bg-slate-50/50">
                      <td className="py-3 font-mono text-[11px] text-slate-500">{obs.id}</td>
                      <td className="py-3">
                        <p className="font-bold text-slate-900 leading-none">{obs.assetName}</p>
                        <span className="text-[10px] font-mono text-slate-400 mt-0.5 block">{obs.assetId}</span>
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          obs.severity === Severity.CRITICAL
                            ? "bg-rose-100 text-rose-800"
                            : obs.severity === Severity.HIGH
                            ? "bg-amber-100 text-amber-800"
                            : obs.severity === Severity.MEDIUM
                            ? "bg-indigo-100 text-indigo-800"
                            : "bg-slate-100 text-slate-800"
                        }`}>
                          {obs.severity}
                        </span>
                      </td>
                      <td className="py-3 max-w-xs pr-4 line-clamp-2 leading-relaxed">
                        {obs.description}
                      </td>
                      <td className="py-3">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
                          obs.status === "Open" ? "text-rose-600" : "text-emerald-600"
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${
                            obs.status === "Open" ? "bg-rose-500" : "bg-emerald-500"
                          }`}></span>
                          {obs.status}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        {obs.status === "Open" ? (
                          <button
                            onClick={() => onRemediateObservation(obs.id)}
                            className="bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-800 font-bold px-2 py-1 rounded text-[10px] transition-colors cursor-pointer"
                          >
                            Acquit Record
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">Validated</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Real-time Asset visual verify queue */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider font-mono border-b border-slate-100 pb-3 mb-3">
              Core Physical Verification
            </h3>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed font-sans">
              Perform rapid compliance verification directly after confirming visual presence or finding and reading lease barcodes.
            </p>

            <div className="space-y-3">
              {assets.filter(a => a.status === "Under Audit").map((asset) => (
                <div key={asset.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-xs text-slate-900 leading-tight">{asset.name}</h4>
                      <p className="text-[10px] font-mono text-slate-500 mt-1">{asset.id} | {asset.location}</p>
                    </div>
                    <span className="text-[9px] font-mono uppercase bg-slate-200 px-1.5 py-0.5 rounded text-slate-700">Audit Active</span>
                  </div>
                  
                  <div className="mt-3 pt-2.5 border-t border-slate-200/50 flex justify-between items-center text-[10.5px]">
                    <span className="text-slate-400">Lease: <strong className="text-slate-600 font-semibold">{asset.leaseDocStatus}</strong></span>
                    <button
                      onClick={() => onVerifyAsset(asset.id)}
                      className="flex items-center gap-1 bg-teal-600 font-bold text-slate-950 px-2 py-1 rounded text-[10px] hover:bg-teal-500 transition-all cursor-pointer"
                    >
                      <Check className="h-3 w-3 text-slate-950 stroke-[3]" />
                      Confirm Present
                    </button>
                  </div>
                </div>
              ))}
              
              {assets.filter(a => a.status === "Under Audit").length === 0 && (
                <div className="py-8 text-center text-slate-400 font-sans text-xs">
                  All active units verified. No assets are currently in "Under Audit" status.
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-mono">AUTOMATED VERIFY GATE</span>
            <div className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
              <span className="text-[10px] text-slate-500 font-mono">SYSTEM SAFE</span>
            </div>
          </div>
        </div>
      </div>

      {/* CREATE NEW AUDIT CAMPAIGN MODAL */}
      <AnimatePresence>
        {showCreateModal && (
          <div id="create_campaign_modal_wrap" className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 antialiased">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden"
            >
              <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ClipboardList className="h-4.5 w-4.5 text-teal-400" />
                  <h3 className="font-bold text-sm tracking-tight">Initiate Audit Campaign</h3>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-slate-400 hover:text-white text-xs font-mono font-bold"
                >
                  ESC
                </button>
              </div>

              <form onSubmit={handleCreateCampaignSubmit} className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-medium uppercase font-semibold text-slate-500 tracking-wider mb-1.5">
                    Campaign Scope or Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Q4 Eastern Logistics Center Verification"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium uppercase font-semibold text-slate-500 tracking-wider mb-1.5">
                      Lead Auditor
                    </label>
                    <input
                      type="text"
                      required
                      value={newLead}
                      onChange={(e) => setNewLead(e.target.value)}
                      className="w-full text-xs border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium uppercase font-semibold text-slate-500 tracking-wider mb-1.5">
                      Target Asset Count
                    </label>
                    <input
                      type="number"
                      required
                      value={newTargets}
                      onChange={(e) => setNewTargets(e.target.value)}
                      className="w-full text-xs border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium uppercase font-semibold text-slate-500 tracking-wider mb-1.5">
                      Start Date
                    </label>
                    <input
                      type="date"
                      required
                      value={newStartDate}
                      onChange={(e) => setNewStartDate(e.target.value)}
                      className="w-full text-xs border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium uppercase font-semibold text-slate-500 tracking-wider mb-1.5">
                      Due Date
                    </label>
                    <input
                      type="date"
                      required
                      value={newEndDate}
                      onChange={(e) => setNewEndDate(e.target.value)}
                      className="w-full text-xs border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 border border-slate-200 text-xs font-semibold rounded-lg text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-lg"
                  >
                    Initiate Campaign
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
