import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, Eye, EyeOff } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import * as z from "zod";
import { useStepStore } from "../../store/useStepStore";

const schema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    userName: z.string().min(1, "Username is required"),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(/[^A-Za-z0-9]/, "Password must contain at least one symbol"),
    confirmPassword: z.string().min(1, "Confirm password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export default function Step2({ onNext }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { formData, updateForm, setStep } = useStepStore();

  useEffect(() => {
    setStep(2);
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
      firstName: formData.name?.first || "",
      lastName: formData.name?.last || "",
    },
  });
  const navigate = useNavigate();
  function PrevStep() {
    navigate("/register");
  }

  const onSubmit = (data) => {
    // Restructure to match required format: { name: { first, last } }
    const { firstName, lastName, ...rest } = data;
    const formattedData = {
      ...rest,
      name: {
        first: firstName,
        last: lastName,
      },
    };

    updateForm(formattedData);
    console.log("Updated Form Data:", { ...formData, ...formattedData });
    navigate("/register/personal-info");
    if (onNext) onNext(data);
  };

  return (
    <div className="flex flex-col h-full w-full">
      <div className="mb-6">
        <h2 className="text-2xl font-serif text-charcoal mb-2">
          Personal Details
        </h2>
        <p className="text-muted">Please fill in your information.</p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4 flex-1"
      >
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-charcoal">
              First Name
            </label>
            <input
              {...register("firstName")}
              type="text"
              className={`input ${errors.firstName ? "border-red-500 focus:border-red-500" : ""}`}
              placeholder="John"
            />
            {errors.firstName && (
              <span className="text-xs text-red-500">
                {errors.firstName.message}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-charcoal">
              Last Name
            </label>
            <input
              {...register("lastName")}
              type="text"
              className={`input ${errors.lastName ? "border-red-500 focus:border-red-500" : ""}`}
              placeholder="Doe"
            />
            {errors.lastName && (
              <span className="text-xs text-red-500">
                {errors.lastName.message}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-charcoal">Username</label>
          <input
            {...register("userName")}
            type="text"
            className={`input ${errors.userName ? "border-red-500 focus:border-red-500" : ""}`}
            placeholder="johndoe123"
          />
          {errors.userName && (
            <span className="text-xs text-red-500">
              {errors.userName.message}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-charcoal">Email</label>
          <input
            {...register("email")}
            type="email"
            className={`input ${errors.email ? "border-red-500 focus:border-red-500" : ""}`}
            placeholder="john@example.com"
          />
          {errors.email && (
            <span className="text-xs text-red-500">{errors.email.message}</span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-charcoal">Password</label>
          <div className="relative">
            <input
              {...register("password")}
              type={showPassword ? "text" : "password"}
              className={`input w-full pr-10 ${errors.password ? "border-red-500 focus:border-red-500" : ""}`}
              placeholder="••••••••"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-subtle hover:text-accent transition-colors"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && (
            <span className="text-xs text-red-500">
              {errors.password.message}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-charcoal">
            Confirm Password
          </label>
          <div className="relative">
            <input
              {...register("confirmPassword")}
              type={showConfirmPassword ? "text" : "password"}
              className={`input w-full pr-10 ${errors.confirmPassword ? "border-red-500 focus:border-red-500" : ""}`}
              placeholder="••••••••"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-subtle hover:text-accent transition-colors"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.confirmPassword && (
            <span className="text-xs text-red-500">
              {errors.confirmPassword.message}
            </span>
          )}
        </div>

        <div className="mt-8 flex gap-4 pb-8">
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
            className="btn btn-primary flex-1 justify-center py-3.5 rounded-xl group shadow-md hover:shadow-lg shadow-accent/20 hover:bg-accent-hover transition-all"
          >
            Next
            <ArrowRight className="w-4 h-4 ml-1.5 opacity-80 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </form>
    </div>
  );
}
