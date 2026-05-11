import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, RefreshCw, AlertCircle, ArrowLeft } from "lucide-react";
import { useStepStore } from "../../store/useStepStore";
import { useConfirmEmail, useResendOtp } from "../../hooks/useAuthMutations";
import { toast } from "sonner";

export default function Step5() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState(null);
  const [resendTimer, setResendTimer] = useState(0);
  const inputRefs = useRef([]);
  const navigate = useNavigate();

  const { setStep, formData } = useStepStore();

  const { mutate: confirmEmailMutate, isPending: loading } = useConfirmEmail({
    onSuccess: (data) => {
      toast.success(data.message || "Your email has been verified successfully");
      console.log("Registration Complete! OTP Verified.");
      // Usually navigate to success or login here
      navigate("/login"); 
    },
    onError: (err) => {
      const msg = err.response?.data?.message || "Invalid OTP";
      setError(msg);
      toast.error(msg, { position: "bottom-right" });
    },
  });

  const { mutate: resendOtpMutate, isPending: resendLoading } = useResendOtp({
    onSuccess: (data) => {
      toast.success(data.message || "A new verification OTP has been sent", { position: "bottom-right" });
      setResendTimer(60);
    },
    onError: (err) => {
      const msg = err.response?.data?.message || "Could not resend OTP";
      setError(msg);
      toast.error(msg, { position: "bottom-right" });
    },
  });

  useEffect(() => {
    // Set global step
    setStep(5);

    // Focus first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const verifyOtp = (otpValue) => {
    setError(null);
    confirmEmailMutate(otpValue);
  };

  const handleChange = (index, value) => {
    const digit = value.replace(/[^0-9]/g, "").slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    if (digit && index < 5) {
      inputRefs.current[index + 1].focus();
    }

    if (newOtp.every((d) => d !== "") && newOtp.join("").length === 6) {
      verifyOtp(newOtp.join(""));
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData
      .getData("text")
      .replace(/[^0-9]/g, "")
      .slice(0, 6)
      .split("");
    if (pasteData.length === 0) return;

    const newOtp = [...otp];
    pasteData.forEach((char, i) => {
      if (i < 6) newOtp[i] = char;
    });
    setOtp(newOtp);

    const nextIdx = Math.min(pasteData.length, 5);
    inputRefs.current[nextIdx].focus();

    if (newOtp.every((d) => d !== "") && newOtp.join("").length === 6) {
      verifyOtp(newOtp.join(""));
    }
  };

  const handleResend = () => {
    if (resendTimer > 0 || resendLoading) return;

    setError(null);
    resendOtpMutate();
  };

  const PrevStep = () => {
    navigate("/register/location-details");
  };

  return (
    <div className="flex flex-col h-full w-full animate-in fade-in duration-500">
      <div className="mb-8 relative pl-5">
        <div className="absolute left-0 top-1.5 w-1.5 h-8 bg-accent rounded-full shadow-sm"></div>
        <h2 className="text-3xl font-serif text-charcoal mb-2 tracking-tight">
          Verify Email
        </h2>
        <p className="text-muted text-sm leading-relaxed max-w-[280px]">
          We've sent a 6-digit code to{" "}
          <span className="font-semibold text-charcoal">
            {formData?.email || "your email"}
          </span>
          . Enter it below to verify your account.
        </p>
      </div>

      <div className="flex flex-col gap-8 flex-1">
        <div className="flex flex-col gap-4">
          <div className="flex justify-between gap-2">
            {otp.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => (inputRefs.current[idx] = el)}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={digit}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                onPaste={handlePaste}
                disabled={loading}
                className={`w-full aspect-square max-w-[50px] text-center text-2xl font-bold rounded-xl border-2 transition-all duration-300 outline-none
                  ${error ? "border-red-500 bg-red-50/10" : "border-transparent bg-surface hover:border-border focus:border-accent focus:bg-surface-raised shadow-sm"}
                  ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
              />
            ))}
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-500 animate-in slide-in-from-top-1">
              <AlertCircle size={16} />
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}
        </div>

        <div className="mt-auto flex flex-col gap-4 pb-8">
          <div className="flex gap-4">
            <button
              type="button"
              onClick={PrevStep}
              className="btn btn-ghost px-6 justify-center py-3.5 rounded-xl hover:bg-surface-raised group border-border/80 text-charcoal/80 hover:text-charcoal transition-all"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5 text-text-subtle group-hover:-translate-x-1 transition-transform" />
              Back
            </button>
            <button
              type="button"
              onClick={handleResend}
              disabled={resendTimer > 0 || resendLoading || loading}
              className={`btn flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl transition-all font-medium
                ${
                  resendTimer > 0
                    ? "bg-surface text-text-subtle cursor-not-allowed border-border/50 border"
                    : "btn-ghost hover:bg-surface-raised text-charcoal border border-border/50"
                }`}
            >
              {resendLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-accent" />
              ) : resendTimer > 0 ? (
                <>
                  <RefreshCw className="w-4 h-4 opacity-50 animate-spin-once" />
                  <span>Resend in {resendTimer}s</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 text-accent" />
                  <span>Resend Code</span>
                </>
              )}
            </button>
          </div>

          {loading && (
            <div className="flex items-center justify-center gap-3 py-2 animate-pulse">
              <Loader2 className="w-5 h-5 animate-spin text-accent" />
              <span className="text-sm font-semibold text-accent tracking-wide uppercase">
                Verifying...
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
