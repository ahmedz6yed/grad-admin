import { useNavigate } from "react-router-dom";
import SignUpWithGoogle from "../../components/ui/SignUpWithGoogel";
import { Mail } from "lucide-react";
import { useStepStore } from "../../store/useStepStore";
import { useEffect } from "react";

export default function Step1() {
  const navigate = useNavigate();
  const setStep = useStepStore((state) => state.setStep);
  const resetForm = useStepStore((state) => state.reset);

  useEffect(() => {
    resetForm();
    setStep(1);
  }, [resetForm, setStep]);
  function Login() {
    navigate("/login");
  }
  function HandleContinueWithEmail() {
    setStep(2);
    navigate("/register/basic-info");
  }
  return (
    <div className="w-full flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mb-10 text-center">
        <h2 className="text-4xl font-serif text-text mb-3">
          Create an account
        </h2>
        <p className="text-text-muted font-sans text-sm max-w-[280px] mx-auto leading-relaxed">
          Join FixPay and start managing your payments with ease.
        </p>
      </div>

      <div className="w-full flex flex-col gap-4 mb-8">
        <SignUpWithGoogle />

        <div className="flex items-center gap-4 my-2">
          <div className="h-px bg-border flex-1 opacity-50"></div>
          <span className="text-[10px] text-text-subtle uppercase tracking-widest font-bold">
            or
          </span>
          <div className="h-px bg-border flex-1 opacity-50"></div>
        </div>

        <button
          className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg bg-sage hover:bg-sage-dark text-cream transition-all duration-200 cursor-pointer shadow-md hover:shadow-lg active:scale-[0.98]"
          onClick={HandleContinueWithEmail}
        >
          <Mail size={18} />
          <span className="font-sans font-semibold text-sm">
            Continue with an Email
          </span>
        </button>
      </div>

      <p className="text-[11px] text-text-subtle text-center px-6 leading-relaxed mb-10">
        By signing up, you agree to our{" "}
        <a
          href="#"
          className="text-accent hover:underline font-bold transition-all"
        >
          Terms of Service
        </a>{" "}
        and{" "}
        <a
          href="#"
          className="text-accent hover:underline font-bold transition-all"
        >
          Privacy Policy
        </a>
        .
      </p>

      <div className="w-full pt-8 border-t border-border/30">
        <button
          onClick={Login}
          className="w-full py-3.5 px-4 font-sans font-medium text-xs rounded-lg bg-surface-raised/50 border border-border/50 hover:bg-surface-raised transition-all cursor-pointer text-text-muted group"
        >
          Already have an account?{" "}
          <span className="text-accent font-bold ml-1 group-hover:underline transition-all">
            Log in
          </span>
        </button>
      </div>
    </div>
  );
}
