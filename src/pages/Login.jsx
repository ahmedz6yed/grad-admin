import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "react-router-dom";
import {
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  Loader2,
  Eye,
  EyeOff,
  AlertCircle,
} from "lucide-react";
import { useLogin, parseLoginApiError } from "../hooks/useAuthMutations";
import Logo from "../components/ui/Logo";
import LoginWithGoogle from "../components/ui/LoginWithGoogle";

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Invalid email format")
    .max(254, "Email must be at most 254 characters"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be at most 128 characters"),
});

const FormInput = ({ label, id, error, icon: Icon, children }) => (
  <div className="flex flex-col gap-2 group">
    <label
      htmlFor={id}
      className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1 group-focus-within:text-accent transition-colors"
    >
      {label}
    </label>
    <div className="relative">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-accent transition-colors">
        {Icon && <Icon className="w-4 h-4" />}
      </div>
      {children}
    </div>
    {error && (
      <span
        role="alert"
        className="text-[11px] text-red-500 font-bold px-1 animate-in fade-in slide-in-from-top-1"
      >
        {error.message}
      </span>
    )}
  </div>
);

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [rootError, setRootError] = useState(null);
  const serverFieldErrorsRef = useRef(new Set());

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  const {
    mutate: loginUser,
    isPending: isLoggingIn,
    reset: resetLoginMutation,
  } = useLogin();

  const clearServerErrors = () => {
    setRootError(null);
    serverFieldErrorsRef.current = new Set();
    clearErrors(["email", "password"]);
    resetLoginMutation();
  };

  const onSubmit = (data) => {
    clearServerErrors();
    loginUser(data, {
      onError: (err) => {
        const { fieldErrors, rootMessage } = parseLoginApiError(err);
        if (fieldErrors.email) {
          serverFieldErrorsRef.current.add("email");
          setError("email", { type: "server", message: fieldErrors.email });
        }
        if (fieldErrors.password) {
          serverFieldErrorsRef.current.add("password");
          setError("password", {
            type: "server",
            message: fieldErrors.password,
          });
        }
        if (rootMessage) {
          setRootError(rootMessage);
        }
      },
    });
  };

  const emailRegister = register("email");
  const passwordRegister = register("password");

  return (
    <div className="min-h-screen bg-page flex flex-col relative overflow-hidden font-sans text-text">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-accent/[0.03] -skew-x-12 translate-x-1/4 pointer-events-none"></div>

      {/* Top Left Logo */}
      <div className="p-8 md:p-12 animate-in fade-in slide-in-from-left-4 duration-700">
        <Logo className="text-3xl" />
      </div>

      <main className="flex-1 flex items-center justify-center p-6 pb-24">
        <div className="w-full max-w-[400px] animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100">
          <div className="mb-12">
            <h2 className="text-4xl font-black text-charcoal tracking-tight mb-4">
              Sign In
            </h2>
            <p className="text-text-muted font-medium leading-relaxed">
              Enter your credentials to access the{" "}
              <span className="text-accent font-bold">FixPay</span>{" "}
              administrative terminal.
            </p>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-8"
            noValidate
          >
            {rootError && (
              <div
                role="alert"
                className="flex gap-3 rounded-xl border border-red-200/80 bg-red-50/90 px-4 py-3 text-[13px] font-medium text-red-800 shadow-sm"
              >
                <AlertCircle
                  className="mt-0.5 h-4 w-4 shrink-0 text-red-600"
                  aria-hidden
                />
                <p className="leading-snug">{rootError}</p>
              </div>
            )}

            <div className="space-y-6">
              <FormInput
                label="Account Email"
                id="email"
                error={errors.email}
                icon={Mail}
              >
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  {...emailRegister}
                  onChange={(e) => {
                    emailRegister.onChange(e);
                    setRootError(null);
                    if (serverFieldErrorsRef.current.has("email")) {
                      serverFieldErrorsRef.current.delete("email");
                      clearErrors("email");
                    }
                  }}
                  className={`w-full h-12 bg-surface border rounded-xl pl-12 pr-4 text-charcoal placeholder:text-text-subtle/50 focus:outline-none focus:ring-4 focus:ring-accent/10 transition-all font-medium shadow-sm ${
                    errors.email
                      ? "border-red-400 focus:border-red-500 focus:ring-red-500/15"
                      : "border-border focus:border-accent"
                  }`}
                  placeholder="admin@fixpay.io"
                />
              </FormInput>

              <FormInput
                label="Security Key"
                id="password"
                error={errors.password}
                icon={Lock}
              >
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    {...passwordRegister}
                    onChange={(e) => {
                      passwordRegister.onChange(e);
                      setRootError(null);
                      if (serverFieldErrorsRef.current.has("password")) {
                        serverFieldErrorsRef.current.delete("password");
                        clearErrors("password");
                      }
                    }}
                    className={`w-full h-12 bg-surface border rounded-xl pl-12 pr-12 text-charcoal placeholder:text-text-subtle/50 focus:outline-none focus:ring-4 focus:ring-accent/10 transition-all font-medium shadow-sm ${
                      errors.password
                        ? "border-red-400 focus:border-red-500 focus:ring-red-500/15"
                        : "border-border focus:border-accent"
                    }`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-accent transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </FormInput>

              <div className="flex justify-end -mt-1">
                <Link
                  to="/forgot-password"
                  className="text-[10px] font-bold uppercase tracking-widest text-accent hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 rounded"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="group cursor-pointer relative w-full h-12 bg-accent hover:bg-accent-hover text-cream font-bold uppercase tracking-widest text-[10px] rounded-xl shadow-xl shadow-accent/10 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
            >
              <div className="absolute inset-0 bg-charcoal translate-y-full group-hover:translate-y-0 transition-transform duration-300 opacity-10"></div>
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isLoggingIn ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    Login{" "}
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </span>
            </button>

            <div className="relative my-6">
              <div
                className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-t border-border/80"
                aria-hidden
              />
              <div className="relative flex justify-center">
                <span className="bg-page px-4 text-[10px] font-bold uppercase tracking-widest text-text-subtle">
                  or
                </span>
              </div>
            </div>

            <LoginWithGoogle />
          </form>

          <div className="mt-8 text-center animate-in fade-in slide-in-from-bottom-2 duration-700 delay-300">
            <p className="text-[11px] font-bold uppercase tracking-widest text-text-subtle">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-accent hover:text-accent-hover hover:underline transition-colors"
              >
                Create Account
              </Link>
            </p>
          </div>

          {/* Minimalist Footer inside the flow */}
          <div className="mt-16 pt-8 border-t border-border/50 flex items-center justify-between">
            <div className="flex gap-6 text-[9px] font-bold uppercase tracking-widest text-text-subtle">
              <Link
                to="/privacy"
                className="hover:text-accent transition-colors"
              >
                Privacy
              </Link>
              <Link to="/terms" className="hover:text-accent transition-colors">
                Terms
              </Link>
            </div>
            <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-text-subtle/60">
              <ShieldCheck className="w-3 h-3" /> Encrypted
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;
//google
