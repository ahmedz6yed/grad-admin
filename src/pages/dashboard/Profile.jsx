import { useState, useRef, useEffect, useCallback } from "react";
import { useAuthStore } from "../../store/authStore";
import { useUserDetail, useUpdateProfile, useUpdateAvatar } from "../../hooks/useUsers";
import { useLogout } from "../../hooks/useAuthMutations";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import ModernDatePicker from "../../components/ui/ModernDatePicker";
import { 
  Camera, Lock, User, Mail, Shield, 
  Loader2, Phone, MapPin, Building, Calendar, Users,
  ArrowRight, Fingerprint, Globe, Hash, Link as LinkIcon,
  ChevronDown, ChevronUp, ChevronLeft, ChevronRight, LogOut
} from "lucide-react";

// --- Utility Functions ---
const formatDateToDDMMYYYY = (dateString) => {
  if (!dateString) return dateString;
  if (/^\d{2}-\d{2}-\d{4}$/.test(dateString)) return dateString;
  
  const dateObj = new Date(dateString);
  if (!isNaN(dateObj.getTime())) {
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    return `${day}-${month}-${year}`;
  }
  return dateString;
};

const validateAge = (dobString) => {
  if (!dobString) return "";
  
  let parsedDate;
  if (/^\d{2}-\d{2}-\d{4}$/.test(dobString)) {
    const [d, m, y] = dobString.split('-').map(Number);
    parsedDate = new Date(y, m - 1, d);
  } else {
    parsedDate = new Date(dobString);
  }

  if (isNaN(parsedDate.getTime())) return "Invalid date format (use DD-MM-YYYY)";

  const today = new Date();
  let age = today.getFullYear() - parsedDate.getFullYear();
  const m = today.getMonth() - parsedDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < parsedDate.getDate())) age--;

  if (age < 18) return "You must be at least 18 years old";
  if (age > 120) return "Please enter a valid age (max 120)";
  
  return "";
};

