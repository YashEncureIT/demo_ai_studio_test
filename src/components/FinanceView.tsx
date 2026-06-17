import React, { useState } from "react";
import {
  TrendingUp,
  Percent,
  Coins,
  Search,
  Check,
  X,
  FileCheck2,
  Calendar,
  Calculator,
  Download,
  Flame,
  Scale
} from "lucide-react";
import { Asset, ApprovalItem, ApprovalStatus, AssetType } from "../types";

interface FinanceViewProps {
  assets: Asset[];
  approvals: ApprovalItem[];
  onApproveFinance: (id: string, status: ApprovalStatus) => void;
  onModifyDepreciation?: (assetId: string, usefulLife: number, method: string) => void;
  onExportData: (type: string) => void;
}

export default function FinanceView({
  assets,
  approvals,
  onApproveFinance,
  onModifyDepreciation,
  onExportData
}: FinanceViewProps) {
  // Navigation tabs inside finance view
  const [financeTab, setFinanceTab] = useState<"ledger" | "depr-calc">("ledger");

  // Dynamic search state inside ledger
  const [ledgerSearch, setLedgerSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");

  // Depreciation calculator state
  const [calcSelectedAssetId, setCalcSelectedAssetId] = useState(assets[0]?.id || "");
  const [customSalvageVal, setCustomSalvageVal] = useState<number>(500);
  const [customLifeYrs, setCustomLifeYrs] = useState<number>(5);
  const [deprMethod, setDeprMethod] = useState<"Straight-Line" | "Double Declining">("Straight-Line");

  // Selected asset for calculator
  const calcSelectedAsset = assets.find(a => a.id === calcSelectedAssetId) || assets[0];

  // Table calculations
  const totalCost = assets.reduce((sum, a) => sum + a.acquisitionValue, 0);
  const totalBookValue = assets.reduce((sum, a) => sum + a.bookValue, 0);
  const totalAccumulated = assets.reduce((sum, a) => sum + a.accumulatedDepreciation, 0);

  // Filter financial assets
  const filteredAssets = assets.filter(a => {
    const matchesSearch = a.name.toLowerCase().includes(ledgerSearch.toLowerCase()) || 
                          a.id.toLowerCase().includes(ledgerSearch.toLowerCase()) || 
                          a.location.toLowerCase().includes(ledgerSearch.toLowerCase());
    const matchesType = typeFilter === "All" || a.type === typeFilter;
    return matchesSearch && matchesType;
  });

  // Calculate year-by-year projections for calculator
  const calculateProjections = () => {
    if (!calcSelectedAsset) return [];
    
    const cost = calcSelectedAsset.acquisitionValue;
    const lifeYrs = customLifeYrs;
    const salvage = customSalvageVal;
    
    const projections = [];
    let currentBookValue = cost;
    
    if (deprMethod === "Straight-Line") {
      const annualDepr = Math.max(0, (cost - salvage) / lifeYrs);
      for (let yr = 1; yr <= lifeYrs; yr++) {
        const deprAmount = Math.min(currentBookValue - salvage, annualDepr);
        currentBookValue = Math.max(salvage, currentBookValue - deprAmount);
        projections.push({
          year: yr,
          deprAmount,
          accumDepr: cost - currentBookValue,
          endingBookValue: currentBookValue
        });
      }
    } else {
      // Double Declining
      const deprRate = 2 / lifeYrs;
      for (let yr = 1; yr <= lifeYrs; yr++) {
        let deprAmount = currentBookValue * deprRate;
        if (currentBookValue - deprAmount < salvage) {
          deprAmount = Math.max(0, currentBookValue - salvage);
        }
        currentBookValue = currentBookValue - deprAmount;
        projections.push({
          year: yr,
          deprAmount,
          accumDepr: cost - currentBookValue,
          endingBookValue: currentBookValue
        });
      }
    }
    return projections;
  };

  const projectionsData = calculateProjections();

  // Filter approvals that are financial in scope
  const financeApprovals = approvals.filter(ap => 
    ap.type === "New Asset Entry" || 
    ap.type === "Depreciation Adjustment" || 
    ap.type === "Asset Disposal"
  );

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-slate-50 antialiased text-slate-850">
      {/* Top title area */}
      <div id="finance_header_pane" className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-mono tracking-widest text-amber-600 font-bold bg-amber-50 px-2.5 py-1 rounded border border-amber-200">
            Ledger Treasury Scope
          </span>
          <h1 id="screen_title_finance" className="text-2xl font-bold tracking-tight text-slate-900 mt-2">
            Financial Governance Console
          </h1>
          <p className="text-sm text-slate-500 mt-0.5 font-sans leading-relaxed">
            Real-time capitalization monitoring and fiscal compliance oversight.
          </p>
        </div>

        {/* Console view toggle tabs */}
        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 self-start md:self-center">
          <button
            id="tab_finance_ledger"
            onClick={() => setFinanceTab("ledger")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              financeTab === "ledger" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Capital Assets Ledger
          </button>
          <button
            id="tab_finance_calc"
            onClick={() => setFinanceTab("depr-calc")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              financeTab === "depr-calc" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Depreciation Calculator Pro
          </button>
        </div>
      </div>

      {/* Financial Core capitalization aggregates cards */}
      <div id="finance_aggregates_pane" className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-slate-900 text-white border border-slate-800 rounded-xl p-5 shadow-md relative overflow-hidden select-none">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Coins className="h-28 w-28 text-white" />
          </div>
          <span className="text-[10px] font-mono tracking-widest uppercase text-teal-400">Net Capitalized Asset Cost</span>
          <p className="text-3xl font-bold tracking-tight mt-1 mb-2 text-white">${totalCost.toLocaleString()}</p>
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Scale className="h-3.5 w-3.5 text-teal-400" />
            <span>Reflects registered master assets cost</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <span className="text-[10px] font-mono tracking-widest uppercase text-slate-400 block">Total Combined Book Value</span>
          <p className="text-3xl font-bold tracking-tight mt-1 mb-2 text-slate-950">${totalBookValue.toLocaleString()}</p>
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>Yielding 72% remaining equity book</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <span className="text-[10px] font-mono tracking-widest uppercase text-slate-400 block">Accumulated depreciation write-off</span>
          <p className="text-3xl font-bold tracking-tight mt-1 mb-2 text-slate-800">${totalAccumulated.toLocaleString()}</p>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Percent className="h-3.5 w-3.5 text-amber-500" />
            <span>Avg depreciation rate: 28% global</span>
          </div>
        </div>
      </div>

      {/* DYNAMIC VIEW FOR INTERACTIVE LEDGER */}
      {financeTab === "ledger" && (
        <div id="finance_ledger_tab_view" className="space-y-6">
          {/* Main ledger list controls */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-100 gap-4 mb-4">
              <div>
                <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider font-mono">
                  Asset Financial Ledger & Balances
                </h3>
                <p className="text-xs text-slate-400 font-sans">
                  Comprehensive listing of structural corporate investments and residual depreciation margins.
                </p>
              </div>

              {/* Filtering Controls */}
              <div className="flex items-center gap-2 self-start sm:self-center">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search ledger items..."
                    value={ledgerSearch}
                    onChange={(e) => setLedgerSearch(e.target.value)}
                    className="pl-8 pr-3 py-1.5 bg-slate-50 text-xs border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-amber-500 w-52"
                  />
                </div>

                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="bg-slate-50 text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none"
                >
                  <option value="All">All Asset Classes</option>
                  {Object.values(AssetType).map(v => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>

                <button
                  onClick={() => onExportData("Finance-Ledger")}
                  className="p-1.5 bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
                  title="Export Book ledger to Excel/CSV"
                >
                  <Download className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] font-mono uppercase text-slate-400">
                    <th className="py-2.5 font-semibold">Asset ID</th>
                    <th className="py-2.5 font-semibold">Asset Class Name</th>
                    <th className="py-2.5 font-semibold">Formula Type</th>
                    <th className="py-2.5 font-semibold text-right">Capital Cost</th>
                    <th className="py-2.5 font-semibold text-right">Accum Depreciation</th>
                    <th className="py-2.5 font-semibold text-right">Current Book Equity</th>
                    <th className="py-2.5 font-semibold text-right pr-2">Life left</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700 font-sans">
                  {filteredAssets.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        No asset investments match specified criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredAssets.map((asset) => (
                      <tr key={asset.id} className="hover:bg-slate-50/50">
                        <td className="py-3.5 font-mono text-slate-500 font-medium text-[11px]">{asset.id}</td>
                        <td className="py-3.5">
                          <p className="font-bold text-slate-800 leading-tight">{asset.name}</p>
                          <span className="text-[10px] font-mono text-slate-400 mt-0.5 block">{asset.location}</span>
                        </td>
                        <td className="py-3.5 font-mono text-[10px] text-slate-500">
                          {asset.depreciationMethod}
                        </td>
                        <td className="py-3.5 text-right font-mono font-medium text-slate-900">
                          ${asset.acquisitionValue.toLocaleString()}
                        </td>
                        <td className="py-3.5 text-right font-mono text-rose-600">
                          -${asset.accumulatedDepreciation.toLocaleString()}
                        </td>
                        <td className="py-3.5 text-right font-mono font-bold text-slate-950">
                          ${asset.bookValue.toLocaleString()}
                        </td>
                        <td className="py-3.5 text-right font-mono text-slate-450 pr-2">
                          {asset.usefulLifeYrs} yrs
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Active Capital Approvals grid */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider font-mono border-b border-slate-100 pb-3 mb-4">
              Fiscal Compliance Approvals Queue
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {financeApprovals.map((appr) => (
                <div key={appr.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl hover:border-slate-300 transition-colors flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono uppercase bg-slate-200 px-2 py-0.5 rounded text-slate-700">
                        {appr.type}
                      </span>
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                        appr.status === ApprovalStatus.PENDING ? "bg-amber-100 text-amber-800 text-amber-800/80 animate-pulse" : ""
                      }`}>
                        {appr.status}
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-slate-800 leading-tight mb-1">{appr.title}</h4>
                    <p className="text-[11px] text-slate-400 mb-2">Requested by {appr.requester} ({appr.role})</p>
                    <p className="text-xs text-slate-650 bg-white p-2.5 rounded border border-slate-150 leading-relaxed mb-4 font-normal">
                      {appr.details}
                    </p>
                  </div>

                  {appr.status === ApprovalStatus.PENDING && (
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200/50">
                      <button
                        onClick={() => onApproveFinance(appr.id, ApprovalStatus.REJECTED)}
                        className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 hover:bg-rose-50 hover:text-rose-700 text-xs font-semibold rounded-lg text-slate-600 transition-colors cursor-pointer"
                      >
                        <X className="h-3.5 w-3.5" />
                        Reject Change
                      </button>
                      <button
                        onClick={() => onApproveFinance(appr.id, ApprovalStatus.APPROVED)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                      >
                        <Check className="h-3.5 w-3.5" />
                        Authorize Entry
                      </button>
                    </div>
                  )}
                </div>
              ))}
              
              {financeApprovals.length === 0 && (
                <div className="col-span-2 py-6 text-center text-slate-400 font-sans text-xs">
                  All active financial authorizations completed. Queue empty.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* DYNAMIC VIEW FOR DEPRECIATION CALCULATOR PRO */}
      {financeTab === "depr-calc" && (
        <div id="finance_calculator_tab_view" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form control console */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider font-mono border-b border-slate-100 pb-3 mb-1">
              Ledger Projection Controls
            </h3>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Select Active Target Asset
              </label>
              <select
                value={calcSelectedAssetId}
                onChange={(e) => setCalcSelectedAssetId(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-slate-50 text-slate-900 focus:outline-none"
              >
                {assets.map(a => (
                  <option key={a.id} value={a.id}>
                    [{a.id}] {a.name}
                  </option>
                ))}
              </select>
            </div>

            {calcSelectedAsset && (
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <span className="text-[10px] uppercase font-mono text-slate-400">Baseline Records</span>
                <p className="font-bold text-slate-800 mt-1 leading-snug">{calcSelectedAsset.name}</p>
                <div className="grid grid-cols-2 gap-3 mt-3 font-mono text-[10.5px]">
                  <div>
                    <span className="text-slate-400 block">Original Cost:</span>
                    <strong className="text-slate-900 font-semibold">${calcSelectedAsset.acquisitionValue.toLocaleString()}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Actual Book:</span>
                    <strong className="text-slate-900 font-semibold">${calcSelectedAsset.bookValue.toLocaleString()}</strong>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Projection Formula Protocol
              </label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-lg border border-slate-200">
                <button
                  type="button"
                  onClick={() => setDeprMethod("Straight-Line")}
                  className={`py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                    deprMethod === "Straight-Line" ? "bg-white text-slate-950 shadow-sm" : "text-slate-600"
                  }`}
                >
                  Straight Line
                </button>
                <button
                  type="button"
                  onClick={() => setDeprMethod("Double Declining")}
                  className={`py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                    deprMethod === "Double Declining" ? "bg-white text-slate-950 shadow-sm" : "text-slate-600"
                  }`}
                >
                  200% Declining
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Expected Salvage Value
                </label>
                <input
                  type="number"
                  value={customSalvageVal}
                  onChange={(e) => setCustomSalvageVal(parseInt(e.target.value) || 0)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-slate-50 text-slate-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Projection Years
                </label>
                <input
                  type="number"
                  min={1}
                  max={25}
                  value={customLifeYrs}
                  onChange={(e) => setCustomLifeYrs(parseInt(e.target.value) || 1)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-slate-50 text-slate-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>

            {calcSelectedAsset && onModifyDepreciation && (
              <button
                type="button"
                onClick={() => onModifyDepreciation(calcSelectedAsset.id, customLifeYrs, deprMethod)}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-850 text-white font-medium rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Calculator className="h-4 w-4" />
                Commit Schedule as Master
              </button>
            )}
          </div>

          {/* Graphical spreadsheet table */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider font-mono border-b border-slate-100 pb-3 mb-4">
              Fiscal Schedule Projection List
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] font-mono uppercase text-slate-400">
                    <th className="py-2.5 font-semibold">Year Roster</th>
                    <th className="py-2.5 font-semibold text-right">Amortization Amount</th>
                    <th className="py-2.5 font-semibold text-right">Cumulative Write-Off</th>
                    <th className="py-2.5 font-semibold text-right pr-2">Ending Book Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-mono text-slate-700">
                  {projectionsData.map((row) => (
                    <tr key={row.year} className="hover:bg-slate-50/50">
                      <td className="py-3.5 font-bold text-slate-800">Year {row.year} Projection</td>
                      <td className="py-3.5 text-right font-medium text-amber-600">
                        ${row.deprAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 text-right text-slate-500">
                        ${row.accumDepr.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 text-right font-bold text-slate-950 pr-2">
                        ${row.endingBookValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                  {projectionsData.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-400 font-sans">
                        Select a valid asset above to generate financial charts.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {projectionsData.length > 0 && (
              <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-100 text-slate-700 text-xs space-y-2">
                <span className="font-semibold text-amber-800 flex items-center gap-1.5">
                  <Coins className="h-4 w-4" />
                  Tax & General Ledger Provision Note:
                </span>
                <p className="leading-relaxed">
                  Calculated using {deprMethod} method assuming a residual salvage threshold of ${customSalvageVal.toLocaleString()} with {customLifeYrs}-year useful write-off limits. All entries here require authorization before integration into external ERP feeds.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
