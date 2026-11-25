import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BookmarkCheck,
  CalendarClock,
  CheckCircle2,
  Edit3,
  Headphones,
  LogIn,
  LogOut,
  Stethoscope,
  User,
  Warehouse,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { INDIAN_STATES } from "../data/bhoomiData";
import { getRoleDisplayLabel } from "../utils/roles";
import {
  CONSULTATION_LANGUAGE_OPTIONS,
  CONSULTATION_MODE_OPTIONS,
  CONSULTATION_SLOT_OPTIONS,
  SESSION_DURATION_OPTIONS,
  type ConsultationMode,
  type SessionDurationMins,
} from "../utils/psychiatristSettings";

export function ProfilePage() {
  const {
    user,
    profile,
    isAdmin,
    savedSchemes,
    bookings,
    warehouses,
    ownerIncomingBookings,
    psychiatrists,
    updateUserProfile,
    updatePsychiatristSettings,
    updateBookingStatus,
    logOut,
  } = useAuth();
  const navigate = useNavigate();

  const isPsychiatrist = profile?.role === "psychiatrist";
  const isSupportStaff = profile?.role === "support_staff";
  const isWarehouseOwner = profile?.role === "warehouse_owner";
  const isFarmer = !isAdmin && !isPsychiatrist && !isSupportStaff && !isWarehouseOwner;

  const ownerWarehouses = isWarehouseOwner
    ? warehouses.filter((w) => w.ownerId === user?.uid)
    : [];
  const ownerTotalCapacityMt = ownerWarehouses.reduce(
    (sum, w) => sum + w.totalCapacityMt,
    0
  );
  const ownerPendingRequests = ownerIncomingBookings.filter(
    (b) => b.status === "pending"
  ).length;

  const myDoctorProfile = isPsychiatrist
    ? psychiatrists.find(
        (p) => p.userId === profile?.uid || p.id === profile?.uid
      )
    : undefined;

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [state, setState] = useState("Punjab");
  const [district, setDistrict] = useState("");
  const [landSizeAcres, setLandSizeAcres] = useState("2.5");
  const [cropsText, setCropsText] = useState("");
  const [qualification, setQualification] = useState("MD Psychiatry");
  const [specialization, setSpecialization] = useState(
    "Rural Stress & Farmer Well-Being"
  );
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedNotice, setSavedNotice] = useState("");

  // Psychiatrist Availability & Consultation Settings state
  const [availableForConsult, setAvailableForConsult] = useState(true);
  const [consultMode, setConsultMode] =
    useState<ConsultationMode>("Audio & Video");
  const [sessionDurationMins, setSessionDurationMins] =
    useState<SessionDurationMins>(30);
  const [experienceYears, setExperienceYears] = useState("5");
  const [consultLanguages, setConsultLanguages] = useState<string[]>([
    "Hindi",
    "English",
  ]);
  const [preferredSlots, setPreferredSlots] = useState<string[]>([
    "Tomorrow · 5:00 PM - 5:30 PM",
  ]);
  const [careBio, setCareBio] = useState("");
  const [consultSaving, setConsultSaving] = useState(false);
  const [consultError, setConsultError] = useState("");
  const [consultSavedNotice, setConsultSavedNotice] = useState("");

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setPhone(profile.phone);
      setState(profile.state || "Punjab");
      setDistrict(profile.district);
      setLandSizeAcres(String(profile.landSizeAcres ?? 2.5));
      setCropsText(profile.primaryCrops.join(", "));
      setQualification(profile.qualification || "MD Psychiatry");
      setSpecialization(
        profile.specialization || "Rural Stress & Farmer Well-Being"
      );
      setNotifEnabled(profile.notificationsEnabled);
    }
  }, [profile]);

  useEffect(() => {
    if (!isPsychiatrist || !profile) return;
    setAvailableForConsult(
      myDoctorProfile?.availableForConsult ??
        profile.availableForConsult !== false
    );
    setConsultMode(myDoctorProfile?.consultMode || "Audio & Video");
    setSessionDurationMins(myDoctorProfile?.sessionDurationMins || 30);
    setExperienceYears(String(myDoctorProfile?.experienceYears ?? 5));
    setConsultLanguages(
      myDoctorProfile?.languages && myDoctorProfile.languages.length > 0
        ? myDoctorProfile.languages
        : ["Hindi", "English"]
    );
    setPreferredSlots(
      myDoctorProfile?.preferredSlots &&
        myDoctorProfile.preferredSlots.length > 0
        ? myDoctorProfile.preferredSlots
        : ["Tomorrow · 5:00 PM - 5:30 PM"]
    );
    setCareBio(
      myDoctorProfile?.bio ||
        "Confidential, stigma-free mental well-being guidance for farming families."
    );
  }, [isPsychiatrist, myDoctorProfile, profile]);

  if (!user) {
    return (
      <div className="max-w-lg mx-auto bg-white rounded-2xl border border-[#2D6A4F]/15 p-8 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-[#EAF4EE] text-[#2D6A4F] flex items-center justify-center mx-auto">
          <User className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-display font-bold text-[#1B2A20]">
          Your Profile
        </h1>
        <p className="text-sm text-[#4A5A4F]">
          Sign in or create an account to manage your profile details and
          workspace settings.
        </p>
        <Link
          to="/auth"
          className="min-h-[48px] px-7 rounded-xl bg-[#E9A23B] hover:bg-[#DC9428] text-[#1B2A20] font-semibold text-sm inline-flex items-center justify-center gap-2 transition-colors"
        >
          <LogIn className="w-4 h-4" />
          <span>Log In / Sign Up</span>
        </Link>
      </div>
    );
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedNotice("");
    try {
      await updateUserProfile({
        name: name.trim() || profile?.name || "User",
        phone: phone.trim(),
        state,
        district: district.trim(),
        landSizeAcres: isFarmer ? Number(landSizeAcres) || 0 : 0,
        primaryCrops: isFarmer
          ? cropsText
              .split(",")
              .map((c) => c.trim())
              .filter(Boolean)
          : [],
        ...(isPsychiatrist
          ? {
              qualification: qualification.trim() || "MD Psychiatry",
              specialization:
                specialization.trim() || "Rural Stress & Farmer Well-Being",
            }
          : {}),
        role: profile?.role,
        notificationsEnabled: notifEnabled,
      });
      setEditing(false);
      setSavedNotice("Profile details updated safely.");
    } finally {
      setSaving(false);
    }
  };

  const toggleLanguage = (lang: string) => {
    setConsultLanguages((prev) =>
      prev.includes(lang) ? prev.filter((item) => item !== lang) : [...prev, lang]
    );
  };

  const toggleSlot = (slot: string) => {
    setPreferredSlots((prev) =>
      prev.includes(slot) ? prev.filter((item) => item !== slot) : [...prev, slot]
    );
  };

  const handleSaveConsultSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setConsultError("");
    setConsultSavedNotice("");
    setConsultSaving(true);
    try {
      await updatePsychiatristSettings({
        availableForConsult,
        consultMode,
        sessionDurationMins,
        experienceYears: Number(experienceYears),
        languages: consultLanguages,
        preferredSlots,
        bio: careBio,
        qualification:
          qualification.trim() || profile?.qualification || "MD Psychiatry",
        specialization:
          specialization.trim() ||
          profile?.specialization ||
          "Rural Stress & Farmer Well-Being",
      });
      setConsultSavedNotice(
        availableForConsult
          ? "Availability & consultation settings saved. Farmers see these options immediately."
          : "Consultation settings saved. Farmer consultation requests are currently paused."
      );
    } catch (err) {
      setConsultError(
        err instanceof Error
          ? err.message
          : "Unable to save consultation settings."
      );
    } finally {
      setConsultSaving(false);
    }
  };

  const handleLogout = async () => {
    await logOut();
    navigate("/auth");
  };

  const roleLabel = getRoleDisplayLabel(profile?.role, isAdmin);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Card */}
      <div className="bg-white rounded-2xl border border-[#2D6A4F]/15 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[#EAF4EE] text-[#2D6A4F] flex items-center justify-center font-display font-bold text-2xl shrink-0">
            {(profile?.name || user.email || "F").charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-xs font-semibold text-[#2D6A4F]">
              {roleLabel} ·{" "}
              {user.emailVerified
                ? "Verified Account"
                : "Email Verification Pending"}
            </p>
            <h1 className="text-xl md:text-2xl font-display font-bold text-[#1B2A20]">
              {profile?.name || user.displayName || "User"}
            </h1>
            <p className="text-xs text-[#4A5A4F]">{user.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setEditing((prev) => !prev)}
            className="min-h-[44px] px-4 rounded-xl border border-[#2D6A4F] text-[#2D6A4F] hover:bg-[#EAF4EE] font-semibold text-sm inline-flex items-center gap-1.5 transition-colors"
          >
            <Edit3 className="w-4 h-4" />
            <span>{editing ? "Cancel" : "Edit Profile"}</span>
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="min-h-[44px] px-4 rounded-xl border border-red-200 text-red-700 hover:bg-red-50 font-semibold text-sm inline-flex items-center gap-1.5 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Log Out</span>
          </button>
        </div>
      </div>

      {savedNotice && (
        <div
          role="status"
          className="p-3.5 rounded-xl bg-[#EAF4EE] border border-[#2D6A4F]/25 text-sm font-medium text-[#1B2A20] flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4 text-[#2D6A4F]" />
          <span>{savedNotice}</span>
        </div>
      )}

      {editing ? (
        <form
          onSubmit={handleSaveProfile}
          className="bg-white rounded-2xl border border-[#2D6A4F]/15 p-6 space-y-4"
        >
          <h2 className="font-display font-semibold text-lg">
            {isPsychiatrist
              ? "Edit Doctor & Practice Details"
              : isFarmer
              ? "Edit Personal & Farm Info"
              : "Edit Profile Details"}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="profile-full-name"
                className="block text-sm font-medium mb-1"
              >
                Full Name
              </label>
              <input
                id="profile-full-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl bg-[#FAF8F3] border border-[#2D6A4F]/25 text-sm"
              />
            </div>
            <div>
              <label
                htmlFor="profile-phone"
                className="block text-sm font-medium mb-1"
              >
                Phone Number
              </label>
              <input
                id="profile-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98..."
                className="w-full h-11 px-3.5 rounded-xl bg-[#FAF8F3] border border-[#2D6A4F]/25 text-sm"
              />
            </div>
            <div>
              <label
                htmlFor="profile-state"
                className="block text-sm font-medium mb-1"
              >
                State
              </label>
              <select
                id="profile-state"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl bg-[#FAF8F3] border border-[#2D6A4F]/25 text-sm"
              >
                {INDIAN_STATES.filter((s) => s !== "All India").map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="profile-district"
                className="block text-sm font-medium mb-1"
              >
                District
              </label>
              <input
                id="profile-district"
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder="e.g. Ludhiana"
                className="w-full h-11 px-3.5 rounded-xl bg-[#FAF8F3] border border-[#2D6A4F]/25 text-sm"
              />
            </div>

            {isPsychiatrist && (
              <>
                <div>
                  <label
                    htmlFor="profile-qualification"
                    className="block text-sm font-medium mb-1"
                  >
                    Medical Qualification
                  </label>
                  <input
                    id="profile-qualification"
                    type="text"
                    value={qualification}
                    onChange={(e) => setQualification(e.target.value)}
                    placeholder="MD Psychiatry"
                    className="w-full h-11 px-3.5 rounded-xl bg-[#FAF8F3] border border-[#2D6A4F]/25 text-sm"
                  />
                </div>
                <div>
                  <label
                    htmlFor="profile-specialization"
                    className="block text-sm font-medium mb-1"
                  >
                    Clinical Specialization
                  </label>
                  <input
                    id="profile-specialization"
                    type="text"
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    placeholder="Rural Stress & Farmer Well-Being"
                    className="w-full h-11 px-3.5 rounded-xl bg-[#FAF8F3] border border-[#2D6A4F]/25 text-sm"
                  />
                </div>
              </>
            )}

            {isFarmer && (
              <>
                <div>
                  <label
                    htmlFor="profile-land"
                    className="block text-sm font-medium mb-1"
                  >
                    Land Size (Acres)
                  </label>
                  <input
                    id="profile-land"
                    type="number"
                    step="0.5"
                    min="0"
                    value={landSizeAcres}
                    onChange={(e) => setLandSizeAcres(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl bg-[#FAF8F3] border border-[#2D6A4F]/25 text-sm tabular-nums"
                  />
                </div>
                <div>
                  <label
                    htmlFor="profile-crops"
                    className="block text-sm font-medium mb-1"
                  >
                    Primary Crops (comma separated)
                  </label>
                  <input
                    id="profile-crops"
                    type="text"
                    value={cropsText}
                    onChange={(e) => setCropsText(e.target.value)}
                    placeholder="Wheat, Paddy, Mustard"
                    className="w-full h-11 px-3.5 rounded-xl bg-[#FAF8F3] border border-[#2D6A4F]/25 text-sm"
                  />
                </div>
              </>
            )}

            <div>
              <label
                htmlFor="profile-role"
                className="block text-sm font-medium mb-1"
              >
                Account Role
              </label>
              <input
                id="profile-role"
                type="text"
                readOnly
                value={roleLabel}
                className="w-full h-11 px-3.5 rounded-xl bg-[#F2EFE6] border border-[#2D6A4F]/15 text-sm text-[#4A5A4F]"
              />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input
                id="pref-notif"
                type="checkbox"
                checked={notifEnabled}
                onChange={(e) => setNotifEnabled(e.target.checked)}
                className="w-4 h-4 accent-[#2D6A4F]"
              />
              <label htmlFor="pref-notif" className="text-sm font-medium">
                {isPsychiatrist
                  ? "Receive consultation alerts & notifications"
                  : "Receive scheme & booking alerts"}
              </label>
            </div>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="min-h-[44px] px-6 rounded-xl bg-[#E9A23B] hover:bg-[#DC9428] text-[#1B2A20] font-semibold text-sm transition-colors"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <section className="bg-white rounded-2xl border border-[#2D6A4F]/15 p-5 space-y-2">
            <h2 className="font-display font-semibold text-base text-[#1B2A20]">
              Profile &amp; Account Details
            </h2>
            <p className="text-sm text-[#4A5A4F]">
              Location: {profile?.district ? `${profile.district}, ` : ""}
              {profile?.state || "India"}
            </p>
            {isAdmin ? (
              <>
                <p className="text-sm text-[#4A5A4F]">
                  Access Level: Super Administrator
                </p>
                <p className="text-sm text-[#4A5A4F]">
                  Workspaces: Admin Portal, Psychiatrist Desk, Support Desk
                </p>
              </>
            ) : isPsychiatrist ? (
              <>
                <p className="text-sm text-[#4A5A4F]">
                  Qualification:{" "}
                  {myDoctorProfile?.qualification ||
                    profile?.qualification ||
                    "MD Psychiatry"}
                </p>
                <p className="text-sm text-[#4A5A4F]">
                  Specialization:{" "}
                  {myDoctorProfile?.specialization ||
                    profile?.specialization ||
                    "Rural Stress & Farmer Well-Being"}
                </p>
                <p className="text-sm text-[#4A5A4F] tabular-nums">
                  Experience: {myDoctorProfile?.experienceYears ?? 5} years
                </p>
              </>
            ) : isSupportStaff ? (
              <p className="text-sm text-[#4A5A4F]">
                Department: {profile?.department || "Farmer Help Operations"}
              </p>
            ) : isWarehouseOwner ? (
              <>
                <p className="text-sm text-[#4A5A4F]">
                  Account Type: Verified Commercial Warehouse Partner
                </p>
                <p className="text-sm text-[#4A5A4F] tabular-nums">
                  Owned Facilities: {ownerWarehouses.length} godown
                  {ownerWarehouses.length === 1 ? "" : "s"} (
                  {ownerTotalCapacityMt.toLocaleString("en-IN")} MT total capacity)
                </p>
                <p className="text-sm text-[#4A5A4F] tabular-nums">
                  Incoming Booking Requests: {ownerPendingRequests} pending ·{" "}
                  {ownerIncomingBookings.length} total
                </p>
              </>
            ) : (
              <>
                <p className="text-sm text-[#4A5A4F] tabular-nums">
                  Land Holding: {profile?.landSizeAcres ?? 0} acres
                </p>
                <p className="text-sm text-[#4A5A4F]">
                  Crops:{" "}
                  {profile?.primaryCrops?.length
                    ? profile.primaryCrops.join(", ")
                    : "Not set"}
                </p>
              </>
            )}
            <p className="text-sm text-[#4A5A4F]">
              Phone: {profile?.phone || "Not added yet"}
            </p>
          </section>

          {isAdmin ? (
            <section className="bg-white rounded-2xl border border-[#2D6A4F]/15 p-5 space-y-3">
              <h2 className="font-display font-semibold text-base text-[#1B2A20]">
                Admin Workspaces
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Link
                  to="/admin"
                  className="min-h-[40px] px-3 rounded-xl bg-[#EAF4EE] text-[#2D6A4F] text-sm font-semibold flex items-center"
                >
                  Admin Portal Dashboard
                </Link>
                <Link
                  to="/psychiatrist"
                  className="min-h-[40px] px-3 rounded-xl bg-[#FAF8F3] border border-[#2D6A4F]/15 text-[#1B2A20] text-sm font-medium flex items-center hover:bg-[#EAF4EE]"
                >
                  Psychiatrist Desk
                </Link>
                <Link
                  to="/support-desk"
                  className="min-h-[40px] px-3 rounded-xl bg-[#FAF8F3] border border-[#2D6A4F]/15 text-[#1B2A20] text-sm font-medium flex items-center hover:bg-[#EAF4EE]"
                >
                  Support Desk
                </Link>
                <Link
                  to="/notifications"
                  className="min-h-[40px] px-3 rounded-xl bg-[#FAF8F3] border border-[#2D6A4F]/15 text-[#1B2A20] text-sm font-medium flex items-center hover:bg-[#EAF4EE]"
                >
                  Notifications
                </Link>
              </div>
            </section>
          ) : isPsychiatrist ? (
            <section className="bg-white rounded-2xl border border-[#2D6A4F]/15 p-5 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-display font-semibold text-base text-[#1B2A20] flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-[#2D6A4F]" />
                  <span>Consultation Overview</span>
                </h2>
                <span
                  className={`text-xs font-semibold uppercase ${
                    availableForConsult ? "text-[#2D6A4F]" : "text-[#4A5A4F]"
                  }`}
                >
                  {availableForConsult ? "Accepting Requests" : "Paused"}
                </span>
              </div>
              <p className="text-sm text-[#4A5A4F]">
                Mode: {consultMode} · {sessionDurationMins} mins
              </p>
              <p className="text-sm text-[#4A5A4F]">
                Languages: {consultLanguages.join(", ") || "Hindi, English"}
              </p>
              <p className="text-sm text-[#4A5A4F]">
                Active Slots: {preferredSlots.length} configured
              </p>
              <Link
                to="/psychiatrist"
                className="min-h-[40px] px-4 rounded-xl bg-[#EAF4EE] text-[#2D6A4F] hover:bg-[#DDECE3] text-sm font-semibold inline-flex items-center gap-2 transition-colors"
              >
                <Stethoscope className="w-4 h-4" />
                <span>Open Psychiatrist Desk</span>
              </Link>
            </section>
          ) : isSupportStaff ? (
            <section className="bg-white rounded-2xl border border-[#2D6A4F]/15 p-5 space-y-3">
              <h2 className="font-display font-semibold text-base text-[#1B2A20] flex items-center gap-2">
                <Headphones className="w-4 h-4 text-[#2D6A4F]" />
                <span>Support Coordinator Desk</span>
              </h2>
              <p className="text-sm text-[#4A5A4F]">
                Review open farmer tickets, claim cases, and send replies from
                the Support Desk.
              </p>
              <Link
                to="/support-desk"
                className="min-h-[40px] px-4 rounded-xl bg-[#EAF4EE] text-[#2D6A4F] hover:bg-[#DDECE3] text-sm font-semibold inline-flex items-center gap-2 transition-colors"
              >
                <Headphones className="w-4 h-4" />
                <span>Open Support Desk</span>
              </Link>
            </section>
          ) : isWarehouseOwner ? (
            <section className="bg-white rounded-2xl border border-[#2D6A4F]/15 p-5 space-y-3">
              <h2 className="font-display font-semibold text-base text-[#1B2A20] flex items-center gap-2">
                <Warehouse className="w-4 h-4 text-[#2D6A4F]" />
                <span>Warehouse Operations &amp; Finance</span>
              </h2>
              <p className="text-sm text-[#4A5A4F]">
                Manage capacity, approve farmer storage bookings, or review
                commercial construction, running capital, and land purchase loans
                plus facility insurance.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Link
                  to="/"
                  className="min-h-[40px] px-3 rounded-xl bg-[#EAF4EE] text-[#2D6A4F] hover:bg-[#DDECE3] text-sm font-semibold flex items-center transition-colors"
                >
                  Owner Dashboard
                </Link>
                <Link
                  to="/warehouses"
                  className="min-h-[40px] px-3 rounded-xl bg-[#FAF8F3] border border-[#2D6A4F]/15 text-[#1B2A20] text-sm font-medium flex items-center hover:bg-[#EAF4EE] transition-colors"
                >
                  My Warehouses
                </Link>
                <Link
                  to="/loans"
                  className="min-h-[40px] px-3 rounded-xl bg-[#FAF8F3] border border-[#2D6A4F]/15 text-[#1B2A20] text-sm font-medium flex items-center hover:bg-[#EAF4EE] transition-colors"
                >
                  Commercial Loans
                </Link>
                <Link
                  to="/insurance"
                  className="min-h-[40px] px-3 rounded-xl bg-[#FAF8F3] border border-[#2D6A4F]/15 text-[#1B2A20] text-sm font-medium flex items-center hover:bg-[#EAF4EE] transition-colors"
                >
                  Facility Insurance
                </Link>
              </div>
            </section>
          ) : (
            <section className="bg-white rounded-2xl border border-[#2D6A4F]/15 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-display font-semibold text-base text-[#1B2A20]">
                  Saved Schemes ({savedSchemes.length})
                </h2>
                <Link
                  to="/schemes"
                  className="text-xs font-semibold text-[#2D6A4F] hover:underline"
                >
                  Browse
                </Link>
              </div>
              {savedSchemes.length === 0 ? (
                <p className="text-sm text-[#4A5A4F]">No schemes saved yet.</p>
              ) : (
                <div className="space-y-2">
                  {savedSchemes.map((s) => (
                    <Link
                      key={s.id}
                      to={`/schemes/${s.schemeId}`}
                      className="flex items-center gap-2 text-sm font-medium text-[#2D6A4F] hover:underline"
                    >
                      <BookmarkCheck className="w-4 h-4 shrink-0" />
                      <span className="truncate">{s.schemeName}</span>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
      )}

      {/* Psychiatrist Availability & Consultation Settings */}
      {isPsychiatrist && !editing && (
        <section className="bg-white rounded-2xl border border-[#2D6A4F]/15 p-5 md:p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#EAF4EE] text-[#2D6A4F] flex items-center justify-center shrink-0">
                <CalendarClock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-display font-semibold text-lg text-[#1B2A20]">
                  Availability &amp; Consultation Settings
                </h2>
                <p className="text-sm text-[#4A5A4F]">
                  Configure when farmers can book confidential sessions, your
                  preferred consultation mode, languages, and active slots.
                </p>
              </div>
            </div>

            <button
              type="button"
              aria-pressed={availableForConsult}
              onClick={() => setAvailableForConsult((prev) => !prev)}
              className={`min-h-[42px] px-4 rounded-xl font-semibold text-sm shrink-0 transition-colors border ${
                availableForConsult
                  ? "bg-[#2D6A4F] border-[#2D6A4F] text-white hover:bg-[#23543E]"
                  : "bg-[#FAF8F3] border-[#2D6A4F]/25 text-[#4A5A4F] hover:bg-[#F2EFE6]"
              }`}
            >
              {availableForConsult
                ? "Available for Farmers"
                : "Availability Paused"}
            </button>
          </div>

          {consultError && (
            <div
              role="alert"
              className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700"
            >
              {consultError}
            </div>
          )}

          {consultSavedNotice && (
            <div
              role="status"
              className="p-3.5 rounded-xl bg-[#EAF4EE] border border-[#2D6A4F]/25 text-sm font-medium text-[#1B2A20] flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-[#2D6A4F] shrink-0" />
              <span>{consultSavedNotice}</span>
            </div>
          )}

          <form onSubmit={handleSaveConsultSettings} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label
                  htmlFor="consult-mode"
                  className="block text-sm font-medium text-[#1B2A20] mb-1"
                >
                  Consultation Mode
                </label>
                <select
                  id="consult-mode"
                  value={consultMode}
                  onChange={(e) =>
                    setConsultMode(e.target.value as ConsultationMode)
                  }
                  className="w-full h-11 px-3.5 rounded-xl bg-[#FAF8F3] border border-[#2D6A4F]/25 text-sm text-[#1B2A20]"
                >
                  {CONSULTATION_MODE_OPTIONS.map((mode) => (
                    <option key={mode} value={mode}>
                      {mode}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="consult-duration"
                  className="block text-sm font-medium text-[#1B2A20] mb-1"
                >
                  Session Duration
                </label>
                <select
                  id="consult-duration"
                  value={sessionDurationMins}
                  onChange={(e) =>
                    setSessionDurationMins(
                      Number(e.target.value) as SessionDurationMins
                    )
                  }
                  className="w-full h-11 px-3.5 rounded-xl bg-[#FAF8F3] border border-[#2D6A4F]/25 text-sm text-[#1B2A20] tabular-nums"
                >
                  {SESSION_DURATION_OPTIONS.map((mins) => (
                    <option key={mins} value={mins}>
                      {mins} mins
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="consult-experience"
                  className="block text-sm font-medium text-[#1B2A20] mb-1"
                >
                  Years of Experience
                </label>
                <input
                  id="consult-experience"
                  type="number"
                  min={0}
                  max={70}
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl bg-[#FAF8F3] border border-[#2D6A4F]/25 text-sm text-[#1B2A20] tabular-nums"
                />
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-[#1B2A20]">
                Consultation Languages ({consultLanguages.length} selected)
              </p>
              <div className="flex flex-wrap gap-2">
                {CONSULTATION_LANGUAGE_OPTIONS.map((lang) => {
                  const active = consultLanguages.includes(lang);
                  return (
                    <button
                      key={lang}
                      type="button"
                      aria-pressed={active}
                      onClick={() => toggleLanguage(lang)}
                      className={`min-h-[38px] px-3.5 rounded-xl text-xs font-semibold border transition-colors ${
                        active
                          ? "bg-[#EAF4EE] border-[#2D6A4F] text-[#2D6A4F]"
                          : "bg-[#FAF8F3] border-[#2D6A4F]/20 text-[#4A5A4F] hover:border-[#2D6A4F]/45"
                      }`}
                    >
                      {lang}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-[#1B2A20]">
                Available Time Slots ({preferredSlots.length} active)
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {CONSULTATION_SLOT_OPTIONS.map((slot) => {
                  const active = preferredSlots.includes(slot);
                  return (
                    <button
                      key={slot}
                      type="button"
                      aria-pressed={active}
                      onClick={() => toggleSlot(slot)}
                      className={`min-h-[42px] px-3.5 rounded-xl text-xs font-semibold text-left border transition-colors ${
                        active
                          ? "bg-[#EAF4EE] border-[#2D6A4F] text-[#2D6A4F]"
                          : "bg-[#FAF8F3] border-[#2D6A4F]/20 text-[#4A5A4F] hover:border-[#2D6A4F]/45"
                      }`}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label
                htmlFor="consult-bio"
                className="block text-sm font-medium text-[#1B2A20] mb-1"
              >
                Doctor Care Bio (shown to farmers)
              </label>
              <textarea
                id="consult-bio"
                rows={3}
                value={careBio}
                onChange={(e) => setCareBio(e.target.value)}
                placeholder="Describe your consultation focus and reassuring approach for farming families..."
                className="w-full p-3.5 rounded-xl bg-[#FAF8F3] border border-[#2D6A4F]/25 text-sm text-[#1B2A20]"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <p className="text-xs text-[#4A5A4F]">
                Status:{" "}
                <strong className="text-[#1B2A20]">
                  {availableForConsult
                    ? "Accepting farmer consultation requests"
                    : "New consultation requests paused"}
                </strong>
              </p>
              <button
                type="submit"
                disabled={consultSaving}
                className="min-h-[44px] px-6 rounded-xl bg-[#E9A23B] hover:bg-[#DC9428] disabled:opacity-60 text-[#1B2A20] font-semibold text-sm transition-colors"
              >
                {consultSaving ? "Saving Settings..." : "Save Consultation Settings"}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Storage Bookings History (Farmer Only) */}
      {isFarmer && (
        <section className="bg-white rounded-2xl border border-[#2D6A4F]/15 p-5 md:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Warehouse className="w-5 h-5 text-[#2D6A4F]" />
              <h2 className="font-display font-semibold text-lg text-[#1B2A20]">
                My Storage Booking Requests
              </h2>
            </div>
            <Link
              to="/warehouses"
              className="text-sm font-semibold text-[#2D6A4F] hover:underline"
            >
              Find Storage
            </Link>
          </div>

          {bookings.length === 0 ? (
            <p className="text-sm text-[#4A5A4F]">
              You have not submitted any storage booking requests yet.
            </p>
          ) : (
            <div className="divide-y divide-[#2D6A4F]/10">
              {bookings.map((bk) => (
                <div
                  key={bk.id}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <p className="font-semibold text-sm text-[#1B2A20]">
                      {bk.warehouseName} · {bk.cropType} ({bk.quantity} {bk.unit})
                    </p>
                    <p className="text-xs text-[#4A5A4F] mt-0.5 tabular-nums">
                      Starts {bk.startDate} · {bk.durationMonths} mo · Est. Rs.{" "}
                      {bk.estimatedCostInr.toLocaleString("en-IN")} · Status:{" "}
                      <strong className="uppercase text-[#2D6A4F]">
                        {bk.status}
                      </strong>
                    </p>
                  </div>
                  {bk.status === "pending" && (
                    <button
                      type="button"
                      onClick={() => updateBookingStatus(bk.id, "cancelled")}
                      className="min-h-[38px] px-3.5 rounded-xl border border-red-200 text-red-700 text-xs font-semibold self-start sm:self-auto"
                    >
                      Cancel Request
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
