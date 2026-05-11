import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowRight, ArrowLeft, ShieldCheck, Loader2, KeyRound } from 'lucide-react';
import { toast } from 'sonner';
import { useForgotPassword, extractError } from '../hooks/useAuthMutations';
import Logo from '../components/ui/Logo';

// ── Schemas ──────────────────────────────────────────────────
const emailSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .email('Invalid email format')
    .max(254, 'Email must be at most 254 characters'),
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

// ── Main component ───────────────────────────────────────────
export default function ForgotPassword() {
  const navigate = useNavigate();
  const forgotPw = useForgotPassword();

  const emailForm = useForm({
    resolver: zodResolver(emailSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
  });

  // ── Submit email ───────────────────────────────────
  const onEmailSubmit = (data) => {
    forgotPw.mutate(data.email, {
      onSuccess: () => {
        toast.success('Check your email for a 6-digit OTP');
        navigate('/verify-otp', { state: { email: data.email } });
      },
      onError: (err) => {
        const msg = extractError(err, 'Something went wrong');
        if (err?.response?.status === 403) {
          toast.error('Please verify your email before requesting a password reset');
        } else if (err?.response?.status === 429) {
          toast.error(msg || 'Too many requests. Please wait before trying again.');
        } else {
          toast.error(msg);
        }
      },
    });
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
              <KeyRound className="w-5 h-5 text-accent" />
            </div>
            <h2 className="text-3xl font-black text-charcoal tracking-tight mb-3">
              Forgot Password
            </h2>
            <p className="text-text-muted font-medium leading-relaxed text-sm">
              Enter the email linked to your{' '}
              <span className="text-accent font-bold">FixPay</span> account.
              We'll send a 6-digit code to reset your password.
            </p>
          </div>

          <form
            onSubmit={emailForm.handleSubmit(onEmailSubmit)}
            className="space-y-8"
            noValidate
          >
            <FormInput
              label="Account Email"
              id="fp-email"
              error={emailForm.formState.errors.email}
              icon={Mail}
            >
              <input
                id="fp-email"
                type="email"
                autoComplete="email"
                autoFocus
                {...emailForm.register('email')}
                className={`w-full h-12 bg-surface border rounded-xl pl-12 pr-4 text-charcoal placeholder:text-text-subtle/50 focus:outline-none focus:ring-4 focus:ring-accent/10 transition-all font-medium shadow-sm ${
                  emailForm.formState.errors.email
                    ? 'border-red-400 focus:border-red-500 focus:ring-red-500/15'
                    : 'border-border focus:border-accent'
                }`}
                placeholder="you@example.com"
              />
            </FormInput>

            <button
              type="submit"
              disabled={forgotPw.isPending}
              className="group cursor-pointer relative w-full h-12 bg-accent hover:bg-accent-hover text-cream font-bold uppercase tracking-widest text-[10px] rounded-xl shadow-xl shadow-accent/10 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
            >
              <div className="absolute inset-0 bg-charcoal translate-y-full group-hover:translate-y-0 transition-transform duration-300 opacity-10" />
              <span className="relative z-10 flex items-center justify-center gap-2">
                {forgotPw.isPending ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Sending…
                  </>
                ) : (
                  <>
                    Send OTP{' '}
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </span>
            </button>
          </form>

          <div className="mt-8 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-text-subtle hover:text-accent transition-colors"
            >
              <ArrowLeft className="w-3 h-3" />
              Back to Login
            </Link>
          </div>

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
