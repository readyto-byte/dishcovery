import { useEffect, useState } from "react";
import {Mail,User,Lock,Trash2,Eye,EyeOff,CheckCircle,XCircle,AlertTriangle,Save,X,Check} from "lucide-react";
import heroBg from "../../assets/hero-bg.jpg";
import { apiCall } from "../../api/config";

const NAME_ALLOWED_REGEX = /^[A-Za-z]+(?:[ '\-][A-Za-z]+)*$/;

const truncateEmail = (email, maxLength = 20) => {
  if (!email) return "";
  if (email.length <= maxLength) return email;
  
  const [localPart, domain] = email.split('@');
  if (!domain) return email.slice(0, maxLength) + "...";
  
  const maxLocalLength = maxLength - 4 - domain.length; // 4 for "...@"
  if (maxLocalLength <= 0) return email.slice(0, maxLength) + "...";
  
  const truncatedLocal = localPart.slice(0, maxLocalLength);
  return `${truncatedLocal}...@${domain}`;
};

const inputClass = (hasError) =>
  `w-full px-3 py-2 text-sm rounded-md border ${
    hasError ? "border-red-400" : "border-[#c8b99a]"
  } bg-[#f5ecd7] text-[#2d2a1e] placeholder-[#9a8c6e] focus:outline-none focus:ring-2 focus:ring-[#4a6a1e] focus:border-transparent transition-all`;

const Row = ({ icon: Icon, label, value, sectionKey, activeSection, onToggle, children, editLabel = "Edit" }) => {

  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640); // sm breakpoint
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  const displayValue = isMobile && label === "Email Address" ? truncateEmail(value) : value;
  
  return (
    <div className="bg-[#f0e6ce] border border-[#c8b99a] rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-8 h-8 rounded-full bg-[#3a5a12] flex items-center justify-center flex-shrink-0">
            <Icon className="w-4 h-4 text-[#d4e8a0]" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-[#6b5a3a] uppercase tracking-widest">{label}</p>
            <p className="text-sm font-bold text-[#2d2a1e] mt-0.5 truncate" title={label === "Email Address" ? value : ""}>
              {displayValue}
            </p>
          </div>
        </div>
        <button
          onClick={() => onToggle(sectionKey)}
          className="px-4 py-1.5 text-xs font-bold uppercase tracking-wide rounded-lg bg-[#3a5a12] text-[#d4e8a0] hover:bg-[#2d4710] transition-colors flex-shrink-0"
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
};

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


const SuccessModal = ({ onClose }) => (
  <>
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={onClose} />
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-slide-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-1.5 w-full bg-gradient-to-r from-red-500 to-red-700" />
        <div className="bg-[#f7f0e3] px-7 pt-7 pb-6 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <Trash2 className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-[#1B211A] mb-2">Account Deleted</h2>
          <p className="text-[#4a5e30] text-sm leading-relaxed mb-6">
            Your account has been successfully deleted. All your data has been permanently removed.
          </p>
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-[#32491B] hover:bg-[#253813] text-[#F0E6D1] font-semibold text-sm transition-all duration-200 shadow-md cursor-pointer"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  </>
);


const ConfirmDeleteModal = ({ onConfirm, onCancel, isLoading, deletePassword, setDeletePassword, showDeletePassword, setShowDeletePassword, error }) => (
  <>
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-1.5 w-full bg-gradient-to-r from-red-500 to-red-700" />
        <div className="bg-[#f7f0e3] px-7 pt-7 pb-6">
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-7 h-7 text-red-600" />
            </div>
          </div>
          <h2 className="text-center font-bold text-[#1B211A] text-xl mb-2">Delete Account?</h2>
          <p className="text-center text-[#4a5e30] text-sm leading-relaxed mb-4">
            This action is <span className="font-bold text-red-600">permanent</span> and cannot be undone. All your recipes, favorites, and personal data will be deleted forever.
          </p>
          
          <div className="relative mt-4 mb-3">
            <input
              type={showDeletePassword ? "text" : "password"}
              placeholder="Enter your password to confirm"
              value={deletePassword}
              onChange={(e) => {
                setDeletePassword(e.target.value);
              }}
              className={`${inputClass(error)} pr-10 w-full`}
            />
            <button
              type="button"
              onClick={() => setShowDeletePassword(!showDeletePassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b5a3a] hover:text-[#2d2a1e]"
            >
              {showDeletePassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          
          {error && (
            <p className="text-xs text-red-600 flex items-center gap-1 mb-3">
              <XCircle className="w-3 h-3" /> {error}
            </p>
          )}
          
          <div className="flex gap-3 mt-4">
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1 py-3 rounded-xl border border-[#32491B]/20 bg-white/50 hover:bg-white/80 text-[#32491B] font-semibold text-sm transition-all duration-200 cursor-pointer disabled:opacity-40"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading || !deletePassword.trim()}
              className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition-all duration-200 shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Deleting...
                </div>
              ) : (
                "Yes, Delete Forever"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  </>
);

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
  const [showDeleteSuccessModal, setShowDeleteSuccessModal] = useState(false);
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [deletePassword, setDeletePassword] = useState("");
  const [showDeletePassword, setShowDeletePassword] = useState(false);
  const [newPasswordTouched, setNewPasswordTouched] = useState(false);
  const [confirmNewPasswordTouched, setConfirmNewPasswordTouched] = useState(false);

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

  const pwChecks = {
    length:    formData.newPassword.length >= 6,
    uppercase: /[A-Z]/.test(formData.newPassword),
    lowercase: /[a-z]/.test(formData.newPassword),
    number:    /\d/.test(formData.newPassword),
    special:   /[!@#$%^&*()_=+[\]{}|;':",.<>?/`~\\-]/.test(formData.newPassword),
  };
  const newPasswordValid = Object.values(pwChecks).every(Boolean);
  const newPasswordsMatch = formData.confirmNewPassword.length > 0 && formData.confirmNewPassword === formData.newPassword;

  const pwCheckItems = [
    { key: "length",    label: "At least 6 characters" },
    { key: "uppercase", label: "One uppercase (A–Z)" },
    { key: "lowercase", label: "One lowercase (a–z)" },
    { key: "number",    label: "One number (0–9)" },
    { key: "special",   label: "One special character" },
  ];

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
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_=+[\]{}|;':",.<>?/`~\\-]).{6,}$/;
    if (!passwordRegex.test(newPassword)) {
      return setErrors({ password: "Password must be at least 6 characters and include an uppercase letter, a lowercase letter, a number, and a special character." });
    }
    if (newPassword === currentPassword) return setErrors({ password: "New password must be different from current password" });
    setIsLoading(true);
    try {
      await apiCall("/api/account/me", {
        method: "PUT",
        body: JSON.stringify({ currentPassword, newPassword }),
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
    if ((field === "firstName" || field === "lastName") && !NAME_ALLOWED_REGEX.test(value.trim())) {
      return setErrors({ [field]: "Name must contain letters only (spaces, hyphens, and apostrophes are allowed)." });
    }
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

  const handleDeleteAccount = async () => {
    if (!deletePassword.trim()) {
      setErrors({ delete: "Please enter your password to confirm." });
      return;
    }

    setIsLoading(true);
    try {
      await apiCall("/api/account/me", { method: "DELETE" });

      setShowDeleteConfirm(false);
      setShowDeleteSuccessModal(true);
      setDeletePassword("");

      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('dishcovery_first_time_modal_seen');
    } catch (error) {
      setErrors({ delete: error.message || "Failed to delete account." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccessModalClose = () => {
    setShowDeleteSuccessModal(false);
    window.location.href = "/";
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
    setActiveSection(null);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setDeletePassword("");
    setErrors({});
  };

  const togglePasswordVisibility = (field) =>
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));

  const cancelSection = () => { setActiveSection(null); setErrors({}); setNewPasswordTouched(false); setConfirmNewPasswordTouched(false); };

  return (
    <div className="mx-4 md:mx-8 mt-6 pb-12">
      <div>

        {successMessage && (
          <div className="fixed top-5 right-5 z-50 flex items-center gap-3 bg-[#3a5a12] text-[#d4e8a0] px-4 py-3 rounded-xl shadow-xl border border-[#2d4710] animate-slide-in">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm font-semibold">{successMessage}</span>
            <button onClick={() => setSuccessMessage("")}>
              <X className="w-4 h-4 opacity-70 hover:opacity-100" />
            </button>
          </div>
        )}

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
                {/* Current Password */}
                <div className="relative">
                  <input
                    type={showPassword.current ? "text" : "password"}
                    name="currentPassword"
                    placeholder="Current password"
                    value={formData.currentPassword}
                    onChange={handleInputChange}
                    className={`${inputClass(errors.password)} pr-10`}
                  />
                  <button type="button" onClick={() => togglePasswordVisibility("current")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b5a3a] hover:text-[#2d2a1e]">
                    {showPassword.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* New Password + Checklist */}
                <div>
                  <div className="relative">
                    <input
                      type={showPassword.new ? "text" : "password"}
                      name="newPassword"
                      placeholder="New password"
                      value={formData.newPassword}
                      onChange={(e) => { handleInputChange(e); setNewPasswordTouched(true); }}
                      className={`${inputClass(newPasswordTouched && !newPasswordValid)} pr-10`}
                    />
                    <button type="button" onClick={() => togglePasswordVisibility("new")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b5a3a] hover:text-[#2d2a1e]">
                      {showPassword.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {newPasswordTouched && (
                    <ul className="mt-1.5 grid grid-cols-2 gap-x-2 gap-y-0.5 pl-1">
                      {pwCheckItems.map(({ key, label }) => (
                        <li key={key} className={`flex items-center gap-1 text-xs ${pwChecks[key] ? "text-green-700" : "text-[#9a8c6e]"}`}>
                          <span className={`flex-shrink-0 w-3 h-3 rounded-full flex items-center justify-center ${pwChecks[key] ? "bg-green-100" : "bg-[#d4c9a8]"}`}>
                            {pwChecks[key] ? <Check size={8} strokeWidth={3} /> : <span className="w-1 h-1 rounded-full bg-[#9a8c6e] block" />}
                          </span>
                          {label}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Confirm New Password + Match indicator */}
                <div>
                  <div className="relative">
                    <input
                      type={showPassword.confirm ? "text" : "password"}
                      name="confirmNewPassword"
                      placeholder="Confirm new password"
                      value={formData.confirmNewPassword}
                      onChange={(e) => { handleInputChange(e); setConfirmNewPasswordTouched(true); }}
                      className={`${inputClass(confirmNewPasswordTouched && formData.confirmNewPassword && !newPasswordsMatch)} pr-10`}
                    />
                    <button type="button" onClick={() => togglePasswordVisibility("confirm")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b5a3a] hover:text-[#2d2a1e]">
                      {showPassword.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {confirmNewPasswordTouched && formData.confirmNewPassword && (
                    <p className={`mt-1 text-xs pl-1 flex items-center gap-1 ${newPasswordsMatch ? "text-green-700" : "text-red-500"}`}>
                      {newPasswordsMatch
                        ? <><Check size={10} strokeWidth={3} /> Passwords match</>
                        : <><span className="font-bold">✕</span> Passwords do not match</>}
                    </p>
                  )}
                </div>

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

        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 border-t-2 border-dashed border-[#4a6a1e]" />
          <span className="text-xs font-black uppercase tracking-widest text-[#3a5a12]">Danger Zone</span>
          <div className="flex-1 border-t-2 border-dashed border-[#4a6a1e]" />
        </div>

        <div className="bg-[#f0e6ce] border-2 border-red-300 rounded-2xl overflow-hidden shadow-md">
          <div className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-red-400 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-red-400">Delete Account</p>
                <p className="text-xs text-[#6b5a3a] mt-0.5">Permanently delete your account and all associated data</p>
              </div>
            </div>
            <button
              onClick={handleDeleteClick}
              className="px-4 py-1.5 text-xs font-black uppercase tracking-wide rounded-lg bg-red-400 text-white hover:bg-red-500 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>

      </div>

      {showDeleteConfirm && (
        <ConfirmDeleteModal
          onConfirm={handleDeleteAccount}
          onCancel={cancelDelete}
          isLoading={isLoading}
          deletePassword={deletePassword}
          setDeletePassword={setDeletePassword}
          showDeletePassword={showDeletePassword}
          setShowDeletePassword={setShowDeletePassword}
          error={errors.delete}
        />
      )}

      {showDeleteSuccessModal && (
        <SuccessModal onClose={handleSuccessModalClose} />
      )}

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

