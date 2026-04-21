import { useEffect, useState } from "react";
import {
  Mail,
  User,
  Lock,
  Trash2,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Save,
  X,
} from "lucide-react";
import heroBg from "../../assets/hero-bg.jpg";
import { apiCall } from "../../api/config";

// ── Moved outside SettingsPage so they never remount on parent re-render ──

const inputClass = (hasError) =>
  `w-full px-3 py-2 text-sm rounded-md border ${
    hasError ? "border-red-400" : "border-[#c8b99a]"
  } bg-[#f5ecd7] text-[#2d2a1e] placeholder-[#9a8c6e] focus:outline-none focus:ring-2 focus:ring-[#4a6a1e] focus:border-transparent transition-all`;

const Row = ({ icon: Icon, label, value, sectionKey, activeSection, onToggle, children, editLabel = "Edit" }) => (
  <div className="bg-[#f0e6ce] border border-[#c8b99a] rounded-xl overflow-hidden">
    <div className="flex items-center justify-between px-5 py-4">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-[#3a5a12] flex items-center justify-center flex-shrink-0">
          <Icon className="w-4 h-4 text-[#d4e8a0]" />
        </div>
        <div>
          <p className="text-xs font-semibold text-[#6b5a3a] uppercase tracking-widest">{label}</p>
          <p className="text-sm font-bold text-[#2d2a1e] mt-0.5">{value}</p>
        </div>
      </div>
      <button
        onClick={() => onToggle(sectionKey)}
        className="px-4 py-1.5 text-xs font-bold uppercase tracking-wide rounded-lg bg-[#3a5a12] text-[#d4e8a0] hover:bg-[#2d4710] transition-colors"
      >
        {editLabel}
      </button>
    </div>
    {activeSection === sectionKey && (
      <div className="px-5 pb-5 pt-1 border-t border-[#c8b99a] bg-[#eadec5]">
        {children}
      </div>
    )}
  </div>
);

const SaveBar = ({ onCancel, label = "Save Changes", icon: Icon = Save, isLoading }) => (
  <div className="flex gap-2 mt-3">
    <button
      type="submit"
      disabled={isLoading}
      className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wide bg-[#3a5a12] text-[#d4e8a0] rounded-lg hover:bg-[#2d4710] disabled:opacity-50 transition-colors"
    >
      {isLoading ? (
        <div className="w-3.5 h-3.5 border-2 border-[#d4e8a0] border-t-transparent rounded-full animate-spin" />
      ) : (
        <Icon className="w-3.5 h-3.5" />
      )}
      {isLoading ? "Saving..." : label}
    </button>
    <button
      type="button"
      onClick={onCancel}
      className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wide bg-[#c8b99a] text-[#4a3a1e] rounded-lg hover:bg-[#b8a98a] transition-colors"
    >
      <X className="w-3.5 h-3.5" />
      Cancel
    </button>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────

const SettingsPage = () => {
  const [activeSection, setActiveSection] = useState(null);
  const [formData, setFormData] = useState({
    newEmail: "",
    confirmEmail: "",
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
  });

  useEffect(() => {
    const loadAccount = async () => {
      try {
        setIsBootstrapping(true);
        const response = await apiCall("/api/account/me");
        const account = response?.data ?? {};
        setUserData({
          firstName: account.first_name ?? "",
          lastName: account.last_name ?? "",
          username: account.username ?? "",
          email: account.email ?? "",
        });
      } catch (error) {
        setErrors({ account: error.message || "Failed to load account info." });
      } finally {
        setIsBootstrapping(false);
      }
    };

    loadAccount();
  }, []);

  const handleToggle = (sectionKey) => {
    setActiveSection((prev) => (prev === sectionKey ? null : sectionKey));
    setErrors({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleChangeEmail = async (e) => {
    e.preventDefault();
    const { newEmail, confirmEmail } = formData;
    if (!newEmail || !confirmEmail) return setErrors({ email: "Both email fields are required" });
    if (newEmail !== confirmEmail) return setErrors({ email: "Emails do not match" });
    if (!validateEmail(newEmail)) return setErrors({ email: "Please enter a valid email address" });
    if (newEmail === userData.email) return setErrors({ email: "New email must be different from current email" });
    setIsLoading(true);
    try {
      const response = await apiCall("/api/account/me", {
        method: "PUT",
        body: JSON.stringify({ email: newEmail.trim() }),
      });
      const account = response?.data ?? {};
      setUserData((prev) => ({ ...prev, email: account.email ?? newEmail.trim() }));
      setSuccessMessage(`Email changed to: ${account.email ?? newEmail.trim()}`);
      setFormData((prev) => ({ ...prev, newEmail: "", confirmEmail: "" }));
      setActiveSection(null);
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      setErrors({ email: error.message || "Failed to change email." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    const { currentPassword, newPassword, confirmNewPassword } = formData;
    if (!currentPassword || !newPassword || !confirmNewPassword)
      return setErrors({ password: "All password fields are required" });
    if (newPassword !== confirmNewPassword) return setErrors({ password: "New passwords do not match" });
    if (newPassword.length < 6) return setErrors({ password: "Password must be at least 6 characters" });
    if (newPassword === currentPassword) return setErrors({ password: "New password must be different from current password" });
    setIsLoading(true);
    try {
      await apiCall("/api/account/me", {
        method: "PUT",
        body: JSON.stringify({ newPassword }),
      });
      setSuccessMessage("Password changed successfully!");
      setFormData((prev) => ({ ...prev, currentPassword: "", newPassword: "", confirmNewPassword: "" }));
      setActiveSection(null);
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      setErrors({ password: error.message || "Failed to change password." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateIdentity = async (field, value) => {
    if (!value.trim()) return setErrors({ [field]: `${field} cannot be empty` });
    if (value.length < 2) return setErrors({ [field]: `${field} must be at least 2 characters` });
    setIsLoading(true);
    try {
      let payload = {};
      if (field === "firstName") payload = { firstName: value.trim() };
      if (field === "lastName") payload = { lastName: value.trim() };
      if (field === "username") payload = { username: value.trim() };
      const response = await apiCall("/api/account/me", {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      const account = response?.data ?? {};
      setUserData({
        firstName: account.first_name ?? "",
        lastName: account.last_name ?? "",
        username: account.username ?? "",
        email: account.email ?? "",
      });
      if (field === "username") {
        setSuccessMessage("Username updated!");
      } else {
        setSuccessMessage(`${field === "firstName" ? "First" : "Last"} name updated!`);
      }
      setActiveSection(null);
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      setErrors({ [field]: error.message || "Failed to update profile field." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    if (showDeleteConfirm) {
      setIsLoading(true);
      setTimeout(() => {
        alert("Account deleted successfully");
        setShowDeleteConfirm(false);
        setActiveSection(null);
        setIsLoading(false);
      }, 500);
    } else {
      setShowDeleteConfirm(true);
    }
  };

  const togglePasswordVisibility = (field) =>
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));

  const cancelSection = () => { setActiveSection(null); setErrors({}); };

  return (
    <div className="mx-4 md:mx-8 mt-6 pb-12">
      <div>

        {/* Success Toast */}
        {successMessage && (
          <div className="fixed top-5 right-5 z-50 flex items-center gap-3 bg-[#3a5a12] text-[#d4e8a0] px-4 py-3 rounded-xl shadow-xl border border-[#2d4710] animate-slide-in">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm font-semibold">{successMessage}</span>
            <button onClick={() => setSuccessMessage("")}>
              <X className="w-4 h-4 opacity-70 hover:opacity-100" />
            </button>
          </div>
        )}

        {/* Hero Header — untouched */}
        <div
          className="relative rounded-2xl shadow-xl overflow-hidden px-8 py-7 mb-8 flex items-center gap-5"
          style={{ backgroundImage: `url(${heroBg})`, backgroundSize: "cover", backgroundPosition: "center" }}
        >
          <div className="absolute inset-0 bg-[#1e3a0f]/70 rounded-2xl" />
          <div className="relative flex items-center gap-5">
            <div>
              <h1 className="text-[#F0E6D1] font-extrabold text-2xl md:text-3xl tracking-wide uppercase leading-tight">
                Account Settings
              </h1>
              <p className="text-[#B5D098] text-sm mt-1">
                Manage your account preferences and personal information
              </p>
            </div>
          </div>
        </div>

        {errors.account && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errors.account}
          </div>
        )}

        {isBootstrapping ? (
          <div className="mb-4 rounded-xl border border-[#c8b99a] bg-[#f0e6ce] px-4 py-3 text-sm text-[#4a3a1e]">
            Loading account settings...
          </div>
        ) : null}

        {/* Account Settings Card */}
        <div className="bg-[#587A34] rounded-2xl border-2 border-[#587A34] overflow-hidden mb-4 shadow-lg">
          <div className="p-4 space-y-3">

            <Row icon={User} label="First Name" value={userData.firstName} sectionKey="firstName" activeSection={activeSection} onToggle={handleToggle}>
              <input
                type="text"
                placeholder="Enter new first name"
                defaultValue={userData.firstName}
                className={inputClass(errors.firstName)}
                style={{ marginTop: "12px" }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleUpdateIdentity("firstName", e.target.value);
                }}
              />
              {errors.firstName && (
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <XCircle className="w-3 h-3" /> {errors.firstName}
                </p>
              )}
              <p className="text-xs text-[#6b5a3a] mt-1">Press Enter to save</p>
            </Row>

            <Row icon={User} label="Last Name" value={userData.lastName} sectionKey="lastName" activeSection={activeSection} onToggle={handleToggle}>
              <input
                type="text"
                placeholder="Enter new last name"
                defaultValue={userData.lastName}
                className={inputClass(errors.lastName)}
                style={{ marginTop: "12px" }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleUpdateIdentity("lastName", e.target.value);
                }}
              />
              {errors.lastName && (
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <XCircle className="w-3 h-3" /> {errors.lastName}
                </p>
              )}
              <p className="text-xs text-[#6b5a3a] mt-1">Press Enter to save</p>
            </Row>

            <Row icon={User} label="Username" value={userData.username} sectionKey="username" activeSection={activeSection} onToggle={handleToggle}>
              <input
                type="text"
                placeholder="Enter new username"
                defaultValue={userData.username}
                className={inputClass(errors.username)}
                style={{ marginTop: "12px" }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleUpdateIdentity("username", e.target.value);
                }}
              />
              {errors.username && (
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <XCircle className="w-3 h-3" /> {errors.username}
                </p>
              )}
              <p className="text-xs text-[#6b5a3a] mt-1">Press Enter to save</p>
            </Row>

            <Row icon={Mail} label="Email Address" value={userData.email} sectionKey="email" activeSection={activeSection} onToggle={handleToggle}>
              <form onSubmit={handleChangeEmail} className="space-y-2 mt-3">
                <input
                  type="email"
                  name="newEmail"
                  placeholder="New email address"
                  value={formData.newEmail}
                  onChange={handleInputChange}
                  className={inputClass(errors.email)}
                />
                <input
                  type="email"
                  name="confirmEmail"
                  placeholder="Confirm new email"
                  value={formData.confirmEmail}
                  onChange={handleInputChange}
                  className={inputClass(errors.email)}
                />
                {errors.email && (
                  <p className="text-xs text-red-600 flex items-center gap-1">
                    <XCircle className="w-3 h-3" /> {errors.email}
                  </p>
                )}
                <SaveBar label="Save Changes" icon={Save} onCancel={cancelSection} isLoading={isLoading} />
              </form>
            </Row>

            <Row icon={Lock} label="Password" value="••••••••••" sectionKey="password" activeSection={activeSection} onToggle={handleToggle} editLabel="Change">
              <form onSubmit={handleChangePassword} className="space-y-2 mt-3">
                {[
                  { field: "current", name: "currentPassword", placeholder: "Current password" },
                  { field: "new", name: "newPassword", placeholder: "New password" },
                  { field: "confirm", name: "confirmNewPassword", placeholder: "Confirm new password" },
                ].map(({ field, name, placeholder }) => (
                  <div key={field} className="relative">
                    <input
                      type={showPassword[field] ? "text" : "password"}
                      name={name}
                      placeholder={placeholder}
                      value={formData[name]}
                      onChange={handleInputChange}
                      className={`${inputClass(errors.password)} pr-10`}
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility(field)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b5a3a] hover:text-[#2d2a1e]"
                    >
                      {showPassword[field] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                ))}
                {errors.password && (
                  <p className="text-xs text-red-600 flex items-center gap-1">
                    <XCircle className="w-3 h-3" /> {errors.password}
                  </p>
                )}
                <SaveBar label="Update Password" icon={Lock} onCancel={cancelSection} isLoading={isLoading} />
              </form>
            </Row>

          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 border-t-2 border-dashed border-[#4a6a1e]" />
          <span className="text-xs font-black uppercase tracking-widest text-[#3a5a12]">Danger Zone</span>
          <div className="flex-1 border-t-2 border-dashed border-[#4a6a1e]" />
        </div>

        {/* Delete Account */}
        <div className="bg-[#f0e6ce] border-2 border-red-400 rounded-2xl overflow-hidden shadow-md">
          <div className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-red-600">Delete Account</p>
                <p className="text-xs text-[#6b5a3a] mt-0.5">Permanently delete your account and all associated data</p>
              </div>
            </div>
            <button
              onClick={() => handleToggle("delete")}
              className="px-4 py-1.5 text-xs font-black uppercase tracking-wide rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
            >
              Delete
            </button>
          </div>

          {activeSection === "delete" && (
            <div className="px-5 pb-5 pt-1 border-t border-red-200 bg-red-50">
              {!showDeleteConfirm ? (
                <>
                  <div className="flex items-start gap-3 p-3 bg-red-100 border border-red-200 rounded-lg mt-3 mb-3">
                    <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-red-700 font-semibold leading-relaxed">
                      Warning: This action is permanent and cannot be undone. All your recipes, favorites, and personal data will be permanently deleted.
                    </p>
                  </div>
                  <button
                    onClick={handleDeleteAccount}
                    className="flex items-center gap-2 px-4 py-2 text-xs font-black uppercase tracking-wide bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Yes, Delete My Account
                  </button>
                </>
              ) : (
                <div className="space-y-3 mt-3">
                  <div className="p-3 bg-red-100 border border-red-200 rounded-lg">
                    <p className="text-xs font-bold text-red-800 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Are you absolutely sure? This action cannot be undone.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleDeleteAccount}
                      disabled={isLoading}
                      className="flex items-center gap-2 px-4 py-2 text-xs font-black uppercase tracking-wide bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                    >
                      {isLoading ? (
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                      {isLoading ? "Deleting..." : "Yes, Permanently Delete"}
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs font-black uppercase tracking-wide bg-[#c8b99a] text-[#4a3a1e] rounded-lg hover:bg-[#b8a98a] transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

      </div>

      <style>{`
        @keyframes slide-in {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in { animation: slide-in 0.3s ease-out; }
      `}</style>
    </div>
  );
};

export default SettingsPage;