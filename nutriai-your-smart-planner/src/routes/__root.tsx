import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Outlet, Link, createRootRouteWithContext, useRouter } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AuthProvider } from "@/contexts/AuthContext";
import { DietProvider } from "@/contexts/DietContext";
import { ToastProvider } from "@/components/nutri/Toast";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <div className="max-w-md text-center">
        <h1 className="font-serif text-7xl italic text-accent">404</h1>
        <h2 className="mt-4 font-serif text-2xl text-text">Page not found</h2>
        <p className="mt-2 text-sm text-muted">This page hasn't been planned yet.</p>
        <Link to="/" className="mt-6 inline-block link-accent">Back home →</Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  useEffect(() => { console.error(error); }, [error]);
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <div className="max-w-md text-center">
        <h1 className="font-serif text-2xl text-text">Something went off-plan.</h1>
        <p className="mt-2 text-sm text-muted">Try again or head back home.</p>
        <div className="mt-6 flex justify-center gap-6">
          <button onClick={() => { router.invalidate(); reset(); }} className="link-accent">Try again →</button>
          <a href="/" className="text-muted hover:text-text">Go home</a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function AnimatedOutlet() {
  const router = useRouter();
  const key = router.state.location.pathname;
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={key}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.28, ease: "easeOut" }}
      >
        <Outlet />
      </motion.div>
    </AnimatePresence>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <DietProvider>
          <ToastProvider>
            <AnimatedOutlet />
          </ToastProvider>
        </DietProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
