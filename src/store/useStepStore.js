import { create } from "zustand";

const STORAGE_KEY = "registration_formData";

const getInitialFormData = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    const data = saved ? JSON.parse(saved) : {};
    // Always ensure role: "user" is present
    return { role: "user", ...data };
  } catch (e) {
    console.error("Error parsing stored form data", e);
    return { role: "user" };
  }
};

export const useStepStore = create((set) => ({
  step: 1,
  formData: getInitialFormData(),

  setStep: (step) =>
    set(() => ({
      step: Math.min(Math.max(step, 1), 5),
    })),

  // Flattened update: merges all properties into the root formData object and persists to localStorage
  updateForm: (data) =>
    set((state) => {
      const newFormData = {
        ...state.formData,
        ...data,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newFormData));
      return { formData: newFormData };
    }),

  // Reset to original clean state but keep the default role
  reset: () => {
    const defaultData = { role: "user" };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData));
    set({
      step: 1,
      formData: defaultData,
    });
  },
}));
