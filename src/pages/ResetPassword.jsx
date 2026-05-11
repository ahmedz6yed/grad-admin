import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Lock, ArrowRight, ArrowLeft, ShieldCheck, Loader2, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { useResetPassword, extractError } from '../hooks/useAuthMutations';
import Logo from '../components/ui/Logo';

// ── Schemas ──────────────────────────────────────────────────
const resetSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, 'At least 8 characters')
      .max(100, 'Max 100 characters')
      .regex(/[A-Z]/, 'Must contain an uppercase letter')
      .regex(/[a-z]/, 'Must contain a lowercase letter')
      .regex(/\d/, 'Must contain a number'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

// ── Reusable form field ──────────────────────────────────────
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

// ── Password requirement pill ────────────────────────────────
const PasswordRule = ({ met, label }) => (
  <span
    className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-full transition-all duration-200 ${
      met
        ? 'bg-sage/15 text-sage-dark'
        : 'bg-surface-raised/60 text-text-subtle'
    }`}
  >
    <CheckCircle2 className={`w-3 h-3 ${met ? 'opacity-100' : 'opacity-30'}`} />
    {label}
  </span>
);

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const { email, otp } = location.state || {};

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const resetPw = useResetPassword();

  const resetForm = useForm({
    resolver: zodResolver(resetSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
  });

  const watchedPassword = resetForm.watch('newPassword', '');

  const passwordRules = [
    { met: watchedPassword.length >= 8, label: '8+ chars' },
    { met: /[A-Z]/.test(watchedPassword), label: 'Uppercase' },
    { met: /[a-z]/.test(watchedPassword), label: 'Lowercase' },
    { met: /\d/.test(watchedPassword), label: 'Number' },
  ];

  // Redirect to start if accessed without email/otp
  if (!email || !otp) {
    return <Navigate to="/forgot-password" replace />;
  }

  // ── Submit ─────────────────────────────────────────────────
  const onResetSubmit = (data) => {
    resetPw.mutate(
      { email, otp, newPassword: data.newPassword },
      {
        onSuccess: () => {
          toast.success('Password reset successfully!');
          navigate('/login');
        },
        onError: (err) => {
          const msg = extractError(err, 'Reset failed');
          if (msg.toLowerCase().includes('invalid') || msg.toLowerCase().includes('expired')) {
            toast.error('Invalid or expired OTP. Please request a new one.');
            navigate('/verify-otp', { state: { email } });
          } else {
            toast.error(msg);
          }
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-page flex flex-col relative overflow-hidden font-sans text-text">
      <div className="absolute top-0 right-0 w-1/2 h-full bg-accent/[0.03] -skew-x-12 translate-x-1/4 pointer-events-none" />

      <div className="p-8 md:p-12 animate-in fade-in slide-in-from-left-4 duration-700">
        <Logo className="text-3xl" />
      </div>

      <main className="flex-1 flex items-center justify-center p-6 pb-24">
        <div className="w-full max-w-[420px] animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100">
          <div className="mb-10">
            <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center mb-6">
              <Lock className="w-5 h-5 text-accent" />
            </div>
            <h2 className="text-3xl font-black text-charcoal tracking-tight mb-3">
              Create New Password
            </h2>
            <p className="text-text-muted font-medium leading-relaxed text-sm">
              Please enter your new password below.
            </p>
          </div>

          <form
            onSubmit={resetForm.handleSubmit(onResetSubmit)}
            className="space-y-6"
            noValidate
          >
            {/* New password */}
            <FormInput
              label="New Password"
              id="fp-password"
              error={resetForm.formState.errors.newPassword}
              icon={Lock}
            >
              <div className="relative">
                <input
                  id="fp-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  autoFocus
                  {...resetForm.register('newPassword')}
                  className={`w-full h-12 bg-surface border rounded-xl pl-12 pr-12 text-charcoal placeholder:text-text-subtle/50 focus:outline-none focus:ring-4 focus:ring-accent/10 transition-all font-medium shadow-sm ${
                    resetForm.formState.errors.newPassword
                      ? 'border-red-400 focus:border-red-500 focus:ring-red-500/15'
                      : 'border-border focus:border-accent'
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-accent transition-colors cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </FormInput>

            {/* Password rules */}
            {watchedPassword.length > 0 && (
              <div className="flex flex-wrap gap-1.5 px-1 animate-in fade-in duration-300">
                {passwordRules.map((r) => (
                  <PasswordRule key={r.label} met={r.met} label={r.label} />
                ))}
              </div>
            )}

            {/* Confirm password */}
            <FormInput
              label="Confirm Password"
              id="fp-confirm"
              error={resetForm.formState.errors.confirmPassword}
              icon={Lock}
            >
              <div className="relative">
                <input
                  id="fp-confirm"
                  type={showConfirm ? 'text' : 'password'}
                  autoComplete="new-password"
                  {...resetForm.register('confirmPassword')}
                  className={`w-full h-12 bg-surface border rounded-xl pl-12 pr-12 text-charcoal placeholder:text-text-subtle/50 focus:outline-none focus:ring-4 focus:ring-accent/10 transition-all font-medium shadow-sm ${
                    resetForm.formState.errors.confirmPassword
                      ? 'border-red-400 focus:border-red-500 focus:ring-red-500/15'
                      : 'border-border focus:border-accent'
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-accent transition-colors cursor-pointer"
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
                >
                  {showConfirm ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </FormInput>

            {/* Submit */}
            <button
              type="submit"
              disabled={resetPw.isPending}
              className="group cursor-pointer relative w-full h-12 bg-accent hover:bg-accent-hover text-cream font-bold uppercase tracking-widest text-[10px] rounded-xl shadow-xl shadow-accent/10 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
            >
              <div className="absolute inset-0 bg-charcoal translate-y-full group-hover:translate-y-0 transition-transform duration-300 opacity-10" />
              <span className="relative z-10 flex items-center justify-center gap-2">
                {resetPw.isPending ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Resetting…
                  </>
                ) : (
                  <>
                    Reset Password{' '}
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </span>
            </button>

            <div className="mt-2">
              <button
                type="button"
                onClick={() => navigate('/verify-otp', { state: { email } })}
                className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-text-subtle hover:text-accent transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3 h-3" />
                Back to Code Verification
              </button>
            </div>
          </form>

          <div className="mt-16 pt-8 border-t border-border/50 flex items-center justify-between">
            <div className="flex gap-6 text-[9px] font-bold uppercase tracking-widest text-text-subtle">
              <Link to="/privacy" className="hover:text-accent transition-colors">
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
}
