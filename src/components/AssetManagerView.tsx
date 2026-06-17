import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Layers,
  Search,
  Filter,
  Plus,
  ArrowRightLeft,
  Trash2,
  FileCheck2,
  ExternalLink,
  MapPin,
  ClipboardCheck,
  CheckCircle2,
  Timer,
  FileText,
  AlertCircle
} from "lucide-react";
import { Asset, AssetType, AssetStatus, ApprovalItem, ApprovalStatus } from "../types";

interface AssetManagerViewProps {
  assets: Asset[];
  onAddAsset: (newAsset: Asset, approvalItem: ApprovalItem) => void;
  onInitiateTransfer: (assetId: string, newLocation: string) => void;
  onInitiateDisposal: (assetId: string) => void;
  onExportData: (type: string) => void;
}

export default function AssetManagerView({
  assets,
  onAddAsset,
  onInitiateTransfer,
  onInitiateDisposal,
  onExportData
}: AssetManagerViewProps) {
  // Filters state
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [leaseFilter, setLeaseFilter] = useState("All");

  // Interaction Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedAssetForTransfer, setSelectedAssetForTransfer] = useState<Asset | null>(null);

  // Form states - Create Asset
  const [newAssetName, setNewAssetName] = useState("");
  const [newAssetType, setNewAssetType] = useState<AssetType>(AssetType.IT_HARDWARE);
  const [newAssetCost, setNewAssetCost] = useState("");
  const [newAssetLocation, setNewAssetLocation] = useState("San Francisco HQ - Floor 4");
  const [newAssetUser, setNewAssetUser] = useState("");
  const [newAssetMethod, setNewAssetMethod] = useState("Straight-Line");
  const [newAssetLife, setNewAssetLife] = useState("5");
  const [newLeaseDoc, setNewLeaseDoc] = useState<"Attached" | "Missing" | "N/A">("Attached");

  // Form states - Asset Transfer location
  const [transferLocation, setTransferLocation] = useState("");

  const handleCreateAssetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssetName || !newAssetCost) return;

    const value = parseFloat(newAssetCost) || 1200;
    const lifeY = parseInt(newAssetLife) || 5;
    const trackingCode = `AST-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const newAs: Asset = {
      id: trackingCode,
      name: newAssetName,
      type: newAssetType,
      status: AssetStatus.PENDING_APPROVAL,
      acquisitionValue: value,
      accumulatedDepreciation: 0,
      bookValue: value,
      depreciationMethod: newAssetMethod,
      usefulLifeYrs: lifeY,
      location: newAssetLocation,
      assignedUser: newAssetUser || "Unassigned",
      lastInspectionDate: new Date().toISOString().split("T")[0],
      leaseDocStatus: newLeaseDoc,
      governanceFlags: newLeaseDoc === "Missing" ? ["Lease / Purchase Doc Missing"] : [],
      daysInactive: 0
    };

    const newApproval: ApprovalItem = {
      id: `APR-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      title: `Register New Asset Space: ${newAssetName}`,
      requester: "Elena Rostova",
      role: "Asset Manager",
      type: "New Asset Entry",
      status: ApprovalStatus.PENDING,
      dateCreated: new Date().toISOString().split("T")[0],
      details: `Acquisition value $${value.toLocaleString()}, ${lifeY}-year ${newAssetMethod} method, assigned to "${newAssetUser || "Unassigned"}" located at "${newAssetLocation}". Lease Status: ${newLeaseDoc}.`,
      targetId: trackingCode
    };

    onAddAsset(newAs, newApproval);
    setShowCreateModal(false);

    // Clear form
    setNewAssetName("");
    setNewAssetCost("");
    setNewAssetUser("");
  };

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssetForTransfer || !transferLocation) return;

    onInitiateTransfer(selectedAssetForTransfer.id, transferLocation);
    setShowTransferModal(false);
    setSelectedAssetForTransfer(null);
    setTransferLocation("");
  };

  // Filter evaluation logic
  const filteredAssets = assets.filter((asset) => {
    const matchesSearch =
      asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.assignedUser.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "All" || asset.type === typeFilter;
    const matchesStatus = statusFilter === "All" || asset.status === statusFilter;
    const matchesLease = leaseFilter === "All" || asset.leaseDocStatus === leaseFilter;

    return matchesSearch && matchesType && matchesStatus && matchesLease;
  });

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-slate-50 antialiased text-slate-800">
      {/* Title Pane */}
      <div id="asset_manager_header_pane" className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-mono tracking-widest text-indigo-600 font-bold bg-indigo-50 px-2.5 py-1 rounded border border-indigo-200">
            Physical Asset Registry
          </span>
          <h1 id="screen_title_asset_manager" className="text-2xl font-bold tracking-tight text-slate-900 mt-2">
            Asset Overview
          </h1>
          <p className="text-sm text-slate-500 mt-0.5 font-sans leading-relaxed">
            Real-time status of enterprise governance assets and lifecycles.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onExportData("Asset-Register")}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 shadow-sm cursor-pointer transition-colors"
          >
            Export Register
          </button>
          <button
            id="register_new_asset_btn"
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-sm hover:shadow transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4 text-white stroke-[2.5]" />
            Register New Asset
          </button>
        </div>
      </div>

      {/* Roster Metrics summary row */}
      <div id="asset_roster_summary_ribbon" className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">Total Directory Roster</span>
          <p className="text-xl font-bold text-slate-900 mt-1">{assets.length} items</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">Active in Field</span>
          <p className="text-xl font-bold text-slate-900 mt-1">
            {assets.filter((a) => a.status === AssetStatus.ACTIVE).length} active
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">Pending Authorizations</span>
          <p className="text-xl font-bold text-slate-900 mt-1">
            {assets.filter((a) => a.status === AssetStatus.PENDING_APPROVAL).length} pending
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">Missing Documentation Gaps</span>
          <p className="text-xl font-bold text-rose-600 mt-1">
            {assets.filter((a) => a.leaseDocStatus === "Missing").length} flagged
          </p>
        </div>
      </div>

      {/* Main spreadsheet database panel */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        {/* Dynamic Toolbar filters block */}
        <div id="asset_catalogue_toolbar" className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-100 gap-3 mb-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              id="asset_register_search"
              type="text"
              placeholder="Search assets name, tracking ID, assignee..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-indigo-500 bg-white"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-xs rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none"
            >
              <option value="All">All Category</option>
              {Object.values(AssetType).map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-xs rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none"
            >
              <option value="All">All Statuses</option>
              {Object.values(AssetStatus).map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            <select
              value={leaseFilter}
              onChange={(e) => setLeaseFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-xs rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none"
            >
              <option value="All">All Lease Status</option>
              <option value="Attached">Attached</option>
              <option value="Missing">Missing</option>
              <option value="N/A">N/A</option>
            </select>
          </div>
        </div>

        {/* Master Directory table frame */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-mono uppercase text-slate-400">
                <th className="py-2.5 font-semibold">Asset Code</th>
                <th className="py-2.5 font-semibold">Category</th>
                <th className="py-2.5 font-semibold">Asset Name / Title</th>
                <th className="py-2.5 font-semibold">Asset Worth</th>
                <th className="py-2.5 font-semibold">Location Master</th>
                <th className="py-2.5 font-semibold">Assignee</th>
                <th className="py-2.5 font-semibold">Lease Doc Status</th>
                <th className="py-2.5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredAssets.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 font-sans">
                    No matching asset records compiled in scope.
                  </td>
                </tr>
              ) : (
                filteredAssets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-slate-50/50">
                    <td className="py-3.5 font-mono text-[11px] text-slate-500 font-semibold">{asset.id}</td>
                    <td className="py-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-800 font-medium">
                        {asset.type}
                      </span>
                    </td>
                    <td className="py-3.5 pr-3 font-semibold text-slate-900">{asset.name}</td>
                    <td className="py-3.5 font-mono font-medium">${asset.acquisitionValue.toLocaleString()}</td>
                    <td className="py-3.5 truncate max-w-[140px]" title={asset.location}>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                        {asset.location}
                      </span>
                    </td>
                    <td className="py-3.5 text-slate-600 font-medium">{asset.assignedUser}</td>
                    <td className="py-3.5">
                      <span className={`inline-flex items-center gap-1 font-semibold text-[11px] ${
                        asset.leaseDocStatus === "Attached"
                          ? "text-emerald-700"
                          : asset.leaseDocStatus === "Missing"
                          ? "text-rose-600"
                          : "text-slate-500"
                      }`}>
                        {asset.leaseDocStatus}
                      </span>
                    </td>
                    <td className="py-3.5 text-right flex items-center justify-end gap-1.5">
                      {asset.status === AssetStatus.ACTIVE ? (
                        <>
                          <button
                            onClick={() => {
                              setSelectedAssetForTransfer(asset);
                              setShowTransferModal(true);
                            }}
                            className="bg-indigo-50 hover:bg-indigo-100 border border-indigo-150 text-indigo-700 font-bold px-2 py-1 rounded text-[10px] transition-all cursor-pointer flex items-center gap-0.5"
                          >
                            <ArrowRightLeft className="h-3 w-3" />
                            Relocate
                          </button>
                          <button
                            onClick={() => onInitiateDisposal(asset.id)}
                            className="bg-rose-50 hover:bg-rose-100 border border-rose-150 text-rose-700 font-bold px-2 py-1 rounded text-[10px] transition-all cursor-pointer flex items-center gap-0.5"
                          >
                            <Trash2 className="h-3 w-3" />
                            Retire
                          </button>
                        </>
                      ) : (
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                          asset.status === AssetStatus.PENDING_APPROVAL
                            ? "bg-amber-100 text-amber-800 animate-pulse"
                            : "bg-slate-150 text-slate-500"
                        }`}>
                          {asset.status}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE NEW ASSET MODAL */}
      <AnimatePresence>
        {showCreateModal && (
          <div id="register_asset_modal_pane" className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 antialiased font-sans">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden"
            >
              <div className="p-5 bg-indigo-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="h-5 w-5 text-indigo-300" />
                  <h3 className="font-bold text-sm tracking-tight">Register Master Capital Asset</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="text-indigo-200 hover:text-white text-xs font-mono font-bold cursor-pointer"
                >
                  [CLOSE]
                </button>
              </div>

              <form onSubmit={handleCreateAssetSubmit} className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-medium uppercase font-semibold text-slate-505 tracking-wider mb-1">
                    Asset Name / Description
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Cisco Catalyst Core Switch Node 2"
                    value={newAssetName}
                    onChange={(e) => setNewAssetName(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium uppercase font-semibold text-slate-505 tracking-wider mb-1">
                      Asset Class Category
                    </label>
                    <select
                      value={newAssetType}
                      onChange={(e) => setNewAssetType(e.target.value as AssetType)}
                      className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white text-slate-900 focus:outline-none"
                    >
                      {Object.values(AssetType).map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium uppercase font-semibold text-slate-505 tracking-wider mb-1">
                      Acquisition Value Cost ($)
                    </label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 15000"
                      value={newAssetCost}
                      onChange={(e) => setNewAssetCost(e.target.value)}
                      className="w-full text-xs border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none bg-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium uppercase font-semibold text-slate-505 tracking-wider mb-1">
                      Physical Location Site
                    </label>
                    <select
                      value={newAssetLocation}
                      onChange={(e) => setNewAssetLocation(e.target.value)}
                      className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white text-slate-900 focus:outline-none"
                    >
                      <option value="San Francisco HQ - Floor 4">San Francisco HQ - Floor 4</option>
                      <option value="Seattle Data Center - Room 4A">Seattle Data Center - Room 4A</option>
                      <option value="Detroit Production Plant - Lab B">Detroit Production Plant - Lab B</option>
                      <option value="Denver Distribution Block 2">Denver Distribution Block 2</option>
                      <option value="New York Corporate Suite 400">New York Corporate Suite 400</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium uppercase font-semibold text-slate-505 tracking-wider mb-1">
                      Custodian / Assigned User
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Elena Rostova"
                      value={newAssetUser}
                      onChange={(e) => setNewAssetUser(e.target.value)}
                      className="w-full text-xs border border-slate-300 rounded-lg p-2.5 text-slate-905 focus:outline-none bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="block text-xs font-medium uppercase font-semibold text-slate-505 tracking-wider mb-1">
                      Depreciation Method
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setNewAssetMethod("Straight-Line")}
                        className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                          newAssetMethod === "Straight-Line"
                            ? "bg-slate-900 text-white border-slate-900"
                            : "bg-white text-slate-600 border-slate-250"
                        }`}
                      >
                        Straight-Line
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewAssetMethod("Double Declining")}
                        className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                          newAssetMethod === "Double Declining"
                            ? "bg-slate-900 text-white border-slate-900"
                            : "bg-white text-slate-600 border-slate-250"
                        }`}
                      >
                        Double-Declining
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium uppercase font-semibold text-slate-505 tracking-wider mb-1">
                      Life (Yrs)
                    </label>
                    <input
                      type="number"
                      required
                      value={newAssetLife}
                      onChange={(e) => setNewAssetLife(e.target.value)}
                      className="w-full text-xs border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none bg-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 tracking-wider mb-1.5">
                    Lease Supporting Documentation
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-xs text-slate-700 font-medium cursor-pointer">
                      <input
                        type="radio"
                        name="lease_doc_opt"
                        checked={newLeaseDoc === "Attached"}
                        onChange={() => setNewLeaseDoc("Attached")}
                        className="text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                      />
                      Attached Agreement
                    </label>
                    <label className="flex items-center gap-2 text-xs text-slate-700 font-medium cursor-pointer">
                      <input
                        type="radio"
                        name="lease_doc_opt"
                        checked={newLeaseDoc === "Missing"}
                        onChange={() => setNewLeaseDoc("Missing")}
                        className="text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                      />
                      Missing (Flag Audit)
                    </label>
                    <label className="flex items-center gap-2 text-xs text-slate-700 font-medium cursor-pointer">
                      <input
                        type="radio"
                        name="lease_doc_opt"
                        checked={newLeaseDoc === "N/A"}
                        onChange={() => setNewLeaseDoc("N/A")}
                        className="text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                      />
                      Not Applicable
                    </label>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 border border-slate-200 text-xs font-semibold rounded-lg text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg"
                  >
                    Submit for Approval
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ASSET TRANSFER MODAL */}
      <AnimatePresence>
        {showTransferModal && selectedAssetForTransfer && (
          <div id="relocate_asset_modal_pane" className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 antialiased font-sans">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden"
            >
              <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
                <h3 className="font-bold text-sm tracking-tight">Initiate Transfer Proposal</h3>
                <button
                  type="button"
                  onClick={() => {
                    setShowTransferModal(false);
                    setSelectedAssetForTransfer(null);
                  }}
                  className="text-slate-400 hover:text-white font-mono text-xs cursor-pointer"
                >
                  X
                </button>
              </div>

              <form onSubmit={handleTransferSubmit} className="p-5 space-y-4">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                  <span className="text-[10px] font-mono text-slate-400">Target Asset Record</span>
                  <p className="font-bold text-slate-900 mt-0.5">{selectedAssetForTransfer.name}</p>
                  <p className="text-[11px] font-mono text-slate-500 mt-1">
                    Current Location Master: {selectedAssetForTransfer.location}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-medium uppercase font-semibold text-slate-505 tracking-wider mb-1.5">
                    Select Relocation Target Site
                  </label>
                  <select
                    value={transferLocation}
                    required
                    onChange={(e) => setTransferLocation(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white text-slate-900 focus:outline-none"
                  >
                    <option value="">-- Choose Relocation Location --</option>
                    <option value="Seattle Data Center - Block D">Seattle Data Center - Block D</option>
                    <option value="Detroit Production Complex v4">Detroit Production Complex v4</option>
                    <option value="Denver Logistics Distribution Facility">Denver Logistics Distribution Facility</option>
                    <option value="Austin Gigafactory Site Hub">Austin Gigafactory Site Hub</option>
                    <option value="SF Headquarters (Fremont St)">SF Headquarters (Fremont St)</option>
                  </select>
                </div>

                <div className="pt-2 border-t border-slate-100 flex justify-end gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setShowTransferModal(false);
                      setSelectedAssetForTransfer(null);
                    }}
                    className="px-4 py-2 border border-slate-200 font-semibold rounded-lg text-slate-500 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-slate-900 text-white font-medium rounded-lg"
                  >
                    Request Physical Transfer
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
