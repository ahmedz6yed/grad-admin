import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, ShieldCheck, Loader2, Timer, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useResendResetOtp, extractError } from '../hooks/useAuthMutations';
import Logo from '../components/ui/Logo';

export default function VerifyOtp() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef([]);
  const [cooldown, setCooldown] = useState(60);
  const cooldownRef = useRef(null);

  const resendOtp = useResendResetOtp();

  // Redirect to start if accessed without email
  if (!email) {
    return <Navigate to="/forgot-password" replace />;
  }

  // ── Cooldown timer ─────────────────────────────────────────
  const startCooldown = useCallback(() => {
    setCooldown(60);
    if (cooldownRef.current) clearInterval(cooldownRef.current);
    cooldownRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(cooldownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => {
    startCooldown();
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, [startCooldown]);

  // ── Handle OTP Input ─────────────────────────────────────────
  const handleChange = (index, e) => {
    const value = e.target.value;
    if (isNaN(value)) return;

    const newOtp = [...otp];
    // Allow pasting
    if (value.length > 1) {
      const pastedData = value.slice(0, 6).split('');
      for (let i = 0; i < 6; i++) {
        newOtp[i] = pastedData[i] || '';
      }
      setOtp(newOtp);
      // Focus last filled input
      const lastFilledIndex = newOtp.findLastIndex((val) => val !== '');
      const focusIndex = lastFilledIndex < 5 ? lastFilledIndex + 1 : 5;
      inputRefs.current[focusIndex]?.focus();
    } else {
      newOtp[index] = value;
      setOtp(newOtp);
      // Move to next input if value is entered
      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6).split('');
    const newOtp = [...otp];
    for (let i = 0; i < 6; i++) {
      if (!isNaN(pastedData[i])) {
        newOtp[i] = pastedData[i] || '';
      }
    }
    setOtp(newOtp);
    const lastFilledIndex = newOtp.findLastIndex((val) => val !== '');
    const focusIndex = lastFilledIndex < 5 && lastFilledIndex !== -1 ? lastFilledIndex + 1 : 5;
    inputRefs.current[focusIndex]?.focus();
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }
    // Navigate to Reset Password
    navigate('/reset-password', { state: { email, otp: otpValue } });
  };

  // ── Resend OTP ─────────────────────────────────────────────
  const handleResend = () => {
    resendOtp.mutate(email, {
      onSuccess: () => {
        startCooldown();
        toast.success('A new OTP has been sent to your email');
      },
      onError: (err) => {
        const msg = extractError(err, 'Could not resend OTP');
        toast.error(msg);
      },
    });
  };

  // Mask email for display
  const maskedEmail = email.replace(/(.{2})(.*)(@.*)/, (_, a, b, c) => a + '*'.repeat(b.length) + c);

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
              <ShieldCheck className="w-5 h-5 text-accent" />
            </div>
            <h2 className="text-3xl font-black text-charcoal tracking-tight mb-3">
              Verify Code
            </h2>
            <p className="text-text-muted font-medium leading-relaxed text-sm">
              We sent a 6-digit code to{' '}
              <span className="text-charcoal font-bold">{maskedEmail}</span>.{' '}
              <button
                type="button"
                onClick={() => navigate('/forgot-password')}
                className="text-accent font-bold hover:underline"
              >
                Change email
              </button>
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-6" noValidate>
            <div className="flex flex-col gap-2 group">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1 group-focus-within:text-accent transition-colors">
                6-Digit Code
              </label>
              <div className="flex gap-2 justify-between" onPaste={handlePaste}>
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-14 bg-surface border border-border rounded-xl text-center text-xl text-charcoal focus:outline-none focus:ring-4 focus:ring-accent/10 focus:border-accent transition-all font-medium shadow-sm"
                    autoFocus={index === 0}
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="group cursor-pointer relative w-full h-12 bg-accent hover:bg-accent-hover text-cream font-bold uppercase tracking-widest text-[10px] rounded-xl shadow-xl shadow-accent/10 transition-all hover:scale-[1.01] active:scale-[0.99] overflow-hidden"
            >
              <div className="absolute inset-0 bg-charcoal translate-y-full group-hover:translate-y-0 transition-transform duration-300 opacity-10" />
              <span className="relative z-10 flex items-center justify-center gap-2">
                Continue{' '}
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>

            {/* Resend OTP */}
            <div className="flex items-center justify-between mt-2">
              <button
                type="button"
                onClick={() => navigate('/forgot-password')}
                className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-text-subtle hover:text-accent transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3 h-3" />
                Back
              </button>

              <button
                type="button"
                onClick={handleResend}
                disabled={cooldown > 0 || resendOtp.isPending}
                className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 text-accent hover:text-accent-hover"
              >
                {resendOtp.isPending ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : cooldown > 0 ? (
                  <>
                    <Timer className="w-3 h-3" />
                    Resend in {cooldown}s
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-3 h-3" />
                    Resend OTP
                  </>
                )}
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
