import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  CheckSquare,
  Plus,
  RefreshCw,
  LogOut,
  FolderOpen,
  Trash2,
  CheckCircle,
  FileText,
  AlertTriangle,
  FolderTree,
  ExternalLink,
  Loader2,
  ListPlus,
  Compass,
  ArrowRightCircle,
  CalendarDays,
  User,
  ShieldCheck
} from "lucide-react";
import {
  initAuth,
  googleSignIn,
  logoutGoogle,
  getAccessToken,
  getGoogleUser
} from "../googleAuth";
import { Asset, AuditCampaign, Observation, ApprovalItem } from "../types";
import { User as FirebaseUser } from "firebase/auth";

interface GoogleTasksViewProps {
  assets: Asset[];
  campaigns: AuditCampaign[];
  observations: Observation[];
  approvals: ApprovalItem[];
}

export default function GoogleTasksView({
  assets,
  campaigns,
  observations,
  approvals
}: GoogleTasksViewProps) {
  // Auth states
  const [googleUser, setGoogleUser] = useState<FirebaseUser | null>(getGoogleUser());
  const [token, setToken] = useState<string | null>(null);
  const [needsAuth, setNeedsAuth] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // API states
  const [taskLists, setTaskLists] = useState<any[]>([]);
  const [selectedListId, setSelectedListId] = useState<string>("");
  const [tasks, setTasks] = useState<any[]>([]);
  const [loadingLists, setLoadingLists] = useState(false);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);

  // Form states
  const [newListName, setNewListName] = useState("");
  const [showAddListForm, setShowAddListForm] = useState(false);
  const [addingList, setAddingList] = useState(false);

  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskNotes, setNewTaskNotes] = useState("");
  const [newTaskDue, setNewTaskDue] = useState("");
  const [showAddTaskForm, setShowAddTaskForm] = useState(false);
  const [addingTask, setAddingTask] = useState(false);

  // Active sub-tab for local suggestions
  const [suggestionTab, setSuggestionTab] = useState<"audits" | "observations" | "approvals">("audits");

  // Destructive confirmations state
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmCompleteId, setConfirmCompleteId] = useState<string | null>(null);

  // Initialize auth listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, retrievedToken) => {
        setGoogleUser(user);
        setToken(retrievedToken);
        setNeedsAuth(false);
        fetchTaskLists(retrievedToken);
      },
      () => {
        setGoogleUser(null);
        setToken(null);
        setNeedsAuth(true);
      }
    );
    return () => unsubscribe();
  }, []);

  // Show dynamic toast status helper
  const triggerStatus = (text: string, type: "success" | "error" | "info" = "info") => {
    setStatusMessage({ text, type });
    setTimeout(() => {
      setStatusMessage(null);
    }, 4500);
  };

  // Google OAuth Login Trigger
  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    triggerStatus("Initializing secure Google Workspace Link...", "info");
    try {
      const result = await googleSignIn();
      if (result) {
        setGoogleUser(result.user);
        setToken(result.accessToken);
        setNeedsAuth(false);
        triggerStatus(`Linked Google Tasks as ${result.user.email}!`, "success");
        fetchTaskLists(result.accessToken);
      }
    } catch (err: any) {
      console.error("Auth failed:", err);
      triggerStatus(`Linked account authentication failed: ${err.message || err}`, "error");
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Log out of google
  const handleGoogleLogout = async () => {
    const confirmLogout = window.confirm("Disconnect your Google Tasks linkage and invalidate the temporary local access token?");
    if (!confirmLogout) return;

    try {
      await logoutGoogle();
      setGoogleUser(null);
      setToken(null);
      setNeedsAuth(true);
      setTaskLists([]);
      setTasks([]);
      setSelectedListId("");
      triggerStatus("Google Tasks credentials disconnected safely.", "success");
    } catch (err: any) {
      triggerStatus("Logout error: " + err.message, "error");
    }
  };

  // Fetch all user task lists
  const fetchTaskLists = async (accessToken?: string) => {
    const activeToken = accessToken || token;
    if (!activeToken) return;

    setLoadingLists(true);
    try {
      const res = await fetch("https://tasks.googleapis.com/tasks/v1/users/@me/lists", {
        headers: { Authorization: `Bearer ${activeToken}` }
      });
      if (!res.ok) throw new Error(`Tasks API listed error: ${res.statusText}`);
      const data = await res.json();
      const lists = data.items || [];
      setTaskLists(lists);

      if (lists.length > 0) {
        // Auto-select first list if none selected
        setSelectedListId(prev => (prev && lists.some((l: any) => l.id === prev) ? prev : lists[0].id));
      } else {
        setSelectedListId("");
      }
    } catch (err: any) {
      console.error("Error fetching lists:", err);
      triggerStatus(`Could not fetch lists: ${err.message}`, "error");
    } finally {
      setLoadingLists(false);
    }
  };

  // Fetch tasks inside list
  const fetchTasksForList = async (listId: string) => {
    if (!listId || !token) return;

    setLoadingTasks(true);
    try {
      // Fetch up to 100 tasks, including completed ones
      const res = await fetch(`https://tasks.googleapis.com/tasks/v1/lists/${listId}/tasks?showCompleted=true&maxResults=100`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error(`Tasks retrieve failed: ${res.statusText}`);
      const data = await res.json();
      setTasks(data.items || []);
    } catch (err: any) {
      console.error("Error fetching tasks:", err);
      triggerStatus(`Could not pull tasks: ${err.message}`, "error");
    } finally {
      setLoadingTasks(false);
    }
  };

  // Auto reload tasks on list toggle
  useEffect(() => {
    if (selectedListId && token) {
      fetchTasksForList(selectedListId);
    } else {
      setTasks([]);
    }
  }, [selectedListId, token]);

  // Create a new empty Task List in user account
  const handleCreateTaskList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListName.trim() || !token) return;

    setAddingList(true);
    try {
      const res = await fetch("https://tasks.googleapis.com/tasks/v1/users/@me/lists", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ title: newListName })
      });
      if (!res.ok) throw new Error("Could not construct list");
      const createdList = await res.json();

      triggerStatus(`Successfully created task list "${newListName}"!`, "success");
      setNewListName("");
      setShowAddListForm(false);
      
      // Refresh Lists and auto select newly created one
      setTaskLists(prev => [createdList, ...prev]);
      setSelectedListId(createdList.id);
    } catch (err: any) {
      triggerStatus(`Failed to generate task list: ${err.message}`, "error");
    } finally {
      setAddingList(false);
    }
  };

  // Add a standard manual task
  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !selectedListId || !token) return;

    setAddingTask(true);
    try {
      const formattedDue = newTaskDue ? new Date(newTaskDue).toISOString() : undefined;
      const res = await fetch(`https://tasks.googleapis.com/tasks/v1/lists/${selectedListId}/tasks`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title: newTaskTitle,
          notes: newTaskNotes,
          due: formattedDue
        })
      });
      if (!res.ok) throw new Error("Could not add Google Task node");
      const data = await res.json();

      triggerStatus(`Task "${newTaskTitle}" dispatched to Google Tasks!`, "success");
      setNewTaskTitle("");
      setNewTaskNotes("");
      setNewTaskDue("");
      setShowAddTaskForm(false);
      
      // Update local task state list
      setTasks(prev => [data, ...prev]);
    } catch (err: any) {
      triggerStatus(`Error adding task: ${err.message}`, "error");
    } finally {
      setAddingTask(false);
    }
  };

  // Toggle Task Completion State (with prompt as updates are mutating workspace/Google account entries)
  const handleToggleTaskStatus = async (taskId: string, currentStatus: string) => {
    if (!selectedListId || !token) return;
    
    const nextStatus = currentStatus === "completed" ? "needsAction" : "completed";
    const updateLabel = nextStatus === "completed" ? "Mark this google task as completed?" : "Re-open this completed google task?";
    
    // Safety check as updating user personal workspace entries
    const verify = window.confirm(`${updateLabel}\nThis directly updates your Google Tasks account.`);
    if (!verify) return;

    try {
      // First update the local UI optimistically
      setTasks(prev =>
        prev.map(t => (t.id === taskId ? { ...t, status: nextStatus, completed: nextStatus === "completed" ? new Date().toISOString() : undefined } : t))
      );

      const res = await fetch(`https://tasks.googleapis.com/tasks/v1/lists/${selectedListId}/tasks/${taskId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          status: nextStatus
        })
      });

      if (!res.ok) throw new Error("Patch sync rejected");
      triggerStatus(`Task state updated successfully in cloud registry`, "success");
    } catch (err: any) {
      triggerStatus(`Could not synchronize item state: ${err.message}`, "error");
      // Revert if failed
      fetchTasksForList(selectedListId);
    }
  };

  // Delete a Task (Destructive Option -> STRICTLY Mandated explicit Confirmation Dialog)
  const handleDeleteTask = async (taskId: string, titleStr: string) => {
    if (!selectedListId || !token) return;

    // Explicit confirmation dialog that describes exactly what will be deleted
    const confirmation = window.confirm(`DELETE GOOGLE TASK FOREVER?\n\nAre you sure you want to permanently delete "${titleStr}" from your Google Tasks cloud list?\nThis action cannot be undone.`);
    if (!confirmation) return;

    try {
      const res = await fetch(`https://tasks.googleapis.com/tasks/v1/lists/${selectedListId}/tasks/${taskId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (res.status !== 200 && res.status !== 204 && !res.ok) {
        throw new Error("Deletion request denied by Google");
      }

      triggerStatus(`Successfully deleted "${titleStr}" from Google Tasks.`, "success");
      // Pull tasks again or filter them locally
      setTasks(prev => prev.filter(t => t.id !== taskId));
    } catch (err: any) {
      triggerStatus(`Failed to delete Google Task: ${err.message}`, "error");
    }
  };

  // Push system registries context directly into users Google Tasks! (Dynamic Sync Integration)
  const handleSyncToGoogleTasks = async (itemType: "audit" | "observation" | "approval", item: any) => {
    if (!selectedListId || !token) {
      triggerStatus("Please authorize Google and select a task list first!", "error");
      return;
    }

    let title = "";
    let notes = "";
    let dueStr = "";

    if (itemType === "audit") {
      title = `[AAMS Compliance Audit] ${item.title}`;
      notes = `Lead Auditor: ${item.leadAuditor}\nTarget Scope: Verify ${item.targetCount} enterprise assets.\nSystem ID: ${item.id}\nStatus: ${item.status}\nAssigned via AAMS Governance Platform.`;
      dueStr = item.endDate;
    } else if (itemType === "observation") {
      title = `[AAMS Observation Remediation] ${item.assetName} - ${item.severity} Severity`;
      notes = `Log details: ${item.description}\nLogged: ${item.dateLogged}\nAsset registry node: ${item.assetId}\nRemediation required. Standard operational compliance protocol.`;
      dueStr = new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0]; // +7 days
    } else if (itemType === "approval") {
      title = `[AAMS Signature Needed] ${item.title}`;
      notes = `Requested by: ${item.requester} (${item.role})\nDetails: ${item.details}\nTransaction Pipeline ID: ${item.id}\nVerification required by Governance Board.`;
      dueStr = new Date().toISOString().split("T")[0]; // Today
    }

    // Double check prompt if mutating / writing data
    const verify = window.confirm(`PROPOSE NEW CLOUD TASK?\n\nDo you want to dispatch a Google Tasks reminder for:\n"${title}"\n\nThis will write directly to your selected list.`);
    if (!verify) return;

    try {
      const formattedDue = dueStr ? new Date(dueStr).toISOString() : undefined;
      const res = await fetch(`https://tasks.googleapis.com/tasks/v1/lists/${selectedListId}/tasks`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title,
          notes,
          due: formattedDue
        })
      });

      if (!res.ok) throw new Error("Failed to dispatch sync task");
      const createdTask = await res.json();
      setTasks(prev => [createdTask, ...prev]);
      triggerStatus(`"${title}" synchronized to Google Tasks!`, "success");
    } catch (err: any) {
      triggerStatus(`Sync to Google Tasks failed: ${err.message}`, "error");
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-slate-50 antialiased font-sans text-slate-800">
      {/* Header bar in slate theme */}
      <div id="tasks_header_strip" className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-mono tracking-widest text-indigo-600 font-bold bg-indigo-50 px-2.5 py-1 rounded border border-indigo-200">
            Workspace Integration Hub
          </span>
          <h1 id="screen_title_tasks" className="text-2xl font-bold tracking-tight text-slate-900 mt-2 flex items-center gap-2">
            <CheckSquare className="h-6 w-6 text-indigo-600 fill-indigo-100" />
            Google Tasks Control Room
          </h1>
          <p className="text-sm text-slate-500 mt-0.5 leading-relaxed">
            Synchronize compliance observations, depreciation audit campaigns, and pipeline signatures safely to your live Google Tasks.
          </p>
        </div>

        {googleUser && (
          <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-slate-200 shadow-sm shrink-0">
            <div className="h-8 w-8 rounded-full bg-slate-150 flex items-center justify-center overflow-hidden border border-slate-200">
              {googleUser.photoURL ? (
                <img src={googleUser.photoURL} alt={googleUser.displayName || "Google Host"} className="h-full w-full object-cover" />
              ) : (
                <User className="h-4 w-4 text-slate-500" />
              )}
            </div>
            <div className="leading-none">
              <p className="text-xs font-bold text-slate-800 tracking-tight">{googleUser.displayName || "Google Cloud User"}</p>
              <span className="text-[10px] font-mono text-emerald-600 block mt-0.5 uppercase tracking-wider font-semibold">● Live Workspace linked</span>
            </div>
            <button
              onClick={handleGoogleLogout}
              className="ml-2 p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-rose-600 cursor-pointer transition-colors"
              title="Disconnect Google Authorization"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Main Grid: Split info card if needs login, else full task workspace */}
      {needsAuth ? (
        <div className="max-w-xl mx-auto my-12 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden text-center p-8">
          <div className="h-16 w-16 bg-gradient-to-tr from-indigo-500 to-indigo-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-md shadow-indigo-150 transform rotate-3">
            <CheckSquare className="h-8 w-8 stroke-[2.2]" />
          </div>

          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Connect with Google Tasks</h2>
          <p className="text-sm text-slate-500 mt-3 mb-6 max-w-sm mx-auto leading-relaxed">
            Gain the ability to view, manage, and push direct real-time reminders for complex ledger audits, observations, and transfer approvals right into your Google account lists securely.
          </p>

          <div className="flex justify-center border-t border-slate-150 pt-6">
            <button
              onClick={handleGoogleLogin}
              disabled={isLoggingIn}
              className="gsi-material-button hover:scale-[1.01] transition-transform shadow-md rounded-xl cursor-pointer"
            >
              <div className="gsi-material-button-state"></div>
              <div className="gsi-material-button-content-wrapper">
                <div className="gsi-material-button-icon">
                  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: "block" }}>
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                    <path fill="none" d="M0 0h48v48H0z"></path>
                  </svg>
                </div>
                <span className="gsi-material-button-contents text-slate-800 font-bold font-sans">
                  {isLoggingIn ? "Authenticating session secure..." : "Link Google Tasks Client"}
                </span>
                <span style={{ display: "none" }}>Sign in with Google</span>
              </div>
            </button>
          </div>

          <div className="mt-6 flex justify-center items-center gap-1.5 text-[10px] font-mono text-slate-400">
            <ShieldCheck className="h-3.5 w-3.5 text-slate-400" />
            SECURE RE-ENTRANT OAUTH 2.0 PROTOCOL
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT: Task Lists Selection & suggestions (Lg: 5 columns) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* 1. SELECT LIST & NEW CONTAINER */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-mono font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1">
                  <FolderOpen className="h-3.5 w-3.5" />
                  Select Task List
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAddListForm(!showAddListForm)}
                  className="p-1 text-slate-400 hover:text-indigo-600 rounded hover:bg-slate-50 flex items-center gap-0.5 text-xs font-semibold cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  New List
                </button>
              </div>

              {/* Add List Input Inline form */}
              <AnimatePresence>
                {showAddListForm && (
                  <motion.form
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    onSubmit={handleCreateTaskList}
                    className="p-3 bg-indigo-50/50 rounded-lg border border-indigo-100 flex flex-col gap-2 overflow-hidden"
                  >
                    <input
                      type="text"
                      required
                      placeholder="e.g. Audit Deadlines 2026"
                      value={newListName}
                      onChange={(e) => setNewListName(e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <div className="flex gap-1.5 justify-end">
                      <button
                        type="button"
                        onClick={() => setShowAddListForm(false)}
                        className="px-2 py-1 text-[10px] uppercase font-bold text-slate-500 hover:text-slate-800"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={addingList}
                        className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[10px] font-bold shadow-sm transition-colors cursor-pointer flex items-center gap-1"
                      >
                        {addingList ? <Loader2 className="h-3 w-3 animate-spin" /> : "Save List"}
                      </button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>

              {loadingLists ? (
                <div className="py-6 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
                  Synchronizing TaskLists directory...
                </div>
              ) : (
                <div className="space-y-1.5">
                  {taskLists.map((list) => {
                    const isSelected = selectedListId === list.id;
                    return (
                      <button
                        key={list.id}
                        onClick={() => setSelectedListId(list.id)}
                        className={`w-full text-left px-3.5 py-2.5 text-xs font-semibold rounded-lg border transition-all flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? "bg-indigo-600/10 border-indigo-300 text-indigo-900"
                            : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        }`}
                      >
                        <span className="truncate pr-2">{list.title}</span>
                        {isSelected && (
                          <span className="h-2 w-2 rounded-full bg-indigo-600"></span>
                        )}
                      </button>
                    );
                  })}
                  {taskLists.length === 0 && (
                    <p className="text-center text-xs text-slate-400 py-4">No task lists found in Google Account.</p>
                  )}
                </div>
              )}
            </div>

            {/* 2. LIVE SYNCABLE ITEMS SUGGESTIONS */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
              <div>
                <h3 className="text-xs font-mono font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1.5 mb-1">
                  <Compass className="h-4 w-4 text-indigo-500" />
                  Governance Sync Recommendations
                </h3>
                <p className="text-[11px] text-slate-500 leading-snug">
                  Select a registered business item from the system master file below to synchronize it into Google Tasks.
                </p>
              </div>

              {/* Suggestions Tabs list */}
              <div className="flex border-b border-slate-150 pb-0.5 justify-around">
                <button
                  type="button"
                  onClick={() => setSuggestionTab("audits")}
                  className={`text-xs pb-1.5 font-bold border-b-2 transition-colors cursor-pointer px-1 ${
                    suggestionTab === "audits"
                      ? "border-indigo-600 text-indigo-600 font-bold"
                      : "border-transparent text-slate-400 hover:text-slate-700"
                  }`}
                >
                  Audits ({campaigns.length})
                </button>
                <button
                  type="button"
                  onClick={() => setSuggestionTab("observations")}
                  className={`text-xs pb-1.5 font-bold border-b-2 transition-colors cursor-pointer px-1 ${
                    suggestionTab === "observations"
                      ? "border-indigo-600 text-indigo-600 font-bold"
                      : "border-transparent text-slate-400 hover:text-slate-700"
                  }`}
                >
                  Observations ({observations.length})
                </button>
                <button
                  type="button"
                  onClick={() => setSuggestionTab("approvals")}
                  className={`text-xs pb-1.5 font-bold border-b-2 transition-colors cursor-pointer px-1 ${
                    suggestionTab === "approvals"
                      ? "border-indigo-600 text-indigo-600 font-bold"
                      : "border-transparent text-slate-400 hover:text-slate-700"
                  }`}
                >
                  Approvals ({approvals.length})
                </button>
              </div>

              {/* Active list display */}
              <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                {suggestionTab === "audits" && (
                  campaigns.map((item) => (
                    <div
                      key={item.id}
                      className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 flex items-center justify-between text-xs transition-hover hover:border-slate-300"
                    >
                      <div className="truncate pr-2 max-w-[70%]">
                        <p className="font-bold text-slate-800 truncate flex items-center gap-1">
                          <FileText className="h-3.5 w-3.5 text-slate-500 flex-shrink-0" />
                          {item.title}
                        </p>
                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-tight block mt-0.5">
                          ID: {item.id} • Lead: {item.leadAuditor}
                        </span>
                      </div>
                      <button
                        onClick={() => handleSyncToGoogleTasks("audit", item)}
                        className="py-1 px-2 text-[10px] font-bold text-indigo-600 hover:text-white bg-indigo-50 hover:bg-indigo-600 border border-indigo-100 rounded transition-colors flex items-center gap-0.5 cursor-pointer"
                      >
                        Sync
                        <ArrowRightCircle className="h-3 w-3" />
                      </button>
                    </div>
                  ))
                )}

                {suggestionTab === "observations" && (
                  observations.map((item) => (
                    <div
                      key={item.id}
                      className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 flex items-center justify-between text-xs transition-hover hover:border-slate-300"
                    >
                      <div className="truncate pr-2 max-w-[70%]">
                        <p className="font-bold text-slate-800 truncate flex items-center gap-1">
                          <AlertTriangle className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
                          {item.assetName}
                        </p>
                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-tight block mt-0.5 truncate">
                          Obs: {item.description} • Severity: {item.severity}
                        </span>
                      </div>
                      <button
                        onClick={() => handleSyncToGoogleTasks("observation", item)}
                        className="py-1 px-2 text-[10px] font-bold text-indigo-600 hover:text-white bg-indigo-50 hover:bg-indigo-600 border border-indigo-100 rounded transition-colors flex items-center gap-0.5 cursor-pointer"
                      >
                        Sync
                        <ArrowRightCircle className="h-3 w-3" />
                      </button>
                    </div>
                  ))
                )}

                {suggestionTab === "approvals" && (
                  approvals.map((item) => (
                    <div
                      key={item.id}
                      className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 flex items-center justify-between text-xs transition-hover hover:border-slate-300"
                    >
                      <div className="truncate pr-2 max-w-[70%]">
                        <p className="font-bold text-slate-800 truncate flex items-center gap-1">
                          <FolderTree className="h-3.5 w-3.5 text-indigo-500 flex-shrink-0" />
                          {item.title}
                        </p>
                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-tight block mt-0.5 truncate">
                          Req: {item.requester} • Status: {item.status}
                        </span>
                      </div>
                      <button
                        onClick={() => handleSyncToGoogleTasks("approval", item)}
                        className="py-1 px-2 text-[10px] font-bold text-indigo-600 hover:text-white bg-indigo-50 hover:bg-indigo-600 border border-indigo-100 rounded transition-colors flex items-center gap-0.5 cursor-pointer"
                      >
                        Sync
                        <ArrowRightCircle className="h-3 w-3" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: Selected List Tasks Explorer (Lg: 7 columns) */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-150">
              <div>
                <h2 className="text-sm font-bold text-slate-900 uppercase font-mono tracking-wider">
                  List Tasks Overview
                </h2>
                <p className="text-xs text-slate-500">
                  {loadingTasks ? "Decrypting database entries..." : `${tasks.length} item(s) synchronizing total`}
                </p>
              </div>

              <div id="tasks_actions_group" className="flex items-center gap-1.5 self-end">
                <button
                  type="button"
                  onClick={() => selectedListId && fetchTasksForList(selectedListId)}
                  disabled={loadingTasks || !selectedListId}
                  className="p-1.5 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg text-slate-700 hover:text-indigo-600 disabled:opacity-50 transition-colors shadow-sm cursor-pointer"
                  title="Reload Tasks"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${loadingTasks ? "animate-spin" : ""}`} />
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddTaskForm(!showAddTaskForm)}
                  disabled={!selectedListId}
                  className="flex items-center gap-1 py-1.5 px-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-sm transition-all cursor-pointer"
                >
                  <Plus className="h-3 w-3 text-slate-100" />
                  Add Task
                </button>
              </div>
            </div>

            {/* In-view status notification banner */}
            {statusMessage && (
              <div
                className={`text-xs px-4 py-3 rounded-xl border flex items-center gap-2 ${
                  statusMessage.type === "success"
                    ? "bg-emerald-50 border-emerald-100 text-emerald-800"
                    : statusMessage.type === "error"
                    ? "bg-rose-50 border-rose-100 text-rose-800"
                    : "bg-slate-50 border-slate-150 text-slate-800"
                }`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse"></span>
                <span>{statusMessage.text}</span>
              </div>
            )}

            {/* Add Task Input Form */}
            <AnimatePresence>
              {showAddTaskForm && (
                <motion.form
                  initial={{ opacity: 0, scale: 0.99, y: -5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.99, y: -5 }}
                  onSubmit={handleAddTask}
                  className="bg-indigo-50/40 border border-indigo-100 rounded-xl p-4 space-y-3.5"
                >
                  <div>
                    <label className="block text-[10px] font-mono tracking-wider text-slate-500 uppercase font-bold mb-1">
                      Task Summary (Required)
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Schedule asset revaluation auditor call"
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-mono tracking-wider text-slate-500 uppercase font-bold mb-1">
                        Remediation Due Date
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-400">
                          <CalendarDays className="h-3.5 w-3.5" />
                        </span>
                        <input
                          type="date"
                          value={newTaskDue}
                          onChange={(e) => setNewTaskDue(e.target.value)}
                          className="w-full text-xs pl-8 pr-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono tracking-wider text-slate-500 uppercase font-bold mb-1">
                      Technical Audit Notes
                    </label>
                    <textarea
                      placeholder="Input additional telemetry details, IDs or audit instructions..."
                      rows={2}
                      value={newTaskNotes}
                      onChange={(e) => setNewTaskNotes(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAddTaskForm(false)}
                      className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={addingTask}
                      className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold shadow transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      {addingTask ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Save to Google Tasks"}
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Task Items list scroll list */}
            {loadingTasks ? (
              <div className="py-16 text-center text-sm text-slate-400 flex flex-col items-center justify-center gap-3">
                <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
                <p className="font-mono text-xs">Synchronizing task lists with Google Cloud Platform...</p>
              </div>
            ) : (
              <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-1">
                {tasks.map((task) => {
                  const isCompleted = task.status === "completed";
                  return (
                    <div
                      key={task.id}
                      className={`border rounded-xl p-4 transition-all hover:shadow-sm ${
                        isCompleted
                          ? "bg-slate-50/75 border-slate-200 opacity-60"
                          : "bg-white border-slate-200"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 max-w-[85%]">
                          <button
                            onClick={() => handleToggleTaskStatus(task.id, task.status)}
                            className="mt-0.5 flex-shrink-0 cursor-pointer"
                            title={isCompleted ? "Mark incomplete" : "Mark complete"}
                          >
                            <div className={`h-5 w-5 rounded-md border flex items-center justify-center transition-colors ${
                              isCompleted
                                ? "bg-indigo-600 border-indigo-600 text-white"
                                : "border-slate-350 hover:border-indigo-500 text-transparent"
                            }`}>
                              <CheckCircle className="h-3.5 w-3.5" />
                            </div>
                          </button>

                          <div>
                            <p className={`text-xs font-bold leading-relaxed ${
                              isCompleted ? "line-through text-slate-500" : "text-slate-800"
                            }`}>
                              {task.title}
                            </p>
                            
                            {task.notes && (
                              <p className="text-[11px] text-slate-500 whitespace-pre-line mt-1.5 leading-relaxed bg-slate-50 border border-slate-150 p-2 rounded-lg">
                                {task.notes}
                              </p>
                            )}

                            <div className="flex items-center gap-3 mt-2">
                              {task.due && (
                                <span className="text-[10px] font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded font-semibold flex items-center gap-1">
                                  <CalendarDays className="h-3 w-3" />
                                  Due: {new Date(task.due).toLocaleDateString()}
                                </span>
                              )}
                              {task.updated && (
                                <span className="text-[9px] font-mono text-slate-400">
                                  Sync: {new Date(task.updated).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeleteTask(task.id, task.title)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                          title="Permanently Delete Google Task"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {tasks.length === 0 && !selectedListId && (
                  <div className="text-center py-16 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <CheckSquare className="h-8 w-8 text-slate-300 mx-auto mb-3" />
                    <p className="text-xs text-slate-500">Pick a workspace directory/list on the left panel to load cloud entries.</p>
                  </div>
                )}

                {tasks.length === 0 && selectedListId && (
                  <div className="text-center py-16 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <CheckSquare className="h-8 w-8 text-slate-300 mx-auto mb-3 animate-pulse" />
                    <p className="text-xs text-slate-500">No active reminders found. Let's add or sync a task!</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
