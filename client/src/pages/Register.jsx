import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

const initialState = {
  name: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  role: "student",
};

export default function Register() {
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  function update(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await register(form);
      toast.success("Registration successful");
      navigate(user.role === "owner" ? "/owner/dashboard" : "/student/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto mt-12 bg-white shadow-md rounded-xl p-8">
      <h1 className="font-heading text-2xl font-semibold mb-6">Create your account</h1>

      <div className="flex gap-2 mb-6">
        {["student", "owner"].map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setForm({ ...form, role: r })}
            className={`flex-1 py-2 rounded-md border ${
              form.role === r ? "bg-brand-green text-white border-brand-green" : "border-gray-300"
            }`}
          >
            {r === "student" ? "Student" : "PG Owner"}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="name" placeholder="Name" required value={form.name} onChange={update}
          className="w-full border rounded-md p-3" />
        <input name="email" type="email" placeholder="Email" required value={form.email} onChange={update}
          className="w-full border rounded-md p-3" />
        <input name="phone" placeholder="Phone" value={form.phone} onChange={update}
          className="w-full border rounded-md p-3" />
        <input name="password" type="password" placeholder="Password" required value={form.password} onChange={update}
          className="w-full border rounded-md p-3" />
        <input name="confirmPassword" type="password" placeholder="Confirm Password" required
          value={form.confirmPassword} onChange={update} className="w-full border rounded-md p-3" />

        <button disabled={loading} type="submit"
          className="w-full bg-brand-blue text-white py-3 rounded-md font-medium disabled:opacity-60">
          {loading ? "Creating account..." : "Register"}
        </button>
      </form>
    </div>
  );
}
