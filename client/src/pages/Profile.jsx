import { useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    college: user?.college || "",
    course: user?.course || "",
    year: user?.year || "",
    gender: user?.gender || "",
    preferredLocation: user?.preferredLocation || "",
    budget: user?.budget || "",
  });

  function update(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile(form);
      toast.success("Profile updated successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  }

  const inputClass = "w-full border rounded-md p-2.5 text-sm";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div className="max-w-2xl mx-auto py-10 px-6">
      <h1 className="font-heading text-2xl font-semibold mb-1">My Profile</h1>
      <p className="text-sm text-gray-500 mb-6">
        Logged in as <span className="font-medium">{user?.email}</span> ({user?.role === "owner" ? "PG Owner" : "Student"})
      </p>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <div>
          <label className={labelClass}>Name</label>
          <input required name="name" className={inputClass} value={form.name} onChange={update} />
        </div>
        <div>
          <label className={labelClass}>Phone</label>
          <input name="phone" className={inputClass} value={form.phone} onChange={update} />
        </div>

        {user?.role === "student" && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>College</label>
                <input name="college" className={inputClass} value={form.college} onChange={update} />
              </div>
              <div>
                <label className={labelClass}>Course</label>
                <input name="course" className={inputClass} value={form.course} onChange={update} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Year</label>
                <input name="year" className={inputClass} value={form.year} onChange={update} />
              </div>
              <div>
                <label className={labelClass}>Gender</label>
                <select name="gender" className={inputClass} value={form.gender} onChange={update}>
                  <option value="">Prefer not to say</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Preferred Location</label>
                <input name="preferredLocation" className={inputClass} value={form.preferredLocation} onChange={update} />
              </div>
              <div>
                <label className={labelClass}>Budget (₹/mo)</label>
                <input type="number" min="0" name="budget" className={inputClass} value={form.budget} onChange={update} />
              </div>
            </div>
          </>
        )}

        <button disabled={loading} type="submit"
          className="w-full bg-brand-blue text-white py-3 rounded-md font-medium disabled:opacity-60">
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
