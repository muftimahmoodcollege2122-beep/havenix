import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const redirectTo = (location.state as any)?.from || "/account";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate(redirectTo);
    } catch (err: any) {
      setError(err.message || "Could not log in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[420px] mx-auto px-4 sm:px-6 py-16">
      <h1 className="font-serif text-[26px] text-ink mb-2 text-center">Welcome Back</h1>
      <p className="text-muted text-[14px] text-center mb-8">Log in to view your orders and account details.</p>

      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="text-[11px] tracking-widest uppercase text-muted block mb-1.5">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
          />
        </div>
        <div>
          <label className="text-[11px] tracking-widest uppercase text-muted block mb-1.5">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
          />
        </div>
        {error && <p className="text-rose text-[13px]">{error}</p>}
        <button
          disabled={loading}
          className="w-full bg-espresso text-cream py-3.5 text-[13px] tracking-widest uppercase hover:bg-ink transition-colors disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Log In"}
        </button>
      </form>

      <p className="text-center text-[13px] text-muted mt-6">
        New to Havenix?{" "}
        <Link to="/signup" className="text-clay underline underline-offset-2">
          Create an account
        </Link>
      </p>
    </div>
  );
}
