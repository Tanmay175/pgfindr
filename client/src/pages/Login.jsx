import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success("Login successful");
      navigate(user.role === "owner" ? "/owner/dashboard" : "/student/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto mt-12 bg-white shadow-md rounded-xl p-8">
      <h1 className="font-heading text-2xl font-semibold mb-6">Welcome back</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="email" placeholder="Email" required value={email}
          onChange={(e) => setEmail(e.target.value)} className="w-full border rounded-md p-3" />
        <input type="password" placeholder="Password" required value={password}
          onChange={(e) => setPassword(e.target.value)} className="w-full border rounded-md p-3" />
        <button disabled={loading} type="submit"
          className="w-full bg-brand-blue text-white py-3 rounded-md font-medium disabled:opacity-60">
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}
