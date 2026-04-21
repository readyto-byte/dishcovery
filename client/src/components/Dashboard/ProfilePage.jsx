import { useEffect, useState, useRef } from "react";
import heroBg from "../../assets/hero-bg.jpg";
import { apiCall } from "../../api/config";

const DIETARY_OPTIONS = ["Keto", "Gluten-Free", "Vegan", "Vegetarian", "Paleo", "Dairy-Free"];
const ALLERGY_OPTIONS = ["Nuts", "Shellfish", "Eggs", "Soy", "Wheat", "Fish"];

const Avatar = ({ name, avatar, size = "lg" }) => {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const sizeClass = size === "lg" ? "w-16 h-16 text-xl" : "w-10 h-10 text-sm";

  if (avatar) {
    return (
      <img
        src={avatar}
        alt={name}
        className={`${sizeClass} rounded-full object-cover shadow-inner border-2 border-[#3a5220]`}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} rounded-full bg-[#3a5220] flex items-center justify-center text-[#F0E6D1] font-bold shadow-inner`}
    >
      {initials}
    </div>
  );
};

const AvatarUpload = ({ name, avatar, onAvatarChange }) => {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => onAvatarChange(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    onAvatarChange(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative group">
        <Avatar name={name || "?"} avatar={avatar} size="lg" />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          title="Change photo"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-3 py-1 rounded-full bg-[#587A34] text-white text-xs font-semibold hover:bg-[#3a5220] transition-colors"
        >
          {avatar ? "Change Photo" : "Upload Photo"}
        </button>
        {avatar && (
          <button
            onClick={handleRemove}
            className="px-3 py-1 rounded-full bg-red-100 text-red-500 text-xs font-semibold hover:bg-red-200 transition-colors"
          >
            Remove
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};

const CustomTagInput = ({ onAdd, placeholder, accentClass }) => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const inputRef = useRef(null);

  const handleOpen = () => {
    setOpen(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const commit = () => {
    const trimmed = value.trim();
    if (trimmed) onAdd(trimmed);
    setValue("");
    setOpen(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") commit();
    if (e.key === "Escape") { setValue(""); setOpen(false); }
  };

  if (!open) {
    return (
      <button
        onClick={handleOpen}
        className={"mt-2 px-3 py-1 rounded-full border text-xs font-semibold flex items-center gap-1 hover:opacity-80 transition-opacity " + accentClass}
      >
        <span className="text-sm leading-none">+</span> Add
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2 mt-2">
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={commit}
        placeholder={placeholder}
        className="w-40 bg-white border border-[#587A34]/30 rounded-full px-3 py-1 text-[#3a5220] text-xs focus:outline-none focus:ring-2 focus:ring-[#587A34]/40"
      />
    </div>
  );
};

/* ── Delete Confirmation Modal ───────────────────────────────────────── */
const DeleteConfirmModal = ({ profileName, onConfirm, onCancel, isDeleting }) => (
  <>
    <div
      className="fixed inset-0 z-50 bg-black/10 backdrop-blur-md"
      onClick={!isDeleting ? onCancel : undefined}
    />
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div
        className="pointer-events-auto mx-4 w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #f7f0e3 0%, #ede0c4 100%)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Top accent bar — red to signal danger */}
        <div className="h-1 w-full bg-gradient-to-r from-red-400 via-red-500 to-red-400" />

        <div className="px-7 pt-7 pb-6">
          {/* Icon */}
          <div className="flex justify-center mb-5">
            <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center shadow-inner">
              {isDeleting ? (
                <svg className="animate-spin w-6 h-6 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              )}
            </div>
          </div>

          {/* Text */}
          <h2 className="text-center font-bold text-[#1B211A] text-xl mb-2 tracking-tight">
            {isDeleting ? 'Deleting...' : 'Delete Profile?'}
          </h2>
          <p className="text-center text-[#4a5e30] text-sm leading-relaxed mb-7">
            {isDeleting
              ? 'Please wait while we remove this profile.'
              : <>This will permanently delete <span className="font-semibold text-[#32491B]">{profileName}</span>. This action cannot be undone.</>
            }
          </p>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-[#B5D098] to-transparent mb-6" />

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              disabled={isDeleting}
              className="flex-1 py-3 rounded-xl border border-[#32491B]/20 bg-white/50 hover:bg-white/80 text-[#32491B] font-semibold text-sm tracking-wide transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold text-sm tracking-wide transition-all duration-200 shadow-md cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Yes, Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  </>
);

const ProfileModal = ({ profile, onSave, onClose }) => {
  const [name, setName] = useState(profile?.name || "");
  const [dateOfBirth, setDateOfBirth] = useState(profile?.dateOfBirth || "");
  const [avatar, setAvatar] = useState(profile?.avatar || null);
  const [dietary, setDietary] = useState(profile?.dietaryRestrictions || []);
  const [allergies, setAllergies] = useState(profile?.allergies || []);
  const [formError, setFormError] = useState("");

  const toggle = (list, setList, val) => {
    setList((prev) =>
      prev.includes(val) ? prev.filter((x) => x !== val) : [...prev, val]
    );
  };

  const addCustom = (list, setList, val) => {
    const formatted = val.charAt(0).toUpperCase() + val.slice(1);
    if (!list.includes(formatted)) setList((prev) => [...prev, formatted]);
  };

  const handleSave = () => {
    if (!name.trim()) { setFormError("Name is required."); return; }
    if (!dateOfBirth) { setFormError("Date of birth is required."); return; }
    setFormError("");
    onSave({ ...(profile || {}), name: name.trim(), dateOfBirth, avatar, dietaryRestrictions: dietary, allergies });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#F0E6D1] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-[#587A34] px-6 py-4 flex items-center justify-between">
          <h2 className="text-[#F0E6D1] font-bold text-lg tracking-wide">
            {profile?.id ? "Edit Profile" : "New Profile"}
          </h2>
          <button onClick={onClose} className="text-[#F0E6D1]/70 hover:text-[#F0E6D1] transition-colors text-xl font-light">✕</button>
        </div>

        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          <AvatarUpload name={name} avatar={avatar} onAvatarChange={setAvatar} />

          <div>
            <label className="block text-[#3a5220] text-xs font-semibold uppercase tracking-wider mb-1">Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter name..." className="w-full bg-white border border-[#587A34]/30 rounded-lg px-3 py-2 text-[#3a5220] text-sm focus:outline-none focus:ring-2 focus:ring-[#587A34]/50" />
          </div>

          <div>
            <label className="block text-[#3a5220] text-xs font-semibold uppercase tracking-wider mb-1">Date of Birth</label>
            <input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} className="w-full bg-white border border-[#587A34]/30 rounded-lg px-3 py-2 text-[#3a5220] text-sm focus:outline-none focus:ring-2 focus:ring-[#587A34]/50" />
          </div>

          <div>
            <label className="block text-[#3a5220] text-xs font-semibold uppercase tracking-wider mb-2">Dietary Restrictions</label>
            <div className="flex flex-wrap gap-2">
              {DIETARY_OPTIONS.map((opt) => (
                <button key={opt} onClick={() => toggle(dietary, setDietary, opt)} className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${dietary.includes(opt) ? "bg-[#587A34] text-white border-[#587A34]" : "bg-white text-[#587A34] border-[#587A34]/40 hover:border-[#587A34]"}`}>{opt}</button>
              ))}
              {dietary.filter((d) => !DIETARY_OPTIONS.includes(d)).map((opt) => (
                <button key={opt} onClick={() => toggle(dietary, setDietary, opt)} className="px-3 py-1 rounded-full text-xs font-semibold border bg-[#587A34] text-white border-[#587A34] flex items-center gap-1">{opt}<span className="ml-1 opacity-70">×</span></button>
              ))}
            </div>
            <CustomTagInput onAdd={(val) => addCustom(dietary, setDietary, val)} placeholder="e.g. Halal, Low-sodium..." accentClass="bg-[#587A34] text-white border-[#587A34]" />
          </div>

          <div>
            <label className="block text-[#3a5220] text-xs font-semibold uppercase tracking-wider mb-2">Allergies</label>
            <div className="flex flex-wrap gap-2">
              {ALLERGY_OPTIONS.map((opt) => (
                <button key={opt} onClick={() => toggle(allergies, setAllergies, opt)} className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${allergies.includes(opt) ? "bg-red-500 text-white border-red-500" : "bg-white text-red-500 border-red-300 hover:border-red-500"}`}>{opt}</button>
              ))}
              {allergies.filter((a) => !ALLERGY_OPTIONS.includes(a)).map((opt) => (
                <button key={opt} onClick={() => toggle(allergies, setAllergies, opt)} className="px-3 py-1 rounded-full text-xs font-semibold border bg-red-500 text-white border-red-500 flex items-center gap-1">{opt}<span className="ml-1 opacity-70">×</span></button>
              ))}
            </div>
            <CustomTagInput onAdd={(val) => addCustom(allergies, setAllergies, val)} placeholder="e.g. Sesame, Mustard..." accentClass="bg-red-500 text-white border-red-500" />
          </div>

          {formError ? <p className="text-sm text-red-600">{formError}</p> : null}

          <div className="flex gap-3 pt-1">
            <button onClick={onClose} className="flex-1 py-2 rounded-lg border border-[#587A34]/40 text-[#587A34] text-sm font-semibold hover:bg-[#587A34]/10 transition-colors">Cancel</button>
            <button onClick={handleSave} className="flex-1 py-2 rounded-lg bg-[#587A34] text-[#F0E6D1] text-sm font-semibold hover:bg-[#3a5220] transition-colors">Save</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProfileCard = ({ profile, onEdit, onDelete, onSetDefault }) => {
  const hasRestrictions = profile.dietaryRestrictions.length > 0;
  const hasAllergies = profile.allergies.length > 0;
  const isEmpty = !hasRestrictions && !hasAllergies;

  return (
    <div className={`relative bg-[#c8dba8] rounded-2xl p-5 flex flex-col items-center gap-3 shadow-md border-2 transition-all ${profile.isDefault ? "border-[#3a5220] shadow-lg" : "border-transparent hover:border-[#587A34]/40"}`}>
      <div className="absolute top-3 right-3 flex gap-1">
        <button onClick={() => onEdit(profile)} className="w-7 h-7 flex items-center justify-center rounded-full bg-[#587A34]/20 hover:bg-[#587A34]/40 transition-colors text-[#3a5220]" title="Edit">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.5-6.5a2 2 0 112.828 2.828L11.828 15.828a4 4 0 01-1.414.828l-3 1 1-3a4 4 0 01.828-1.414z" />
          </svg>
        </button>
        {!profile.isDefault && (
          <button onClick={() => onDelete(profile)} className="w-7 h-7 flex items-center justify-center rounded-full bg-red-100 hover:bg-red-200 transition-colors text-red-500" title="Delete">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>

      <Avatar name={profile.name} avatar={profile.avatar} size="lg" />
      <p className="text-[#2d3f1a] font-bold text-sm">{profile.name}</p>

      {profile.isDefault ? (
        <span className="px-3 py-0.5 rounded-full bg-[#3a5220] text-[#F0E6D1] text-xs font-semibold">Default</span>
      ) : (
        <button onClick={() => onSetDefault(profile.id)} className="px-3 py-0.5 rounded-full border border-[#587A34]/50 text-[#3a5220] text-xs font-semibold hover:bg-[#587A34]/20 transition-colors">Set Default</button>
      )}

      <div className="w-full h-px bg-[#587A34]/20" />

      {isEmpty ? (
        <p className="text-[#3a5220]/60 text-xs italic">No restrictions set</p>
      ) : (
        <div className="w-full space-y-2">
          {hasRestrictions && (
            <div>
              <p className="text-[#3a5220] text-[10px] font-semibold uppercase tracking-wider mb-1">Dietary Restrictions</p>
              <div className="flex flex-wrap gap-1">
                {profile.dietaryRestrictions.map((tag) => (
                  <span key={tag} className="px-2 py-0.5 rounded-full bg-[#587A34] text-white text-[10px] font-semibold">{tag}</span>
                ))}
              </div>
            </div>
          )}
          {hasAllergies && (
            <div>
              <p className="text-[#3a5220] text-[10px] font-semibold uppercase tracking-wider mb-1">Allergies</p>
              <div className="flex flex-wrap gap-1">
                {profile.allergies.map((tag) => (
                  <span key={tag} className="px-2 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-semibold">{tag}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const AddProfileCard = ({ onClick }) => (
  <button onClick={onClick} className="bg-[#c8dba8]/50 border-2 border-dashed border-[#587A34]/40 rounded-2xl p-5 flex flex-col items-center justify-center gap-3 hover:bg-[#c8dba8] hover:border-[#587A34] transition-all min-h-[180px] group">
    <div className="w-12 h-12 rounded-full bg-[#587A34]/20 flex items-center justify-center group-hover:bg-[#587A34]/30 transition-colors">
      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-[#3a5220]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
      </svg>
    </div>
    <span className="text-[#3a5220] font-semibold text-sm">Add Profile</span>
  </button>
);

const ProfilePage = () => {
  const [profiles, setProfiles] = useState([]);
  const [modal, setModal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null); // { id, name }
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const mapApiProfileToUi = (profile) => ({
    id: profile.id,
    name: profile.name ?? "",
    dateOfBirth: profile.date_of_birth ?? "",
    avatar: profile.avatar_url ?? null,
    dietaryRestrictions: Array.isArray(profile.dietary_restrictions) ? profile.dietary_restrictions : [],
    allergies: Array.isArray(profile.dietary_preferences) ? profile.dietary_preferences : [],
    isDefault: !!profile.is_active,
  });

  useEffect(() => {
    const loadProfiles = async () => {
      try {
        setIsLoading(true);
        setError("");
        const response = await apiCall("/api/profiles");
        const rows = Array.isArray(response?.data) ? response.data : [];
        setProfiles(rows.map(mapApiProfileToUi));
      } catch (err) {
        setError(err.message || "Failed to load profiles.");
      } finally {
        setIsLoading(false);
      }
    };
    loadProfiles();
  }, []);

  const handleEdit = (profile) => setModal({ mode: "edit", profile });
  const handleAdd = () => setModal({ mode: "add", profile: null });
  const handleClose = () => setModal(null);

  const handleSave = async (data) => {
    if (!modal) return;
    setIsSaving(true);
    setError("");
    try {
      if (modal.mode === "add") {
        const response = await apiCall("/api/profiles", {
          method: "POST",
          body: JSON.stringify({
            name: data.name,
            dateOfBirth: data.dateOfBirth,
            avatar_url: data.avatar,
            dietaryRestrictions: data.dietaryRestrictions,
            allergies: data.allergies,
            isDefault: profiles.length === 0,
          }),
        });
        if (!response?.data) throw new Error("Profile created but no profile data was returned.");
        setProfiles((prev) => [...prev, mapApiProfileToUi(response.data)]);
      } else {
        const response = await apiCall(`/api/profiles/${data.id}`, {
          method: "PUT",
          body: JSON.stringify({
            name: data.name,
            date_of_birth: data.dateOfBirth,
            avatar_url: data.avatar,
            dietaryRestrictions: data.dietaryRestrictions,
            allergies: data.allergies,
          }),
        });
        if (!response?.data) throw new Error("Profile updated but no profile data was returned.");
        const updated = mapApiProfileToUi(response.data);
        setProfiles((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      }
      setModal(null);
    } catch (err) {
      setError(err.message || "Failed to save profile.");
    } finally {
      setIsSaving(false);
    }
  };

  // Opens the styled confirmation modal instead of window.confirm
  const handleDelete = (profile) => {
    setDeleteTarget({ id: profile.id, name: profile.name });
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setError("");
    try {
      await apiCall(`/api/profiles/${deleteTarget.id}`, { method: "DELETE" });
      setProfiles((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      setError(err.message || "Failed to delete profile.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSetDefault = async (id) => {
    setError("");
    const previous = profiles;
    const next = previous.map((p) => ({ ...p, isDefault: p.id === id }));
    setProfiles(next);
    try {
      await Promise.all(
        next.map((p) =>
          apiCall(`/api/profiles/${p.id}`, {
            method: "PUT",
            body: JSON.stringify({ isDefault: p.id === id }),
          })
        )
      );
    } catch (err) {
      setProfiles(previous);
      setError(err.message || "Failed to update default profile.");
    }
  };

  return (
    <div className="mx-4 md:mx-8 mt-6">
      <div
        className="relative rounded-2xl shadow-xl overflow-hidden px-8 py-7 mb-6 flex items-center gap-5"
        style={{ backgroundImage: `url(${heroBg})`, backgroundSize: "cover", backgroundPosition: "center" }}
      >
        <div className="absolute inset-0 bg-[#1e3a0f]/70 rounded-2xl" />
        <div className="relative flex items-center gap-5">
          <div>
            <h1 className="text-[#F0E6D1] font-extrabold text-2xl md:text-3xl tracking-wide uppercase leading-tight">Who's Cooking?</h1>
            <p className="text-[#B5D098] text-sm mt-1">Select and manage your profile to get personalized recipe recommendations.</p>
          </div>
        </div>
      </div>

      {error ? (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : null}

      {isLoading ? (
        <div className="rounded-xl bg-white/70 px-4 py-5 text-sm text-[#2d3f1a]">Loading profiles...</div>
      ) : null}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {profiles.map((profile) => (
          <ProfileCard
            key={profile.id}
            profile={profile}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onSetDefault={handleSetDefault}
          />
        ))}
        <AddProfileCard onClick={handleAdd} />
      </div>

      {modal && (
        <ProfileModal profile={modal.profile} onSave={handleSave} onClose={handleClose} />
      )}

      {deleteTarget && (
        <DeleteConfirmModal
          profileName={deleteTarget.name}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
          isDeleting={isDeleting}
        />
      )}

      {isSaving ? (
        <div className="fixed bottom-5 right-5 rounded-lg bg-[#2d3f1a] px-4 py-2 text-sm text-white shadow-lg">Saving profile...</div>
      ) : null}
    </div>
  );
};

export default ProfilePage;