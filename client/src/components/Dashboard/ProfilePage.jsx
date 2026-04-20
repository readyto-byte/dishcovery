import { useState, useRef } from "react";
import heroBg from "../../assets/hero-bg.jpg";

const initialProfiles = [
  {
    id: 1,
    name: "Tyrone S.",
    isDefault: true,
    avatar: null,
    dietaryRestrictions: [],
    allergies: [],
  },
  {
    id: 2,
    name: "Annalise K.",
    isDefault: false,
    avatar: null,
    dietaryRestrictions: ["Keto", "Gluten-Free"],
    allergies: ["Nuts", "Shellfish"],
  },
];

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

const CustomTagInput = ({ onAdd, placeholder, accentClass, textClass }) => {
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

const ProfileModal = ({ profile, onSave, onClose }) => {
  const [name, setName] = useState(profile?.name || "");
  const [avatar, setAvatar] = useState(profile?.avatar || null);
  const [dietary, setDietary] = useState(profile?.dietaryRestrictions || []);
  const [allergies, setAllergies] = useState(profile?.allergies || []);

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
    if (!name.trim()) return;
    onSave({
      ...(profile || {}),
      name: name.trim(),
      avatar,
      dietaryRestrictions: dietary,
      allergies,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#F0E6D1] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">

        <div className="bg-[#587A34] px-6 py-4 flex items-center justify-between">
          <h2 className="text-[#F0E6D1] font-bold text-lg tracking-wide">
            {profile?.id ? "Edit Profile" : "New Profile"}
          </h2>
          <button
            onClick={onClose}
            className="text-[#F0E6D1]/70 hover:text-[#F0E6D1] transition-colors text-xl font-light"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">

          <AvatarUpload
            name={name}
            avatar={avatar}
            onAvatarChange={setAvatar}
          />

          <div>
            <label className="block text-[#3a5220] text-xs font-semibold uppercase tracking-wider mb-1">
              Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter name..."
              className="w-full bg-white border border-[#587A34]/30 rounded-lg px-3 py-2 text-[#3a5220] text-sm focus:outline-none focus:ring-2 focus:ring-[#587A34]/50"
            />
          </div>

          <div>
            <label className="block text-[#3a5220] text-xs font-semibold uppercase tracking-wider mb-2">
              Dietary Restrictions
            </label>
            <div className="flex flex-wrap gap-2">
              {DIETARY_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  onClick={() => toggle(dietary, setDietary, opt)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                    dietary.includes(opt)
                      ? "bg-[#587A34] text-white border-[#587A34]"
                      : "bg-white text-[#587A34] border-[#587A34]/40 hover:border-[#587A34]"
                  }`}
                >
                  {opt}
                </button>
              ))}

              {dietary
                .filter((d) => !DIETARY_OPTIONS.includes(d))
                .map((opt) => (
                  <button
                    key={opt}
                    onClick={() => toggle(dietary, setDietary, opt)}
                    className="px-3 py-1 rounded-full text-xs font-semibold border bg-[#587A34] text-white border-[#587A34] flex items-center gap-1"
                  >
                    {opt}
                    <span className="ml-1 opacity-70">×</span>
                  </button>
                ))}
            </div>
            <CustomTagInput
              onAdd={(val) => addCustom(dietary, setDietary, val)}
              placeholder="e.g. Halal, Low-sodium..."
              accentClass="bg-[#587A34] text-white border-[#587A34]"
            />
          </div>

          <div>
            <label className="block text-[#3a5220] text-xs font-semibold uppercase tracking-wider mb-2">
              Allergies
            </label>
            <div className="flex flex-wrap gap-2">
              {ALLERGY_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  onClick={() => toggle(allergies, setAllergies, opt)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                    allergies.includes(opt)
                      ? "bg-red-500 text-white border-red-500"
                      : "bg-white text-red-500 border-red-300 hover:border-red-500"
                  }`}
                >
                  {opt}
                </button>
              ))}
              {/* Custom allergy tags */}
              {allergies
                .filter((a) => !ALLERGY_OPTIONS.includes(a))
                .map((opt) => (
                  <button
                    key={opt}
                    onClick={() => toggle(allergies, setAllergies, opt)}
                    className="px-3 py-1 rounded-full text-xs font-semibold border bg-red-500 text-white border-red-500 flex items-center gap-1"
                  >
                    {opt}
                    <span className="ml-1 opacity-70">×</span>
                  </button>
                ))}
            </div>
            <CustomTagInput
              onAdd={(val) => addCustom(allergies, setAllergies, val)}
              placeholder="e.g. Sesame, Mustard..."
              accentClass="bg-red-500 text-white border-red-500"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              onClick={onClose}
              className="flex-1 py-2 rounded-lg border border-[#587A34]/40 text-[#587A34] text-sm font-semibold hover:bg-[#587A34]/10 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 py-2 rounded-lg bg-[#587A34] text-[#F0E6D1] text-sm font-semibold hover:bg-[#3a5220] transition-colors"
            >
              Save
            </button>
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
    <div
      className={`relative bg-[#c8dba8] rounded-2xl p-5 flex flex-col items-center gap-3 shadow-md border-2 transition-all ${
        profile.isDefault
          ? "border-[#3a5220] shadow-lg"
          : "border-transparent hover:border-[#587A34]/40"
      }`}
    >
      {/* Action Buttons */}
      <div className="absolute top-3 right-3 flex gap-1">
        <button
          onClick={() => onEdit(profile)}
          className="w-7 h-7 flex items-center justify-center rounded-full bg-[#587A34]/20 hover:bg-[#587A34]/40 transition-colors text-[#3a5220]"
          title="Edit"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.5-6.5a2 2 0 112.828 2.828L11.828 15.828a4 4 0 01-1.414.828l-3 1 1-3a4 4 0 01.828-1.414z" />
          </svg>
        </button>
        {!profile.isDefault && (
          <button
            onClick={() => onDelete(profile.id)}
            className="w-7 h-7 flex items-center justify-center rounded-full bg-red-100 hover:bg-red-200 transition-colors text-red-500"
            title="Delete"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>

      {/* Avatar */}
      <Avatar name={profile.name} avatar={profile.avatar} size="lg" />

      {/* Name */}
      <p className="text-[#2d3f1a] font-bold text-sm">{profile.name}</p>

      {/* Default Badge */}
      {profile.isDefault ? (
        <span className="px-3 py-0.5 rounded-full bg-[#3a5220] text-[#F0E6D1] text-xs font-semibold">
          Default
        </span>
      ) : (
        <button
          onClick={() => onSetDefault(profile.id)}
          className="px-3 py-0.5 rounded-full border border-[#587A34]/50 text-[#3a5220] text-xs font-semibold hover:bg-[#587A34]/20 transition-colors"
        >
          Set Default
        </button>
      )}

      {/* Divider */}
      <div className="w-full h-px bg-[#587A34]/20" />

      {isEmpty ? (
        <p className="text-[#3a5220]/60 text-xs italic">No restrictions set</p>
      ) : (
        <div className="w-full space-y-2">
          {hasRestrictions && (
            <div>
              <p className="text-[#3a5220] text-[10px] font-semibold uppercase tracking-wider mb-1">
                Dietary Restrictions
              </p>
              <div className="flex flex-wrap gap-1">
                {profile.dietaryRestrictions.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded-full bg-[#587A34] text-white text-[10px] font-semibold"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
          {hasAllergies && (
            <div>
              <p className="text-[#3a5220] text-[10px] font-semibold uppercase tracking-wider mb-1">
                Allergies
              </p>
              <div className="flex flex-wrap gap-1">
                {profile.allergies.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-semibold"
                  >
                    {tag}
                  </span>
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
  <button
    onClick={onClick}
    className="bg-[#c8dba8]/50 border-2 border-dashed border-[#587A34]/40 rounded-2xl p-5 flex flex-col items-center justify-center gap-3 hover:bg-[#c8dba8] hover:border-[#587A34] transition-all min-h-[180px] group"
  >
    <div className="w-12 h-12 rounded-full bg-[#587A34]/20 flex items-center justify-center group-hover:bg-[#587A34]/30 transition-colors">
      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-[#3a5220]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
      </svg>
    </div>
    <span className="text-[#3a5220] font-semibold text-sm">Add Profile</span>
  </button>
);

// Main ProfilePage
const ProfilePage = () => {
  const [profiles, setProfiles] = useState(initialProfiles);
  const [modal, setModal] = useState(null);

  const handleEdit = (profile) => setModal({ mode: "edit", profile });
  const handleAdd = () => setModal({ mode: "add", profile: null });
  const handleClose = () => setModal(null);

  const handleSave = (data) => {
    if (modal.mode === "add") {
      setProfiles((prev) => [
        ...prev,
        { ...data, id: Date.now(), isDefault: prev.length === 0 },
      ]);
    } else {
      setProfiles((prev) =>
        prev.map((p) => (p.id === data.id ? { ...p, ...data } : p))
      );
    }
    setModal(null);
  };

  const handleDelete = (id) => {
    setProfiles((prev) => prev.filter((p) => p.id !== id));
  };

  const handleSetDefault = (id) => {
    setProfiles((prev) =>
      prev.map((p) => ({ ...p, isDefault: p.id === id }))
    );
  };

  return (
    <div className="mx-4 md:mx-8 mt-6">
      {/* Header Card */}
      <div
        className="relative rounded-2xl shadow-xl overflow-hidden px-8 py-7 mb-6 flex items-center gap-5"
        style={{ backgroundImage: `url(${heroBg})`, backgroundSize: "cover", backgroundPosition: "center" }}
      >
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-[#1e3a0f]/70 rounded-2xl" />
        {/* Content */}
        <div className="relative flex items-center gap-5">
          <div>
            <h1 className="text-[#F0E6D1] font-extrabold text-2xl md:text-3xl tracking-wide uppercase leading-tight">
              Who's Cooking?
            </h1>
            <p className="text-[#B5D098] text-sm mt-1">
              Select and manage your profile to get personalized recipe recommendations.
            </p>
          </div>
        </div>
      </div>

      {/* Profiles Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
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

      {/* Modal */}
      {modal && (
        <ProfileModal
          profile={modal.profile}
          onSave={handleSave}
          onClose={handleClose}
        />
      )}
    </div>
  );
};

export default ProfilePage;