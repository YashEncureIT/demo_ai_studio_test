import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Bot, X, Send, Sparkles, AlertTriangle, Cpu, FileCheck2, Calculator, CheckCircle2 } from "lucide-react";
import { Asset, UserRole } from "../types";

interface AIWidgetProps {
  assets: Asset[];
  role: UserRole;
  onRemediateAsset?: (id: string, issue: string) => void;
}

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
  isRiskCheck?: boolean;
}

export default function AIWidget({ assets, role, onRemediateAsset }: AIWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "wel-1",
      sender: "ai",
      text: `Greetings. I am the AAMS AI Governance Auditor. Speak with me to review the active assets ledger, audit lease documentation, calculate compliance risk indexes, or forecast straight-line values. How can I assist you as an active **${role}**?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [aiApiKeyStatus, setAiApiKeyStatus] = useState<"checking" | "connected" | "fallback">("checking");
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto Scroll
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  // Check API health on mount
  useEffect(() => {
    fetch("/api/health")
      .then(res => res.json())
      .then(data => {
        if (data.hasApiKey) {
          setAiApiKeyStatus("connected");
        } else {
          setAiApiKeyStatus("fallback");
        }
      })
      .catch(() => {
        setAiApiKeyStatus("fallback");
      });
  }, []);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsgId = `usr-${Date.now()}`;
    const userMsg: Message = {
      id: userMsgId,
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: textToSend,
          assets: assets,
          role: role
        })
      });

      const data = await response.json();
      
      if (data.success && data.text) {
        setMessages((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            sender: "ai",
            text: data.text,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      } else {
        // Fallback simulator is triggered if backend reports no API key (data.fallback === true) or on other errors
        const aiResponse = generateLocalMockResponse(textToSend, assets, role);
        setMessages((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            sender: "ai",
            text: aiResponse,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
    } catch (error) {
      const aiResponse = generateLocalMockResponse(textToSend, assets, role);
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: "ai",
          text: aiResponse,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSmartPrompt = (type: "risk" | "lease" | "depr") => {
    let promptText = "";
    if (type === "risk") {
      promptText = "Perform full structural compliance & ledger risk scans on active assets.";
    } else if (type === "lease") {
      promptText = "Identify which active assets have missing lease agreements and outline the severity.";
    } else if (type === "depr") {
      promptText = "Calculate potential depreciation adjustments and useful life conflicts.";
    }
    handleSendMessage(promptText);
  };

  return (
    <div id="ai_governance_fab_unit" className="fixed bottom-6 right-6 z-50 font-sans antialiased">
      {/* FAB Bubble */}
      <motion.button
        id="ai_fab_bubble"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="h-14 w-14 rounded-full bg-slate-900 text-teal-400 border border-slate-700 flex items-center justify-center shadow-2xl hover:shadow-teal-500/10 cursor-pointer relative"
      >
        <Bot className="h-6 w-6 stroke-[2]" />
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-teal-500"></span>
        </span>
      </motion.button>

      {/* Floating Chat Drawer Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="ai_chat_canvas"
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="absolute bottom-16 right-0 w-[420px] max-w-[calc(100vw-32px)] h-[580px] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100"
          >
            {/* Header */}
            <div id="ai_chat_header" className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm tracking-tight text-white flex items-center gap-1.5 leading-tight">
                    AAMS AI Assistant
                    <Sparkles className="h-3 w-3 text-teal-400 fill-teal-400/20" />
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`h-1.5 w-1.5 rounded-full ${aiApiKeyStatus === "connected" ? "bg-teal-400" : "bg-teal-500/60 animate-pulse"}`}></span>
                    <span className="text-[10px] font-mono text-slate-400 uppercase">
                      {aiApiKeyStatus === "connected" ? "Gemini-3.5-Live" : "Expert Simulation Active"}
                    </span>
                  </div>
                </div>
              </div>
              <button
                id="close_ai_drawer"
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Smart Action Quick Rails */}
            <div id="smart_assistance_pills" className="px-3 py-2 bg-slate-950/60 border-b border-slate-800/80 flex gap-2 overflow-x-auto scrollbar-none select-none">
              <button
                type="button"
                onClick={() => handleSmartPrompt("risk")}
                className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium bg-slate-800 border border-slate-700/60 hover:border-teal-500/40 rounded-full text-slate-200 transition-all hover:bg-slate-800/80 cursor-pointer whitespace-nowrap"
              >
                <Cpu className="h-3.5 w-3.5 text-teal-400" />
                Asset Audit Risk Scan
              </button>
              <button
                type="button"
                onClick={() => handleSmartPrompt("lease")}
                className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium bg-slate-800 border border-slate-700/60 hover:border-violet-500/40 rounded-full text-slate-200 transition-all hover:bg-slate-800/80 cursor-pointer whitespace-nowrap"
              >
                <FileCheck2 className="h-3.5 w-3.5 text-violet-400" />
                Missing Leases
              </button>
              <button
                type="button"
                onClick={() => handleSmartPrompt("depr")}
                className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium bg-slate-800 border border-slate-700/60 hover:border-amber-500/40 rounded-full text-slate-200 transition-all hover:bg-slate-800/80 cursor-pointer whitespace-nowrap"
              >
                <Calculator className="h-3.5 w-3.5 text-amber-400" />
                Depreciation Audit
              </button>
            </div>

            {/* Message Area */}
            <div id="ai_chat_scroll_area" className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-900/40">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-xs leading-relaxed ${
                      msg.sender === "user"
                        ? "bg-teal-500 text-slate-950 font-medium rounded-tr-none"
                        : "bg-slate-800 text-slate-100 border border-slate-700/50 rounded-tl-none font-sans"
                    }`}
                  >
                    {/* Render markdown style line breaks beautifully */}
                    <div className="whitespace-pre-wrap">{msg.text}</div>
                    <span
                      className={`block text-[9px] mt-1.5 text-right ${
                        msg.sender === "user" ? "text-slate-800" : "text-slate-400"
                      }`}
                    >
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-800 text-slate-300 rounded-xl rounded-tl-none border border-slate-700/50 p-3 flex items-center gap-2 text-xs">
                    <span className="h-2 w-2 rounded-full bg-teal-400 animate-bounce"></span>
                    <span className="h-2 w-2 rounded-full bg-teal-400 animate-bounce [animation-delay:0.2s]"></span>
                    <span className="h-2 w-2 rounded-full bg-teal-400 animate-bounce [animation-delay:0.4s]"></span>
                    <span className="text-[10px] font-mono text-slate-400 ml-1">AI analyzing database...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div id="ai_chat_input_bar" className="p-3 bg-slate-950 border-t border-slate-800 flex gap-2">
              <input
                id="ai_chat_text_input"
                type="text"
                placeholder="Ask me calculations, logs analysis..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSendMessage(inputText);
                }}
                className="flex-1 text-xs bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-teal-500 transition-colors"
              />
              <button
                id="send_ai_message"
                onClick={() => handleSendMessage(inputText)}
                className="h-8 w-8 rounded-lg bg-teal-500 text-slate-950 flex items-center justify-center hover:bg-teal-400 transition-all font-bold cursor-pointer"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Highly customized expert fallback simulator
