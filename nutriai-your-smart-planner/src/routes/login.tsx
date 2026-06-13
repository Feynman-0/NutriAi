import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff, Leaf } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/nutri/Toast";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — NutriAI" },
      { name: "description", content: "Sign in to your NutriAI account." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs: typeof errors = {};
    if (!/^\S+@\S+\.\S+$/.test(email)) errs.email = "Enter a valid email";
    if (password.length < 6) errs.password = "Password must be at least 6 characters";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setLoading(true);
    try {
      await login(email, password);
      toast("Welcome back to NutriAI");
      navigate({ to: "/dashboard" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Sign in failed";
      toast(msg, "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      <div className="flex flex-col px-6 md:px-16 py-10 md:py-20 bg-bg-2">
        <Link to="/" className="flex items-center gap-2 mb-16">
          <Leaf size={18} className="text-accent" />
          <span className="font-serif text-accent">NutriAI</span>
        </Link>
        <p className="label-spaced">Account access</p>
        <h1 className="font-serif italic text-5xl md:text-6xl mt-4 text-text">Welcome back.</h1>
        <p className="text-muted mt-4 max-w-sm">
          Pick up where you left off. Your plan, your progress, your week.
        </p>

        <form onSubmit={onSubmit} className="mt-12 max-w-md flex flex-col gap-8">
          <div>
            <label className="label-spaced block mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="field"
              placeholder="you@email.com"
            />
            {errors.email && <p className="text-xs text-[color:var(--danger)] mt-2">{errors.email}</p>}
          </div>
          <div>
            <label className="label-spaced block mb-2">Password</label>
            <div className="flex items-center border-b border-divider focus-within:border-accent">
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="field !border-0"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPw((s) => !s)}
                className="text-muted hover:text-accent ml-3"
                aria-label="toggle password"
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-[color:var(--danger)] mt-2">{errors.password}</p>
            )}
          </div>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? "Signing in…" : "Sign In →"}
          </button>
          <p className="text-sm text-muted">
            Don't have an account?{" "}
            <Link to="/register" className="link-accent">
              Get started
            </Link>
          </p>
        </form>
      </div>
      <div className="hidden md:flex relative overflow-hidden bg-surface items-center justify-center">
        <div
          className="font-serif italic font-bold outline-text leading-[0.9] select-none"
          style={{ fontSize: "180px", transform: "rotate(-6deg)", opacity: 0.4 }}
        >
          EAT WELL<br />LIVE WELL
        </div>
      </div>
    </div>
  );
}