// --- Reusable Components ---
const FormInput = ({ label, icon: Icon, error, colSpan, ...props }) => (
  <div className={`space-y-2.5 ${colSpan ? 'md:col-span-2' : ''}`}>
    <label className="text-[0.75rem] font-black uppercase tracking-wider text-charcoal/60 ml-1">
      {label}
    </label>
    <div className="relative group/input">
      <Icon className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${
        error ? 'text-red-500' : 'text-charcoal/30 group-focus-within/input:text-sage-dark'
      }`} />
      <input 
        className={`w-full pl-12 pr-6 py-4 bg-white/60 border rounded-2xl outline-none transition-all duration-300 font-bold shadow-sm ${
          error 
            ? 'border-red-300 focus:ring-red-100 focus:border-red-400 text-red-700' 
            : 'border-white/80 focus:ring-4 focus:ring-sage/10 focus:border-sage/50 text-charcoal'
        }`} 
        {...props} 
      />
    </div>
    {error && <p className="text-xs font-bold text-red-500 pl-4 mt-1">{error}</p>}
  </div>
);

const ProfileSkeleton = () => (
  <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 animate-pulse">
    <div className="mb-12 md:mb-20 space-y-4">
      <div className="h-6 w-32 bg-charcoal/10 rounded-full"></div>
      <div className="h-12 w-64 bg-charcoal/10 rounded-xl"></div>
      <div className="h-6 w-96 bg-charcoal/10 rounded-md"></div>
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
      <div className="lg:col-span-4 space-y-8">
        <div className="h-80 w-full bg-charcoal/10 rounded-[2.5rem]"></div>
        <div className="h-48 w-full bg-charcoal/10 rounded-[2rem]"></div>
      </div>
      <div className="lg:col-span-8">
        <div className="h-[600px] w-full bg-charcoal/10 rounded-[3rem]"></div>
      </div>
    </div>
  </div>
);

// --- Constants ---
const GENDER_OPTIONS = [
  { value: true, label: "Male" },
  { value: false, label: "Female" }
];

// --- Main Page Component ---
export default function Profile() {
  const { user: authUser, updateUser } = useAuthStore();
  const fileInputRef = useRef(null);
  
  const { data: activeUser, isLoading: isFetchingUser } = useUserDetail(authUser?._id || authUser?.id);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "", lastName: "", userName: "", phoneNumber: "",
    gender: true, dateOfBirth: "", government: "", city: "", street: "", avatarUrl: ""
  });

  const [errors, setErrors] = useState({ userName: "", dob: "" });
  const [showAvatarInput, setShowAvatarInput] = useState(false);

  useEffect(() => {
    if (activeUser) {
      setFormData({
        firstName: activeUser.name?.first || "",
        lastName: activeUser.name?.last || "",
        userName: activeUser.userName || "",
        phoneNumber: activeUser.phoneNumber || "",
        gender: activeUser.gender === 1 || activeUser.gender === true,
        dateOfBirth: activeUser.dateOfBirth || "",
        government: activeUser.address?.government || "",
        city: activeUser.address?.city || "",
        street: activeUser.address?.street || "",
        avatarUrl: activeUser.avatar || ""
      });
    }
  }, [activeUser]);

  // Use abstracted hooks
  const { mutate: updateProfile, isPending: isUpdating } = useUpdateProfile(setErrors);
  const { mutate: uploadAvatar, isPending: isUploading } = useUpdateAvatar();
  const logout = useLogout();

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === "userName") setErrors(prev => ({ ...prev, userName: "" }));
    if (name === "dateOfBirth") setErrors(prev => ({ ...prev, dob: validateAge(value) }));
  }, []);

  const handleFileChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, avatarUrl: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    
    const dobError = validateAge(formData.dateOfBirth);
    if (dobError) {
      setErrors(prev => ({ ...prev, dob: dobError }));
      toast.error("Validation Error", { description: dobError });
      return;
    }

    if (!formData.userName.trim()) {
      setErrors(prev => ({ ...prev, userName: "Username cannot be empty" }));
      return;
    }

    const payload = { 
      id: activeUser._id || activeUser.id,
      name: { first: formData.firstName, last: formData.lastName },
      userName: formData.userName,
      phoneNumber: formData.phoneNumber,
      gender: formData.gender ? 1 : 0,
      dateOfBirth: formatDateToDDMMYYYY(formData.dateOfBirth),
      avatar: formData.avatarUrl,
      address: {
        government: formData.government,
        city: formData.city,
        street: formData.street
      }
    };

    updateProfile(payload, {
      onSuccess: (data) => {
        updateUser(data?.data || data?.user || data);
      }
    });
  }, [formData, activeUser, updateProfile, updateUser]);

  if (isFetchingUser) {
    return <ProfileSkeleton />;
  }

  const userInitial = activeUser?.userName ? activeUser.userName.charAt(0).toUpperCase() : "A";

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 selection:bg-sage/20 selection:text-charcoal transition-all">
      
      {/* Header */}
      <div className="mb-12 md:mb-20 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sage/10 border border-sage/20">
            <Fingerprint className="w-3.5 h-3.5 text-sage-dark" />
            <span className="text-[0.65rem] font-black uppercase tracking-[0.15em] text-sage-dark">User Identity</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-charcoal leading-[1.1]">
            {activeUser?.name?.first || "Admin"} <span className="text-sage">{activeUser?.name?.last || "Profile"}</span>
          </h1>
          <p className="text-text-muted text-lg md:text-xl max-w-xl font-medium leading-relaxed">
            Configure your professional credentials and system identity.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <button 
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className={`h-14 px-8 rounded-2xl flex items-center gap-3 font-black uppercase tracking-widest text-[0.7rem] transition-all duration-500 border-2 ${
              isEditing 
                ? 'bg-charcoal text-white border-charcoal shadow-2xl' 
                : 'bg-white/40 text-sage-dark border-white/80 backdrop-blur-xl hover:bg-white/60 hover:scale-[1.02]'
            }`}
          >
            {isEditing ? (
              <>
                <User className="w-4 h-4" />
                <span>View Dossier</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Unlock Editor</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-8 lg:sticky lg:top-32">
          
          {/* Avatar Manager */}
          <div className="group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-br from-sage to-sage-dark rounded-[2.5rem] blur opacity-20 group-hover:opacity-40 transition duration-1000" />
            <div className="relative bg-white/40 border border-white/60 backdrop-blur-3xl rounded-[2.5rem] p-8 flex flex-col items-center shadow-2xl shadow-charcoal/5 transition-transform">
              
              <div className="relative mb-6 group/avatar cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <div className="relative w-40 h-40 rounded-full overflow-hidden shadow-2xl border-4 border-white/40 group-hover/avatar:-translate-y-1 transition-transform duration-300">
                  {formData.avatarUrl ? (
                    <img src={formData.avatarUrl} alt="Avatar" className="w-full h-full object-cover transition-transform duration-700 group-hover/avatar:scale-110" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-sage to-sage-dark text-6xl font-black text-cream">
                      {userInitial}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-charcoal/30 backdrop-blur-sm opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    {isUploading ? <Loader2 className="w-10 h-10 text-white animate-spin" /> : <Camera className="w-10 h-10 text-white" />}
                  </div>
                </div>
              </div>

              <div className="w-full space-y-3">
                <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-sage/20 border border-sage/50 hover:bg-sage/30 transition-all duration-300 text-[0.7rem] font-black uppercase tracking-wider text-sage-dark group/btn">
                  <span className="flex items-center gap-2"><Camera className="w-3.5 h-3.5" /> Upload Local Image</span>
                </button>
                <button type="button" onClick={() => setShowAvatarInput(!showAvatarInput)} className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-white/60 border border-white/80 hover:bg-white transition-all duration-300 text-[0.7rem] font-black uppercase tracking-wider text-charcoal/60 group/btn">
                  <span className="flex items-center gap-2"><LinkIcon className="w-3.5 h-3.5" /> Avatar URL</span>
                  {showAvatarInput ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {showAvatarInput && (
                  <div className="overflow-hidden transition-all duration-300 animate-in slide-in-from-top-2">
                    <input 
                      type="text" name="avatarUrl" value={formData.avatarUrl} onChange={handleChange} 
                      placeholder="https://example.com/image.jpg" 
                      className="w-full px-4 py-3 bg-white/60 border border-white/80 rounded-xl outline-none focus:ring-4 focus:ring-sage/10 focus:border-sage/50 text-[0.8rem] font-bold text-charcoal placeholder:text-charcoal/30 transition-all" 
                    />
                  </div>
                )}
              </div>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
            </div>
          </div>

          {/* System Records */}
          <div className="bg-white/30 border border-white/60 backdrop-blur-2xl rounded-[2rem] p-8 space-y-6 shadow-xl shadow-charcoal/5">
            <div className="flex items-center gap-2 border-b border-white/50 pb-4">
              <Lock className="w-4 h-4 text-charcoal/40" />
              <h3 className="text-sm font-black uppercase tracking-widest text-charcoal/60">Protected Details</h3>
            </div>
            <div className="space-y-6">
              {[
                { icon: Mail, label: "System Email", value: activeUser?.email },
                { icon: Shield, label: "Identity Hash (SSN)", value: activeUser?.ssn ? `•••• •••• •••• ${activeUser.ssn.slice(-4)}` : "Unlinked" }
              ].map((record, i) => (
                <div key={i} className="group/item">
                  <label className="text-[0.65rem] font-black uppercase tracking-wider text-charcoal/40 mb-1 block transition-colors group-hover/item:text-sage-dark">{record.label}</label>
                  <div className="flex items-center gap-3 text-[0.9rem] font-bold text-charcoal/80">
                    <record.icon className="w-4 h-4 text-charcoal/20 group-hover/item:text-sage-dark/40 transition-colors" />
                    <span className="truncate">{record.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button 
            type="button"
            onClick={() => logout.mutate()}
            disabled={logout.isPending}
            className="w-full group/logout relative overflow-hidden h-14 bg-white/40 border border-white/60 hover:border-red-200/50 hover:bg-red-50/30 rounded-2xl transition-all duration-500 flex items-center justify-center gap-3 shadow-sm active:scale-95 cursor-pointer"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/5 to-red-500/0 translate-x-[-100%] group-hover/logout:translate-x-[100%] transition-transform duration-1000" />
            {logout.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin text-red-500" />
            ) : (
              <LogOut className="w-4 h-4 text-red-400 group-hover/logout:text-red-500 transition-colors" />
            )}
            <span className="text-[0.7rem] font-black uppercase tracking-[0.2em] text-charcoal/40 group-hover/logout:text-red-600 transition-colors">LOG OUT</span>
          </button>
        </div>

        {/* Main Editor Form */}
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            {!isEditing ? (
              <motion.div 
                key="view"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="relative bg-white/40 border border-white/70 backdrop-blur-3xl rounded-[3rem] p-8 md:p-14 shadow-2xl shadow-charcoal/5 space-y-16"
              >
                {/* Personal Section View */}
                <section className="space-y-10">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-1.5 bg-sage rounded-full" />
                    <h3 className="text-2xl font-black text-charcoal tracking-tight">Identity Records</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-10 gap-x-12">
                    {[
                      { label: "Administrative Handle", value: `@${formData.userName}`, icon: Hash },
                      { label: "Full Identity", value: `${formData.firstName} ${formData.lastName}`, icon: User },
                      { label: "Communication Link", value: formData.phoneNumber || "No link provided", icon: Phone },
                      { label: "Temporal Origin (DOB)", value: formData.dateOfBirth || "Unknown", icon: Calendar },
                      { label: "Gender Orientation", value: formData.gender ? "Male" : "Female", icon: Users },
                    ].map((item, i) => (
                      <div key={i} className="space-y-2 group/field">
                        <div className="flex items-center gap-2 text-charcoal/30 group-hover/field:text-sage transition-colors duration-300">
                          <item.icon className="w-3.5 h-3.5" />
                          <label className="text-[0.65rem] font-black uppercase tracking-widest">{item.label}</label>
                        </div>
                        <p className="text-lg font-bold text-charcoal/80 pl-5.5">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </section>

                <hr className="border-white/50" />

                {/* Location Section View */}
                <section className="space-y-10">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-1.5 bg-sage-dark rounded-full" />
                    <h3 className="text-2xl font-black text-charcoal tracking-tight">Geographic Data</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-10 gap-x-12">
                    {[
                      { label: "Administrative Region", value: formData.government || "Central Command", icon: Globe },
                      { label: "Metropolis", value: formData.city || "System Node", icon: Building },
                      { label: "Tactical Address", value: formData.street || "Main Sector", icon: MapPin },
                    ].map((item, i) => (
                      <div key={i} className={`space-y-2 group/field ${i === 2 ? 'md:col-span-2' : ''}`}>
                        <div className="flex items-center gap-2 text-charcoal/30 group-hover/field:text-sage-dark transition-colors duration-300">
                          <item.icon className="w-3.5 h-3.5" />
                          <label className="text-[0.65rem] font-black uppercase tracking-widest">{item.label}</label>
                        </div>
                        <p className="text-lg font-bold text-charcoal/80 pl-5.5">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </section>
              </motion.div>
            ) : (
              <motion.div
                key="edit"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="relative bg-white/40 border border-white/70 backdrop-blur-3xl rounded-[3rem] p-8 md:p-14 shadow-2xl shadow-charcoal/5"
              >
                <form onSubmit={(e) => {
                  handleSubmit(e);
                  setIsEditing(false);
                }} className="space-y-12 relative z-10">
                  
                  {/* Personal Block */}
                  <section className="space-y-8">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-1.5 bg-sage rounded-full" />
                      <h3 className="text-2xl font-black text-charcoal tracking-tight">Update Records</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <FormInput label="Username Handle" name="userName" value={formData.userName} onChange={handleChange} icon={Hash} error={errors.userName} placeholder="Enter username" colSpan />
                      <FormInput label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} icon={User} />
                      <FormInput label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} icon={User} />
                      <FormInput label="Phone Number" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} icon={Phone} />
                      <ModernDatePicker label="Birth Date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} placeholder="01-01-1990" icon={Calendar} error={errors.dob} />

                      {/* Gender Selector Block */}
                      <div className="md:col-span-2 space-y-3">
                        <label className="text-[0.7rem] font-black uppercase tracking-wider text-charcoal/60 ml-1">Gender Specification</label>
                        <div className="relative p-1.5 bg-white/40 backdrop-blur-xl border border-white/80 rounded-[1.25rem] grid grid-cols-2 gap-1.5 h-16 shadow-inner shadow-charcoal/5">
                          {GENDER_OPTIONS.map(({ value, label }) => {
                            const isActive = formData.gender === value;
                            return (
                              <button 
                                key={label}
                                type="button" 
                                onClick={() => setFormData(prev => ({ ...prev, gender: value }))}
                                className="relative flex items-center justify-center rounded-xl transition-colors duration-500 overflow-hidden group/btn"
                              >
                                <span className={`relative z-10 text-[0.7rem] font-black uppercase tracking-[0.2em] transition-colors duration-500 ${isActive ? 'text-white' : 'text-charcoal/40 group-hover/btn:text-charcoal/60'}`}>
                                  {label}
                                </span>
                                {isActive && (
                                  <motion.div 
                                    layoutId="activeGenderSlide"
                                    className="absolute inset-0 bg-sage rounded-xl shadow-lg shadow-sage/20 z-0"
                                    transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                                  />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Geographic Block */}
                  <section className="space-y-8 pt-6">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-1.5 bg-sage-dark rounded-full" />
                      <h3 className="text-2xl font-black text-charcoal tracking-tight">Location Data</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <FormInput label="Province" name="government" value={formData.government} onChange={handleChange} icon={Globe} />
                      <FormInput label="City" name="city" value={formData.city} onChange={handleChange} icon={Building} />
                      <FormInput label="Street Address" name="street" value={formData.street} onChange={handleChange} icon={MapPin} colSpan />
                    </div>
                  </section>

                  {/* Actions */}
                  <div className="pt-10 border-t border-white/50 flex justify-end gap-4">
                    <button 
                      type="button" 
                      onClick={() => setIsEditing(false)}
                      className="h-16 px-8 rounded-[1.25rem] text-charcoal/40 font-black uppercase tracking-widest text-[0.7rem] hover:text-charcoal transition-all"
                    >
                      Discard Changes
                    </button>
                    <button 
                      type="submit" disabled={isUpdating} 
                      className="w-full sm:w-auto h-16 px-12 bg-charcoal rounded-[1.25rem] text-white font-black uppercase tracking-widest text-sm shadow-2xl hover:shadow-charcoal/40 hover:-translate-y-1 active:scale-[0.98] transition-all flex items-center justify-center gap-4 group disabled:opacity-50 disabled:hover:translate-y-0"
                    >
                      {isUpdating ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                        <>
                          <span>Commit Changes</span>
                          <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-500" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
