import React, { useState } from "react";
import { motion } from "motion/react";
import { Shield, Eye, EyeOff, Key, User, Building2, HelpCircle, ArrowRight, UserCheck } from "lucide-react";
import { UserRole, UserSession } from "../types";

interface AuthScreensProps {
  onLoginSuccess: (session: UserSession) => void;
}

export default function AuthScreens({ onLoginSuccess }: AuthScreensProps) {
  const [currentView, setCurrentView] = useState<"login" | "signup" | "forgot">("login");
  const [showPassword, setShowPassword] = useState(false);
  
  // Login form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // Signup form states
  const [signUpName, setSignUpName] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpCompany, setSignUpCompany] = useState("");
  const [signUpPass, setSignUpPass] = useState("");
  const [signUpConfirm, setSignUpConfirm] = useState("");
  const [signUpSuccess, setSignUpSuccess] = useState(false);

  // Forgot password states
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState(false);

  // Quick-switch role presets
  const ROLE_PRESETS = [
    {
      name: "Marcus Thorne",
      email: "m.thorne@aams-governance.com",
      role: "Auditor" as UserRole,
      title: "Lead Auditor",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      color: "border-teal-500 bg-teal-50"
    },
    {
      name: "Jameson Finance",
      email: "j.finance@aams-governance.com",
      role: "Finance" as UserRole,
      title: "Finance Officer",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
      color: "border-amber-500 bg-amber-50"
    },
    {
      name: "Elena Rostova",
      email: "e.rostova@aams-governance.com",
      role: "AssetManager" as UserRole,
      title: "Asset Manager",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80",
      color: "border-indigo-500 bg-indigo-50"
    },
    {
      name: "Admin User",
      email: "admin@aams-governance.com",
      role: "Admin" as UserRole,
      title: "Governance Lead",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80",
      color: "border-slate-500 bg-slate-50"
    }
  ];

  const handlePresetSelect = (preset: typeof ROLE_PRESETS[0]) => {
    setEmail(preset.email);
    setPassword("MasterPassword2026!");
    setLoginError("");
    
    // Auto login
    onLoginSuccess({
      name: preset.name,
      email: preset.email,
      companyName: "AAMS Enterprise Solutions",
      role: preset.role,
      avatar: preset.avatar
    });
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setLoginError("Please enter your work email or username");
      return;
    }
    if (!password || password.length < 4) {
      setLoginError("Please enter a valid password (minimum 4 characters)");
      return;
    }

    // Match preset if possible, otherwise default to Auditor role
    const matched = ROLE_PRESETS.find(p => p.email.toLowerCase() === email.toLowerCase());
    if (matched) {
      onLoginSuccess({
        name: matched.name,
        email: matched.email,
        companyName: "AAMS Enterprise Solutions",
        role: matched.role,
        avatar: matched.avatar
      });
    } else {
      // Custom user
      const nameFromEmail = email.split("@")[0];
      const capitalizedName = nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1);
      onLoginSuccess({
        name: capitalizedName || "Enterprise User",
        email: email,
        companyName: "AAMS Enterprise Solutions",
        role: "AssetManager", // default fallback role
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80"
      });
    }
  };

  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signUpName || !signUpEmail || !signUpCompany || !signUpPass) {
      return;
    }
    if (signUpPass !== signUpConfirm) {
      alert("Passwords do not match");
      return;
    }
    setSignUpSuccess(true);
    setTimeout(() => {
      setSignUpSuccess(false);
      // Auto login as newly registered User
      onLoginSuccess({
        name: signUpName,
        email: signUpEmail,
        companyName: signUpCompany,
        role: "AssetManager",
        avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80"
      });
    }, 2000);
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotSuccess(true);
  };

  return (
    <div id="auth_container" className="min-h-screen bg-slate-50 flex flex-col md:flex-row antialiased font-sans">
      {/* Dynamic left decorative panel */}
      <div id="auth_info_panel" className="w-full md:w-5/12 bg-slate-900 text-white flex flex-col justify-between p-8 md:p-12 relative overflow-hidden select-none">
        {/* Subtle geometric circles */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-13 -ml-20 -mb-20"></div>

        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-teal-500 flex items-center justify-center shadow-lg shadow-teal-500/20">
            <Shield className="h-5 w-5 text-slate-900 stroke-[2.5]" />
          </div>
          <span className="font-sans font-bold tracking-tight text-xl text-white">AAMS Enterprise</span>
        </div>

        <div className="my-12">
          {currentView === "login" && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
              <span className="text-teal-400 font-mono tracking-wider font-semibold text-xs uppercase px-2 py-1 bg-teal-400/10 rounded-md">V2.4.0 Live Intelligence</span>
              <h1 className="text-3xl lg:text-4xl font-bold tracking-tight mt-4 mb-3 leading-tight">
                Asset Intelligence, Governance & Control.
              </h1>
              <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
                Unifying financial master books, lease integrity workflows, and auditor controls under a single real-time oversight platform.
              </p>
            </motion.div>
          )}

          {currentView === "signup" && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
              <span className="text-indigo-400 font-mono tracking-wider font-semibold text-xs uppercase px-2 py-1 bg-indigo-400/10 rounded-md">Integrated Ledger</span>
              <h1 className="text-3xl lg:text-4xl font-bold tracking-tight mt-4 mb-3 leading-tight">
                Enterprise Asset Governance — Reimagined.
              </h1>
              <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
                Join our decentralized governance workspace to eliminate asset tracking drift, compliance failure penalty risks, and bookkeeping gaps.
              </p>
            </motion.div>
          )}

          {currentView === "forgot" && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
              <span className="text-amber-400 font-mono tracking-wider font-semibold text-xs uppercase px-2 py-1 bg-amber-400/10 rounded-md">Ledger Recovery</span>
              <h1 className="text-3xl lg:text-4xl font-bold tracking-tight mt-4 mb-3 leading-tight">
                Enterprise Shield Systems
              </h1>
              <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
                Verify credentials using the security gateway registry. All credential reset queues are audited for compliance under Sarbanes-Oxley provisions.
              </p>
            </motion.div>
          )}
        </div>

        <div className="border-t border-slate-800 pt-6">
          <div className="flex items-center gap-4">
            <div className="text-xs font-mono text-slate-500">
              SECURE PLATFORM REGISTRY
            </div>
            <div className="h-1.5 w-1.5 rounded-full bg-teal-400 animate-pulse"></div>
            <div className="text-xs font-mono text-slate-400">
              HTTPS ENGAGED
            </div>
          </div>
        </div>
      </div>

      {/* Main interactive form panel */}
      <div id="auth_form_panel" className="flex-1 flex flex-col justify-center px-6 py-12 md:p-16 lg:p-24 bg-white">
        <div className="max-w-md w-full mx-auto">
          {/* VIEW: LOGIN SCREEN */}
          {currentView === "login" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">Access Portal</h2>
              <p className="text-sm text-slate-500 mt-1 mb-8">Sign in to your enterprise governance account</p>

              {loginError && (
                <div id="login_error" className="p-3 mb-4 bg-rose-50 text-rose-700 text-xs rounded-lg border border-rose-100 flex items-center gap-2">
                  <span className="font-semibold">Error:</span> {loginError}
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 uppercase tracking-wider mb-1.5">Work Email Address</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <User className="h-4 w-4" />
                    </span>
                    <input
                      id="login_email"
                      type="text"
                      placeholder="e.g. m.thorne@aams-governance.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full text-sm pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-medium text-slate-700 uppercase tracking-wider">Password</label>
                    <button
                      id="forgot_password_trigger"
                      type="button"
                      onClick={() => {
                        setLoginError("");
                        setCurrentView("forgot");
                      }}
                      className="text-xs font-medium text-teal-600 hover:text-teal-700"
                    >
                      Forgot?
                    </button>
                  </div>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <Key className="h-4 w-4" />
                    </span>
                    <input
                      id="login_password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full text-sm pl-10 pr-10 py-2.5 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    id="login_btn"
                    type="submit"
                    className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg text-sm transition-all duration-150 flex items-center justify-center gap-2 hover:shadow-md cursor-pointer"
                  >
                    Authenticate Credentials
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </form>

              {/* Identity Quick Switch Selector */}
              <div id="quick_switch_identity_registry" className="mt-8 pt-8 border-t border-slate-100">
                <span className="block text-xs font-mono font-bold uppercase text-slate-400 tracking-widest mb-3">
                  Enterprise Role Gateways (Instant Simulator Access)
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {ROLE_PRESETS.map((preset) => (
                    <button
                      key={preset.email}
                      type="button"
                      onClick={() => handlePresetSelect(preset)}
                      className={`flex items-center gap-2.5 p-2 rounded-lg border text-left transition-all hover:bg-slate-100 hover:scale-[1.01] hover:shadow-sm ${preset.color} cursor-pointer`}
                    >
                      <img src={preset.avatar} alt={preset.name} className="h-7 w-7 rounded-full object-cover border border-slate-200" />
                      <div>
                        <p className="text-xs font-bold text-slate-800 leading-snug">{preset.name}</p>
                        <p className="text-[10px] text-slate-500 leading-none">{preset.title}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sign up toggle */}
              <div className="mt-6 text-center text-xs text-slate-400">
                New to the governance registry?{" "}
                <button
                  id="signup_portal_link"
                  type="button"
                  onClick={() => {
                    setLoginError("");
                    setCurrentView("signup");
                  }}
                  className="font-medium text-teal-600 hover:text-teal-700 underline"
                >
                  Create your account
                </button>
              </div>
            </motion.div>
          )}

          {/* VIEW: RECOVERY SCREEN */}
          {currentView === "forgot" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">Forgot Password?</h2>
              <p className="text-sm text-slate-500 mt-1 mb-6">
                Enter the work email address linked to your user account and we'll transmit a secure ledger recovery code.
              </p>

              {forgotSuccess ? (
                <div id="forgot_success_modal" className="p-4 bg-teal-50 border border-teal-100 rounded-xl space-y-3">
                  <div className="h-10 w-10 bg-teal-100 rounded-full flex items-center justify-center">
                    <UserCheck className="h-5 w-5 text-teal-600" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">Reset Transmission Complete</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    A security token has been dispatched to <strong className="font-semibold text-slate-900">{forgotEmail}</strong>. Verification must occur within 15 minutes.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotSuccess(false);
                      setCurrentView("login");
                    }}
                    className="mt-2 text-xs font-bold text-teal-600 hover:text-teal-700"
                  >
                    Return to Portal Login
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 uppercase tracking-wider mb-1.5">Registered Work Email</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                        <User className="h-4 w-4" />
                      </span>
                      <input
                        id="forgot_email"
                        type="email"
                        required
                        placeholder="e.g. m.thorne@aams-governance.com"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        className="w-full text-sm pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      id="forgot_submit_btn"
                      type="submit"
                      className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg text-sm transition-all duration-150 rounded-lg text-sm font-medium"
                    >
                      Transmit Reset Secure Link
                    </button>
                  </div>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setCurrentView("login")}
                      className="text-xs font-medium text-slate-500 hover:text-slate-800 mt-2"
                    >
                      Cancel and Return
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          )}

          {/* VIEW: SIGN UP SCREEN */}
          {currentView === "signup" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">Create your account</h2>
              <p className="text-sm text-slate-500 mt-1 mb-6">Join the governance ecosystem for enterprise efficiency.</p>

              {signUpSuccess ? (
                <div id="signup_success_notification" className="p-4 bg-teal-50 border border-teal-100 rounded-xl flex flex-col items-center text-center space-y-2">
                  <div className="h-10 w-10 bg-teal-100 rounded-full flex items-center justify-center animate-bounce">
                    <Shield className="h-5 w-5 text-teal-600" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800">Account Verified</h3>
                  <p className="text-xs text-slate-600">
                    Your institutional record was written to the directory. Booting default workspace console...
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSignUpSubmit} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 uppercase tracking-wider mb-1.5">Full Name</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                        <User className="h-4 w-4" />
                      </span>
                      <input
                        id="signup_name"
                        type="text"
                        required
                        placeholder="Marcus Thorne"
                        value={signUpName}
                        onChange={(e) => setSignUpName(e.target.value)}
                        className="w-full text-sm pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 uppercase tracking-wider mb-1.5">Work Email Address</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                        <User className="h-4 w-4" />
                      </span>
                      <input
                        id="signup_email"
                        type="email"
                        required
                        placeholder="m.thorne@company.com"
                        value={signUpEmail}
                        onChange={(e) => setSignUpEmail(e.target.value)}
                        className="w-full text-sm pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 uppercase tracking-wider mb-1.5">Company / Institution Name</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                        <Building2 className="h-4 w-4" />
                      </span>
                      <input
                        id="signup_company"
                        type="text"
                        required
                        placeholder="AAMS Enterprise Solutions"
                        value={signUpCompany}
                        onChange={(e) => setSignUpCompany(e.target.value)}
                        className="w-full text-sm pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 uppercase tracking-wider mb-1.5">Password</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                        <Key className="h-4 w-4" />
                      </span>
                      <input
                        id="signup_password"
                        type="password"
                        required
                        placeholder="••••••••"
                        value={signUpPass}
                        onChange={(e) => setSignUpPass(e.target.value)}
                        className="w-full text-sm pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 uppercase tracking-wider mb-1.5">Confirm Password</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                        <Key className="h-4 w-4" />
                      </span>
                      <input
                        id="signup_confirm_password"
                        type="password"
                        required
                        placeholder="••••••••"
                        value={signUpConfirm}
                        onChange={(e) => setSignUpConfirm(e.target.value)}
                        className="w-full text-sm pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      id="signup_btn"
                      type="submit"
                      className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg text-sm transition-all duration-150 rounded-lg text-sm font-medium"
                    >
                      Verify and Open Workspace
                    </button>
                  </div>

                  <div className="text-center text-xs text-slate-500">
                    Already registered?{" "}
                    <button
                      type="button"
                      onClick={() => setCurrentView("login")}
                      className="font-medium text-teal-600 hover:text-teal-700 underline"
                    >
                      Sign In here
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
