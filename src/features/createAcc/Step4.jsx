import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Building2,
  Loader2,
  MapPin,
  Navigation,
} from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import * as z from "zod";
import { useStepStore } from "../../store/useStepStore";
import { useRegister } from "../../hooks/useAuthMutations";
import { toast } from "sonner";

const schema = z.object({
  government: z.string().min(1, "Government is required"),
  city: z.string().min(1, "City is required"),
  street: z.string().min(1, "Street is required"),
});

export default function Step4({ onSubmit, isLoading, apiError }) {
  const { formData, updateForm, setStep } = useStepStore();

  useEffect(() => {
    setStep(4);
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: {
      ...formData,
      government: formData.address?.government || "",
      city: formData.address?.city || "",
      street: formData.address?.street || "",
    },
  });
  const navigate = useNavigate();
  function PrevStep() {
    navigate("/register/personal-info");
  }

  const { mutate: registerUser, isPending } = useRegister({
    onSuccess: (data) => {
      toast.success(data.message || "Registration successful");
      navigate("/register/email-otp");
      if (onSubmit) {
        onSubmit(data);
      }
    },
    onError: (error) => {
      const msg =
        error.response?.data?.message ||
        error.response?.data?.errors?.[0]?.msg ||
        "Registration failed. Please try again.";
      toast.error(msg, { position: "bottom-right" });
    },
  });

  const handleFormSubmit = (data) => {
    // Restructure to match required format: { address: { ... } }
    const formattedData = {
      address: {
        government: data.government,
        city: data.city,
        street: data.street,
      },
    };

    updateForm(formattedData);
    
    // Combine state and new data to submit
    const finalData = { ...formData, ...formattedData };
    console.log("Submitting final Form Data:", finalData);
    registerUser(finalData);
  };

  return (
    <div className="flex flex-col h-full w-full animate-in fade-in duration-500">
      <div className="mb-8 relative pl-5">
        <div className="absolute left-0 top-1.5 w-1.5 h-8 bg-accent rounded-full shadow-sm"></div>
        <h2 className="text-3xl font-serif text-charcoal mb-2 tracking-tight">
          Location Details
        </h2>
        <p className="text-muted text-sm leading-relaxed max-w-[280px]">
          Please provide your address information to complete the setup.
        </p>
      </div>

      <form
        onSubmit={handleSubmit(handleFormSubmit)}
        className="flex flex-col gap-6 flex-1"
      >
        {/* Government */}
        <div className="flex flex-col gap-2 group">
          <label className="text-[11px] font-bold text-charcoal/70 uppercase tracking-widest">
            Government / State
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <MapPin className="h-4 w-4 text-text-subtle group-focus-within:text-accent transition-colors duration-300" />
            </div>
            <input
              {...register("government")}
              type="text"
              className={`input pl-10 py-3.5 bg-surface hover:bg-surface-raised focus:bg-surface-raised border-transparent hover:border-border focus:border-accent shadow-sm transition-all duration-300 rounded-xl ${errors.government ? "border-red-500 focus:border-red-500 bg-red-50/10" : ""}`}
              placeholder="e.g. Cairo"
            />
          </div>
          {errors.government && (
            <span className="text-xs text-red-500 font-medium animate-in fade-in">
              {errors.government.message}
            </span>
          )}
        </div>

        {/* City */}
        <div className="flex flex-col gap-2 group">
          <label className="text-[11px] font-bold text-charcoal/70 uppercase tracking-widest">
            City
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Building2 className="h-4 w-4 text-text-subtle group-focus-within:text-accent transition-colors duration-300" />
            </div>
            <input
              {...register("city")}
              type="text"
              className={`input pl-10 py-3.5 bg-surface hover:bg-surface-raised focus:bg-surface-raised border-transparent hover:border-border focus:border-accent shadow-sm transition-all duration-300 rounded-xl ${errors.city ? "border-red-500 focus:border-red-500 bg-red-50/10" : ""}`}
              placeholder="e.g. Maadi"
            />
          </div>
          {errors.city && (
            <span className="text-xs text-red-500 font-medium animate-in fade-in">
              {errors.city.message}
            </span>
          )}
        </div>

        {/* Street */}
        <div className="flex flex-col gap-2 group">
          <label className="text-[11px] font-bold text-charcoal/70 uppercase tracking-widest">
            Street Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Navigation className="h-4 w-4 text-text-subtle group-focus-within:text-accent transition-colors duration-300" />
            </div>
            <input
              {...register("street")}
              type="text"
              className={`input pl-10 py-3.5 bg-surface hover:bg-surface-raised focus:bg-surface-raised border-transparent hover:border-border focus:border-accent shadow-sm transition-all duration-300 rounded-xl ${errors.street ? "border-red-500 focus:border-red-500 bg-red-50/10" : ""}`}
              placeholder="e.g. 15 Street Name"
            />
          </div>
          {errors.street && (
            <span className="text-xs text-red-500 font-medium animate-in fade-in">
              {errors.street.message}
            </span>
          )}
        </div>

        <div className="mt-auto pt-4 flex flex-col gap-4 pb-8">
          {/* API Error Banner */}
          {apiError && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <p className="text-xs text-red-600 font-medium">{apiError}</p>
            </div>
          )}

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
              type="submit"
              disabled={isPending}
              className="btn btn-primary flex-1 justify-center py-3.5 rounded-xl group shadow-md hover:shadow-lg shadow-accent/20 hover:bg-accent-hover transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Registering...
                </>
              ) : (
                <>
                  Register
                  <ArrowRight className="w-4 h-4 ml-1.5 opacity-80 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
