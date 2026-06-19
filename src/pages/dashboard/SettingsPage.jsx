import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function SettingsPage() {
  const { profile, updateProfile, signOut } = useAuth();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState(profile?.display_name || "");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await updateProfile({ display_name: displayName });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("Failed to save:", err);
    } finally {
      setSaving(false);
    }
  }

  async function handleSignOut() {
    await signOut();
    navigate("/login");
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex flex-col gap-4 p-6 max-w-lg mx-auto">
      <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-lg font-semibold">⚙️ Settings</motion.h1>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card bg-base-100 border border-base-300">
        <div className="card-body gap-4">
          <h3 className="card-title text-sm">Profile</h3>

          <div className="form-control">
            <label className="label"><span className="label-text text-sm">Username</span></label>
            <input
              type="text"
              className="input input-bordered input-sm"
              value={profile?.username || ""}
              disabled
            />
            <label className="label"><span className="label-text-alt text-xs text-base-content/40">Username cannot be changed</span></label>
          </div>

          <div className="form-control">
            <label className="label"><span className="label-text text-sm">Display Name</span></label>
            <input
              type="text"
              className="input input-bordered input-sm"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>

          <div className="form-control">
            <label className="label"><span className="label-text text-sm">Email</span></label>
            <input
              type="email"
              className="input input-bordered input-sm"
              value={profile?.id || ""}
              disabled
            />
          </div>

          <AnimatePresence>
            {saved && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="alert alert-success text-sm py-2">
                <span>Settings saved successfully!</span>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="btn btn-primary btn-sm w-fit" onClick={handleSave} disabled={saving}>
            {saving ? <span className="loading loading-spinner loading-xs" /> : "Save Changes"}
          </motion.button>
        </div>
      </motion.div>

      {/* Preferences */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card bg-base-100 border border-base-300">
        <div className="card-body gap-3">
          <h3 className="card-title text-sm">Preferences</h3>

          <div className="form-control">
            <label className="label cursor-pointer">
              <span className="label-text text-sm">Daily challenge notifications</span>
              <input type="checkbox" defaultChecked className="toggle toggle-primary toggle-sm" />
            </label>
          </div>

          <div className="form-control">
            <label className="label cursor-pointer">
              <span className="label-text text-sm">Streak reminders</span>
              <input type="checkbox" defaultChecked className="toggle toggle-primary toggle-sm" />
            </label>
          </div>

          <div className="form-control">
            <label className="label"><span className="label-text text-sm">Interface language</span></label>
            <select className="select select-bordered select-sm">
              <option>English</option>
              <option>Bahasa Indonesia</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Danger zone */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card bg-base-100 border border-error/30">
        <div className="card-body gap-3">
          <h3 className="card-title text-sm text-error">Account</h3>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="btn btn-outline btn-error btn-sm w-fit" onClick={handleSignOut}>
            Sign Out
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
