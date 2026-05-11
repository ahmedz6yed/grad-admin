import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  ChevronDown,
  Phone,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import * as z from "zod";
import { COUNTRIES } from "../../data/countries.js";
import { useStepStore } from "../../store/useStepStore";

const schema = z.object({
  phonePrefix: z.string().min(1, "Prefix is required"),
  phoneNumber: z
    .string()
    .length(10, "Phone number must be exactly 10 digits")
    .regex(/^\d+$/, "Must contain only numbers"),
  ssn: z
    .string()
    .length(14, "SSN must be exactly 14 digits")
    .regex(/^\d+$/, "SSN must contain only numbers"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z
    .string({
      required_error: "Please select a gender",
      invalid_type_error: "Please select a gender",
    })
    .refine((val) => val === "true" || val === "false", {
      message: "Please select a valid gender",
    })
    .transform((val) => val === "true"),
});

export default function Step3({ onNext, onBack }) {
  const { formData, updateForm, setStep } = useStepStore();

  useEffect(() => {
    setStep(3);
  }, []);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: (() => {
      // Find which prefix the phone number starts with
      const storedPrefix =
        COUNTRIES.find((c) => formData.phoneNumber?.startsWith(c.prefix))
          ?.prefix || "+20";
      const storedNumber =
        formData.phoneNumber?.replace(storedPrefix, "") || "";

      // Convert DD-MM-YYYY back to YYYY-MM-DD for the date input
      let storedDob = "";
      if (formData.dateOfBirth) {
        const [d, m, y] = formData.dateOfBirth.split("-");
        if (y && m && d) storedDob = `${y}-${m}-${d}`;
      }

      return {
        ...formData,
        phonePrefix: storedPrefix,
        phoneNumber: storedNumber,
        dateOfBirth: storedDob,
        gender:
          formData.gender === undefined ? "true" : String(formData.gender),
      };
    })(),
  });

  const navigate = useNavigate();

  function PrevStep() {
    navigate("/register/basic-info");
  }

  const genderValue = useWatch({
    control,
    name: "gender",
  });
  const [isCountryOpen, setIsCountryOpen] = useState(false);
  const countryRef = useRef(null);

  const phonePrefix = useWatch({ control, name: "phonePrefix" }) || "+20";
  const selectedCountry =
    COUNTRIES.find((c) => c.prefix === phonePrefix) || COUNTRIES[0];

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (countryRef.current && !countryRef.current.contains(event.target)) {
        setIsCountryOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const onSubmit = (data) => {
    // 1. Concatenate Phone: Prefix + Number
    const fullPhoneNumber = `${data.phonePrefix}${data.phoneNumber}`;

    // 2. Format Date: YYYY-MM-DD -> DD-MM-YYYY
    let formattedDob = data.dateOfBirth;
    if (data.dateOfBirth.includes("-")) {
      const [y, m, d] = data.dateOfBirth.split("-");
      formattedDob = `${d}-${m}-${y}`;
    }

    // 3. Destructure to REMOVE phonePrefix from the final object
    const { phonePrefix, phoneNumber, dateOfBirth, ...rest } = data;

    const formattedData = {
      ...rest,
      phoneNumber: fullPhoneNumber,
      dateOfBirth: formattedDob,
    };

    updateForm(formattedData);
    console.log("Updated Form Data:", { ...formData, ...formattedData });
    navigate("/register/location-details");
    if (onNext) onNext(data);
  };

  return (
    <div className="flex flex-col h-full w-full animate-in fade-in duration-500">
      <div className="mb-8 relative pl-5">
        <div className="absolute left-0 top-1.5 w-1.5 h-8 bg-accent rounded-full shadow-sm"></div>
        <h2 className="text-3xl font-serif text-charcoal mb-2 tracking-tight">
          Almost there
        </h2>
        <p className="text-muted text-sm leading-relaxed max-w-[280px]">
          We need a few more details to secure your profile.
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-6 flex-1"
      >
        {/* Phone Number */}
        <div className="flex flex-col gap-2 group">
          <label className="text-[11px] font-bold text-charcoal/70 uppercase tracking-widest">
            Phone Number
          </label>
          <div className="relative flex">
            {/* Custom Country Prefix Selector */}
            <div className="absolute inset-y-0 left-0 flex items-center z-20" ref={countryRef}>
              <button
                type="button"
                onClick={() => setIsCountryOpen(!isCountryOpen)}
                className="flex items-center gap-2 pl-3.5 pr-2 h-full hover:bg-charcoal/5 transition-colors rounded-l-xl border-r border-border/50 group-focus-within:border-accent/30"
              >
                <img
                  src={selectedCountry.flagUrl}
                  alt={selectedCountry.name}
                  className="w-5 h-3.5 object-cover rounded-sm shadow-sm"
                />
                <span className="text-sm font-semibold text-charcoal/80">
                  {phonePrefix}
                </span>
                <ChevronDown
                  size={12}
                  className={`text-text-subtle transition-transform duration-300 ${isCountryOpen ? "rotate-180" : ""}`}
                />
              </button>

              {isCountryOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 max-h-64 overflow-y-auto bg-surface border border-border shadow-2xl rounded-xl z-50 py-2 animate-in fade-in zoom-in-95 duration-200">
                  <div className="px-3 py-1.5 mb-1 text-[10px] font-bold text-muted uppercase tracking-widest">
                    Select Country
                  </div>
                  {COUNTRIES.map((country) => (
                    <button
                      key={country.code}
                      type="button"
                      onClick={() => {
                        setValue("phonePrefix", country.prefix);
                        setIsCountryOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-accent/5 transition-colors ${phonePrefix === country.prefix ? "bg-accent/10 text-accent font-medium" : "text-charcoal/70"}`}
                    >
                      <img
                        src={country.flagUrl}
                        alt={country.name}
                        className="w-6 h-4 object-cover rounded-sm"
                      />
                      <span className="flex-1 text-left">{country.name}</span>
                      <span className="text-muted text-xs">
                        {country.prefix}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <input
              {...register("phoneNumber")}
              type="tel"
              className={`input w-full pl-28 py-4 bg-surface hover:bg-surface-raised focus:bg-surface-raised border-transparent hover:border-border focus:border-accent shadow-sm transition-all duration-300 rounded-xl ${errors.phoneNumber ? "border-red-500 focus:border-red-500 bg-red-50/10" : ""}`}
              placeholder="1012345678"
            />

            {/* Small icon for tel type hint */}
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-text-subtle/20">
              <Phone size={14} />
            </div>
          </div>
          {errors.phoneNumber && (
            <span className="text-xs text-red-500 font-medium mt-1 inline-block">
              {errors.phoneNumber.message}
            </span>
          )}
        </div>

        {/* SSN */}
        <div className="flex flex-col gap-2 group">
          <div className="flex justify-between items-end">
            <label className="text-[11px] font-bold text-charcoal/70 uppercase tracking-widest">
              National ID (SSN)
            </label>
            <span className="text-[10px] font-medium text-accent bg-accent/10 px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm border border-accent/20">
              <ShieldCheck size={10} />
              Stored securely
            </span>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <ShieldCheck className="h-4 w-4 text-text-subtle group-focus-within:text-accent transition-colors duration-300" />
            </div>
            <input
              {...register("ssn")}
              type="text"
              className={`input pl-10 py-3.5 bg-surface hover:bg-surface-raised focus:bg-surface-raised border-transparent hover:border-border focus:border-accent shadow-sm transition-all duration-300 tracking-widest font-mono text-sm rounded-xl ${errors.ssn ? "border-red-500 focus:border-red-500 bg-red-50/10" : ""}`}
              placeholder="14-digit National ID"
            />
          </div>
          {errors.ssn && (
            <span className="text-xs text-red-500 font-medium animate-in fade-in">
              {errors.ssn.message}
            </span>
          )}
        </div>

        {/* Date of Birth */}
        <div className="flex flex-col gap-2 group">
          <label className="text-[11px] font-bold text-charcoal/70 uppercase tracking-widest">
            Date of Birth
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <CalendarDays className="h-4 w-4 text-text-subtle group-focus-within:text-accent transition-colors duration-300" />
            </div>
            <input
              {...register("dateOfBirth")}
              type="date"
              className={`input pl-10 py-3.5 bg-surface hover:bg-surface-raised focus:bg-surface-raised border-transparent hover:border-border focus:border-accent shadow-sm transition-all duration-300 rounded-xl [&::-webkit-calendar-picker-indicator]:opacity-50 [&::-webkit-calendar-picker-indicator]:hover:opacity-100 ${errors.dateOfBirth ? "border-red-500 focus:border-red-500 bg-red-50/10" : ""}`}
            />
          </div>
          {errors.dateOfBirth && (
            <span className="text-xs text-red-500 font-medium animate-in fade-in">
              {errors.dateOfBirth.message}
            </span>
          )}
        </div>

        {/* Gender Selection */}
        <div className="flex flex-col gap-3 mt-1">
          <label className="text-[11px] font-bold text-charcoal/70 uppercase tracking-widest">
            Gender
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label
              className={`relative flex items-center p-4 rounded-xl cursor-pointer transition-all duration-300 border shadow-sm group ${
                genderValue === "true"
                  ? "border-accent bg-accent/5 ring-1 ring-accent/20"
                  : "border-border/50 bg-surface hover:bg-surface-raised hover:border-accent/40"
              }`}
            >
              <input
                type="radio"
                value="true"
                {...register("gender")}
                className="sr-only"
              />
              <div
                className={`w-4.5 h-4.5 rounded-full border flex items-center justify-center mr-3 transition-colors ${
                  genderValue === "true"
                    ? "border-accent bg-accent shadow-inner"
                    : "border-border group-hover:border-accent/50 bg-page"
                }`}
              >
                {genderValue === "true" && (
                  <Check size={10} strokeWidth={3} className="text-white" />
                )}
              </div>
              <span
                className={`text-sm font-medium transition-colors ${genderValue === "true" ? "text-accent" : "text-charcoal"}`}
              >
                Male
              </span>
            </label>

            <label
              className={`relative flex items-center p-4 rounded-xl cursor-pointer transition-all duration-300 border shadow-sm group ${
                genderValue === "false"
                  ? "border-accent bg-accent/5 ring-1 ring-accent/20"
                  : "border-border/50 bg-surface hover:bg-surface-raised hover:border-accent/40"
              }`}
            >
              <input
                type="radio"
                value="false"
                {...register("gender")}
                className="sr-only"
              />
              <div
                className={`w-4.5 h-4.5 rounded-full border flex items-center justify-center mr-3 transition-colors ${
                  genderValue === "false"
                    ? "border-accent bg-accent shadow-inner"
                    : "border-border group-hover:border-accent/50 bg-page"
                }`}
              >
                {genderValue === "false" && (
                  <Check size={10} strokeWidth={3} className="text-white" />
                )}
              </div>
              <span
                className={`text-sm font-medium transition-colors ${genderValue === "false" ? "text-accent" : "text-charcoal"}`}
              >
                Female
              </span>
            </label>
          </div>
          {errors.gender && (
            <span className="text-xs text-red-500 font-medium animate-in fade-in">
              {errors.gender.message}
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
