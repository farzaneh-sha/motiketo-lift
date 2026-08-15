"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AppHeader from "@/components/AppHeader";
import { API_BASE_URL } from "@/lib/api";

const FREQUENCY_OPTIONS = [
  { value: "weekly", label: "Weekly" },
  { value: "biweekly", label: "Biweekly" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "off", label: "Off" },
];

function EyeIcon({ visible }) {
  if (visible) {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    );
  }
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.94 10.94 0 0112 19c-7 0-11-7-11-7a20.3 20.3 0 015.06-5.94M9.9 4.24A10.6 10.6 0 0112 4c7 0 11 7 11 7a20.3 20.3 0 01-3.22 4.16" />
      <path d="M14.12 14.12a3 3 0 11-4.24-4.24" />
      <path d="M1 1l22 22" />
    </svg>
  );
}

function Pill({ children }) {
  return (
    <span className="inline-flex items-center rounded-full bg-[#eaf3ea] px-4 py-1.5 text-sm text-[#4f7a52]">
      {children}
    </span>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  // Personal information
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [draftName, setDraftName] = useState("");
  const [draftEmail, setDraftEmail] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState("");

  // Food preferences
  const [proteins, setProteins] = useState([]);
  const [vegetables, setVegetables] = useState([]);

  // Motivational messages
  const [frequency, setFrequency] = useState("weekly");
  const [frequencyError, setFrequencyError] = useState("");

  // Change password
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  useEffect(() => {
    const storedUserId = localStorage.getItem("user_id");
    setUserId(storedUserId);

    if (!storedUserId) {
      setLoading(false);
      return;
    }

    Promise.all([
      fetch(`${API_BASE_URL}/users/${storedUserId}/dashboard`).then((res) => res.json()),
      fetch(`${API_BASE_URL}/users/${storedUserId}/food-preferences`).then((res) => res.json()),
    ])
      .then(([dashboardData, foodPreferences]) => {
        setName(dashboardData.user.name);
        setEmail(dashboardData.user.email);
        setDraftName(dashboardData.user.name);
        setDraftEmail(dashboardData.user.email);
        setFrequency(dashboardData.user.message_frequency);
        setProteins(foodPreferences.proteins);
        setVegetables(foodPreferences.vegetables);
        setLoading(false);
      })
      .catch(() => {
        setLoadError("Could not load profile.");
        setLoading(false);
      });
  }, []);

  function startEditing() {
    setDraftName(name);
    setDraftEmail(email);
    setProfileError("");
    setIsEditing(true);
  }

  async function saveChanges() {
    setProfileError("");
    setSavingProfile(true);

    try {
      const res = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: draftName, email: draftEmail }),
      });

      if (!res.ok) {
        setProfileError("Could not update profile.");
        setSavingProfile(false);
        return;
      }

      const data = await res.json();
      setName(data.name);
      setEmail(data.email);
      setIsEditing(false);
      setSavingProfile(false);
    } catch {
      setProfileError("Could not update profile.");
      setSavingProfile(false);
    }
  }

  function cancelEditing() {
    setDraftName(name);
    setDraftEmail(email);
    setProfileError("");
    setIsEditing(false);
  }

  async function handleFrequencyChange(e) {
    const newFrequency = e.target.value;
    const previousFrequency = frequency;
    setFrequency(newFrequency);
    setFrequencyError("");

    try {
      const res = await fetch(`${API_BASE_URL}/users/${userId}/message-frequency`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message_frequency: newFrequency }),
      });

      if (!res.ok) {
        setFrequency(previousFrequency);
        setFrequencyError("Could not update message frequency.");
      }
    } catch {
      setFrequency(previousFrequency);
      setFrequencyError("Could not update message frequency.");
    }
  }

  function startChangingPassword() {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordError("");
    setPasswordSuccess(false);
    setIsChangingPassword(true);
  }

  function cancelChangingPassword() {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordError("");
    setIsChangingPassword(false);
  }

  async function submitPasswordChange() {
    setPasswordError("");
    setPasswordSaving(true);

    try {
      const res = await fetch(`${API_BASE_URL}/users/${userId}/password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
      });

      if (res.status === 400) {
        setPasswordError("Current password is incorrect.");
        setPasswordSaving(false);
        return;
      }

      if (!res.ok) {
        setPasswordError("Could not change password.");
        setPasswordSaving(false);
        return;
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordSaving(false);
      setIsChangingPassword(false);
      setPasswordSuccess(true);
    } catch {
      setPasswordError("Could not change password.");
      setPasswordSaving(false);
    }
  }

  function handleSignOut() {
    localStorage.removeItem("user_id");
    localStorage.removeItem("behavior_cluster");
    router.push("/login");
  }

  const canChangePassword =
    currentPassword && newPassword && confirmPassword && newPassword === confirmPassword;

  return (
    <div className="min-h-screen bg-[#f6f8f5]">
      <AppHeader active="profile" />

      <main className="max-w-3xl mx-auto px-6 sm:px-8 py-10">
        <h1 className="text-4xl font-bold text-gray-900">Profile</h1>
        <p className="mt-2 text-gray-500">Manage your account and preferences.</p>

        {!userId ? (
          <p className="mt-6 text-sm text-red-500">User not found.</p>
        ) : loading ? (
          <p className="mt-6 text-sm text-gray-500">Loading profile...</p>
        ) : loadError ? (
          <p className="mt-6 text-sm text-red-500">{loadError}</p>
        ) : (
          <>
            {/* Personal information */}
            <div className="mt-8 bg-white rounded-3xl shadow-sm p-8">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Personal Information
                </p>
                {!isEditing && (
                  <button
                    type="button"
                    onClick={startEditing}
                    className="text-sm font-medium text-[#6f9b6f] hover:underline"
                  >
                    Edit →
                  </button>
                )}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-800 mb-1.5">Name</label>
                      <input
                        type="text"
                        value={draftName}
                        onChange={(e) => setDraftName(e.target.value)}
                        className="w-full h-11 rounded-xl bg-[#eef2ef] px-4 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-[#6f9b6f]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-800 mb-1.5">Email</label>
                      <input
                        type="email"
                        value={draftEmail}
                        onChange={(e) => setDraftEmail(e.target.value)}
                        className="w-full h-11 rounded-xl bg-[#eef2ef] px-4 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-[#6f9b6f]"
                      />
                    </div>
                    {profileError && <p className="text-sm text-red-500">{profileError}</p>}

                    <div className="flex items-center gap-4 pt-1">
                      <button
                        type="button"
                        disabled={savingProfile}
                        onClick={saveChanges}
                        className="rounded-xl bg-[#eaf3ea] px-5 py-2.5 text-sm font-semibold text-[#4f7a52] hover:bg-[#dcebdc] transition-colors disabled:opacity-70"
                      >
                        {savingProfile ? "Saving..." : "Save Changes"}
                      </button>
                      <button
                        type="button"
                        onClick={cancelEditing}
                        className="text-sm font-medium text-gray-500 hover:text-gray-700"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500">Name</p>
                      <p className="font-bold text-gray-900">{name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-bold text-gray-900">{email}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Food preferences */}
            <div className="mt-6 bg-white rounded-3xl shadow-sm p-8">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Food Preferences
                </p>
                <Link
                  href="/profile/preferences/proteins"
                  className="text-sm font-medium text-[#6f9b6f] hover:underline"
                >
                  Edit Preferences →
                </Link>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 space-y-4">
                <div>
                  <p className="font-semibold text-gray-900">Proteins</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {proteins.map((item) => (
                      <Pill key={item.id}>{item.name}</Pill>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Vegetables</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {vegetables.map((item) => (
                      <Pill key={item.id}>{item.name}</Pill>
                    ))}
                  </div>
                </div>
              </div>
              <p className="mt-4 pt-4 border-t border-gray-100 text-sm text-gray-400">
                Changes will apply to your next meal plan.
              </p>
            </div>

            {/* Motivational messages */}
            <div className="mt-6 bg-white rounded-3xl shadow-sm p-8">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Motivational Messages
              </p>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-gray-600">
                  Receive personalized motivational messages based on your behavioral profile.
                </p>
                <div className="mt-4 flex items-center justify-between gap-4">
                  <label className="font-semibold text-gray-900">Frequency</label>
                  <select
                    value={frequency}
                    onChange={handleFrequencyChange}
                    className="rounded-xl bg-[#eef2ef] px-4 py-2.5 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-[#6f9b6f]"
                  >
                    {FREQUENCY_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                {frequencyError && <p className="mt-3 text-sm text-red-500">{frequencyError}</p>}
              </div>
            </div>

            {/* Account / Change password */}
            {isChangingPassword ? (
              <div className="mt-6 bg-white rounded-3xl shadow-sm p-8">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Change Password
                </p>
                <div className="mt-4 pt-4 border-t border-gray-100 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-1.5">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrent ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter current password"
                        className="w-full h-11 rounded-xl bg-[#eef2ef] px-4 pr-11 text-sm text-gray-800 placeholder-gray-400 outline-none focus:ring-2 focus:ring-[#6f9b6f]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrent((v) => !v)}
                        className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
                      >
                        <EyeIcon visible={showCurrent} />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-1.5">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showNew ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                        className="w-full h-11 rounded-xl bg-[#eef2ef] px-4 pr-11 text-sm text-gray-800 placeholder-gray-400 outline-none focus:ring-2 focus:ring-[#6f9b6f]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNew((v) => !v)}
                        className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
                      >
                        <EyeIcon visible={showNew} />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-1.5">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirm ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        className="w-full h-11 rounded-xl bg-[#eef2ef] px-4 pr-11 text-sm text-gray-800 placeholder-gray-400 outline-none focus:ring-2 focus:ring-[#6f9b6f]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm((v) => !v)}
                        className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
                      >
                        <EyeIcon visible={showConfirm} />
                      </button>
                    </div>
                  </div>

                  {passwordError && <p className="text-sm text-red-500">{passwordError}</p>}

                  <div className="flex items-center gap-4 pt-1">
                    <button
                      type="button"
                      disabled={!canChangePassword || passwordSaving}
                      onClick={submitPasswordChange}
                      className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors ${
                        canChangePassword && !passwordSaving
                          ? "bg-[#6f9b6f] text-white hover:bg-[#5f8a5f] cursor-pointer"
                          : "bg-[#e3ebe3] text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      {passwordSaving ? "Changing..." : "Change Password"}
                    </button>
                    <button
                      type="button"
                      onClick={cancelChangingPassword}
                      className="text-sm font-medium text-gray-500 hover:text-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-6 bg-white rounded-3xl shadow-sm p-8">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Account</p>
                {passwordSuccess && (
                  <p className="mt-4 rounded-xl bg-[#eaf3ea] px-4 py-3 text-sm font-medium text-[#4f7a52]">
                    Password changed successfully.
                  </p>
                )}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={startChangingPassword}
                    className="w-full flex items-center justify-between py-3 text-left"
                  >
                    <span className="font-medium text-gray-900">Change Password</span>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                      <polyline points="9 6 15 12 9 18" />
                    </svg>
                  </button>
                  <div className="border-t border-gray-100" />
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="w-full flex items-center justify-between py-3 text-left"
                  >
                    <span className="font-medium text-gray-900">Sign Out</span>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                      <polyline points="9 6 15 12 9 18" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
