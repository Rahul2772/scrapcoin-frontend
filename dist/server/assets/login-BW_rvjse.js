import { ag as useNavigate, r as reactExports, L as jsxRuntimeExports, a4 as Link, ai as toast } from "./vendor-D_Usrqei.js";
import { u as useAuth, B as Button, s as supabase } from "./router-Bj6HzPyA.js";
import { I as Input } from "./input-B46-WYs4.js";
import { L as Label } from "./label-BYMti0SU.js";
import { B as BrandLogo } from "./brand-logo-DsYSfcsW.js";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./supabase-BkcVLFJa.js";
function LoginPage() {
  const {
    signIn
  } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = reactExports.useState("");
  const [password, setPassword] = reactExports.useState("");
  const [loading, setLoading] = reactExports.useState(false);
  const [resendLoading, setResendLoading] = reactExports.useState(false);
  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await signIn(email, password);
      toast.success("Logged in successfully!");
      await navigate({
        to: "/my-bookings"
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }
  async function handleResendVerification() {
    if (!email) {
      toast.error("Enter your email address first.");
      return;
    }
    setResendLoading(true);
    try {
      const {
        error
      } = await supabase.auth.resend({
        email,
        type: "signup",
        options: {
          emailRedirectTo: `${window.location.origin}/login`
        }
      });
      if (error) throw error;
      toast.success("Verification email resent. Check your inbox and spam.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to resend verification email");
    } finally {
      setResendLoading(false);
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-md space-y-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(BrandLogo, { className: "mx-auto mb-4" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold text-foreground", children: "Welcome back" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Sign in to view your bookings" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, autoComplete: "off", className: "rounded-3xl border border-border/60 bg-card p-8 space-y-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "email", children: "Email" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "email", type: "email", autoComplete: "off", placeholder: "you@example.com", value: email, onChange: (e) => setEmail(e.target.value), required: true })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "password", children: "Password" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "password", type: "password", autoComplete: "new-password", placeholder: "••••••••", value: password, onChange: (e) => setPassword(e.target.value), required: true })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", className: "w-full rounded-full", disabled: loading, children: loading ? "Signing in..." : "Sign in" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "secondary", className: "w-full rounded-full", onClick: handleResendVerification, disabled: resendLoading, children: resendLoading ? "Resending…" : "Resend verification email" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-center text-sm text-muted-foreground", children: [
        "Don't have an account?",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/register", className: "text-primary hover:underline", children: "Register" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center text-sm text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", className: "hover:underline", children: "← Back to home" }) })
    ] })
  ] }) });
}
export {
  LoginPage as component
};