function generateLocalMockResponse(prompt: string, assets: Asset[], role: UserRole): string {
  const p = prompt.toLowerCase();

  if (p.includes("risk") || p.includes("scan")) {
    const totalAssets = assets.length;
    const critical = assets.filter((a) => a.governanceFlags.length > 0 || a.leaseDocStatus === "Missing").length;
    const itemsWithOverdue = assets.filter((a) => a.daysInactive > 120);

    return `🛡️ **AAMS AI Risk Integrity Diagnostics Report**

I have scanned the live asset ledger database (${totalAssets} active items).

**Key Vulnerabilities Identified:**
1. **Lease Authorization Deficits**:
   - Out of ${totalAssets} registered assets, **${assets.filter((a) => a.leaseDocStatus === "Missing").length}** are flagged as 'Missing Ledger Authorization Documents'.
   - Specific Concern: **AST-2026-4410** (${assets.find(a => a.id === "AST-2026-4410")?.name}) lists $12,000 value but has missing files.

2. **Asset Utilization Drift**:
   - We isolated **${itemsWithOverdue.length}** item sets which has not been polled on visual records in excess of 120 days.
   - Flagged: **AST-2026-8801** (Task Chairs, Days Inactive: 184).

**Remediation Recommendation:**
- Issue a visual compliance audit directive for ${totalAssets - critical} healthy items and mandate immediate upload of verification PDFs.
- Would you like me to generate a draft directive for Seattle and San Francisco HQ site leads?`;
  }

  if (p.includes("lease") || p.includes("missing") || p.includes("document")) {
    const missingLease = assets.filter((a) => a.leaseDocStatus === "Missing");
    if (missingLease.length === 0) {
      return `✅ **Lease Integrity Audit**: Excellent work. All registered assets in direct focus currently hold a valid 'Attached' or 'N/A' lease status. Perfect 100% compliance.`;
    }
    
    let listStr = "";
    missingLease.forEach(a => {
      listStr += `- **${a.id}** [${a.name}] | Location: ${a.location} | Value: $${a.acquisitionValue}\n`;
    });

    return `📋 **Missing Ledger Document Registry**

I discovered **${missingLease.length}** critical asset records lacking attached supporting leases or purchase deeds in storage:

${listStr}
**Immediate Safeguard Directives:**
1. Under Sarbanes-Oxley physical security tracking guidelines, any asset with valuation over $10,000 without validated custody papers must be flagged 'Under Audit'.
2. You can use the **Asset Manager Console** to re-upload files or request transfer reviews.`;
  }

  if (p.includes("depr") || p.includes("value") || p.includes("straight") || p.includes("declining")) {
    const totalCost = assets.reduce((sum, a) => sum + a.acquisitionValue, 0);
    const totalBookValue = assets.reduce((sum, a) => sum + a.bookValue, 0);
    const totalAccum = assets.reduce((sum, a) => sum + a.accumulatedDepreciation, 0);

    return `📊 **Financial Ledger Integrity Scan**

Here is the high-level fiscal compliance status of the enterprise asset register:

- **Total Acquisition Cost**: $${totalCost.toLocaleString()}
- **Total Combined Book Value**: $${totalBookValue.toLocaleString()}
- **Aggregate Depreciation Writedown**: $${totalAccum.toLocaleString()}

**Analysis & Outliers:**
* **Double Declining Balance Outlier**:
  - Asset **AST-2026-4402** (Laser Cutter v12, Cost: $124,000) is utilizing DDB write-downs. Current Book Value is $93,000 (after $31,000 writedown). Recommended useful life validation due to expired certification.
  
* **Straight-Line Schedules**:
  - Remaining average useful life across the hardware roster is **3.8 years**.
  
Let me know if you want me to simulate changing **AST-2026-3091** (HVAC Compressor) from 15-year straight-line depreciation to 10-year to clear depreciation adjustments!`;
  }

  // General catch all response customized based on role
  return `💬 **AAMS Assistant - Ledger Intelligence Query**

Thank you. I have parsed your query regarding "${prompt}".

As the **${role}**, you have full structural override permissions in this workspace:
- I can fetch specific asset parameters. Try typing "risk scan" to see systemic alerts.
- I can inspect missing lease papers. Try typing "lease audit".
- I can recalculate depreciation tables. Try typing "depreciation schedule".

What specific ledger item or tracking code can I inspect for you next?`;
}
