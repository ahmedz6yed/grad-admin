import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, ArrowRight, Loader2, AlertCircle, ShieldCheck } from 'lucide-react';
import { useForgotPassword, extractError } from '../hooks/useAuthMutations';
import Logo from '../components/ui/Logo';

const schema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .email('Invalid email format')
    .max(254, 'Email must be at most 254 characters'),
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

const ForgotPassword = () => {
  const [rootError, setRootError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
  });

  const { mutate: requestReset, isPending } = useForgotPassword();

  const onSubmit = (data) => {
    setRootError(null);
    requestReset(data.email, {
      onError: (err) => {
        setRootError(
          extractError(err, 'Could not request a password reset. Please try again.')
        );
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
        <div className="w-full max-w-[400px] animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100">
          <div className="mb-12">
            <h2 className="text-4xl font-black text-charcoal tracking-tight mb-4">Reset access</h2>
            <p className="text-text-muted font-medium leading-relaxed">
              Enter the email for your account. If it exists and is verified, we will send a one-time
              code. For security, the result is the same whether or not the address is registered.
            </p>
            <p className="mt-3 text-[12px] text-text-subtle leading-relaxed">
              You can request a new code once every 60 seconds per email.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8" noValidate>
            {rootError && (
              <div
                role="alert"
                className="flex gap-3 rounded-xl border border-red-200/80 bg-red-50/90 px-4 py-3 text-[13px] font-medium text-red-800 shadow-sm"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" aria-hidden />
                <p className="leading-snug">{rootError}</p>
              </div>
            )}

            <FormInput label="Account email" id="email" error={errors.email} icon={Mail}>
              <input
                id="email"
                type="email"
                autoComplete="email"
                {...register('email', {
                  onChange: () => setRootError(null),
                })}
                className={`w-full h-12 bg-surface border rounded-xl pl-12 pr-4 text-charcoal placeholder:text-text-subtle/50 focus:outline-none focus:ring-4 focus:ring-accent/10 transition-all font-medium shadow-sm ${
                  errors.email
                    ? 'border-red-400 focus:border-red-500 focus:ring-red-500/15'
                    : 'border-border focus:border-accent'
                }`}
                placeholder="admin@fixpay.io"
              />
            </FormInput>

            <button
              type="submit"
              disabled={isPending}
              className="group cursor-pointer relative w-full h-12 bg-accent hover:bg-accent-hover text-cream font-bold uppercase tracking-widest text-[10px] rounded-xl shadow-xl shadow-accent/10 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
            >
              <div className="absolute inset-0 bg-charcoal translate-y-full group-hover:translate-y-0 transition-transform duration-300 opacity-10" />
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isPending ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Sending…
                  </>
                ) : (
                  <>
                    Send reset code <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </span>
            </button>

            <p className="text-center text-[12px] text-text-muted">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 font-bold text-accent hover:underline"
              >
                <ArrowLeft className="w-3.5 h-3.5" aria-hidden />
                Back to sign in
              </Link>
            </p>
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
};

export default ForgotPassword;
