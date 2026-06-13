import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { AppShell } from "@/components/nutri/AppShell";

export const Route = createFileRoute("/_protected")({
  component: ProtectedLayout,
});

function ProtectedLayout() {
  const { token, isReady } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isReady && !token) navigate({ to: "/login", replace: true });
  }, [isReady, token, navigate]);

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="h-1 w-40 shimmer" />
      </div>
    );
  }
  if (!token) return null;

  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
