import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff, Leaf } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/nutri/Toast";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Create account — NutriAI" },
      { name: "description", content: "Start your NutriAI journey." },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (name.trim().length < 2) errs.name = "Enter your full name";
    if (!/^\S+@\S+\.\S+$/.test(email)) errs.email = "Enter a valid email";
    if (password.length < 6) errs.password = "Password must be at least 6 characters";
    if (password !== confirm) errs.confirm = "Passwords must match";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setLoading(true);
    try {
      await register(name, email, password);
      toast("Account created");
      navigate({ to: "/onboarding" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Registration failed";
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
        <p className="label-spaced">Create account</p>
        <h1 className="font-serif italic text-5xl md:text-6xl mt-4 text-text">Start your journey.</h1>
        <p className="text-muted mt-4 max-w-sm">
          Tell us a few things and the model gets to work building your week.
        </p>

        <form onSubmit={onSubmit} className="mt-12 max-w-md flex flex-col gap-7">
          <div>
            <label className="label-spaced block mb-2">Full name</label>
            <input className="field" value={name} onChange={(e) => setName(e.target.value)} placeholder="Alex Morgan" />
            {errors.name && <p className="text-xs text-[color:var(--danger)] mt-2">{errors.name}</p>}
          </div>
          <div>
            <label className="label-spaced block mb-2">Email</label>
            <input
              type="email"
              className="field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-[color:var(--danger)] mt-2">{errors.password}</p>
            )}
          </div>
          <div>
            <label className="label-spaced block mb-2">Confirm password</label>
            <input
              type={showPw ? "text" : "password"}
              className="field"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="••••••••"
            />
            {errors.confirm && (
              <p className="text-xs text-[color:var(--danger)] mt-2">{errors.confirm}</p>
            )}
          </div>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? "Creating…" : "Create Account →"}
          </button>
          <p className="text-sm text-muted">
            Already have an account?{" "}
            <Link to="/login" className="link-accent">
              Sign in
            </Link>
          </p>
        </form>
      </div>
      <div className="hidden md:flex relative overflow-hidden bg-surface items-center justify-center">
        <div
          className="font-serif italic font-bold outline-text leading-[0.9] select-none text-center"
          style={{ fontSize: "180px", transform: "rotate(-6deg)", opacity: 0.4 }}
        >
          HEALTH IS<br />WEALTH
        </div>
      </div>
    </div>
  );
}
