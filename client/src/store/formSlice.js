// store.js
import { create } from 'zustand';

/**
 * Form Slice: Manages all form-related state across the application
 * 
 * @param {Function} set - Zustand's set function for updating state
 * @param {Function} get - Zustand's get function for accessing current state
 * @returns {Object} The form slice state and actions
 */
const createFormSlice = (set, get) => ({
  // State object containing all forms in the application
  forms: {
    // Auth forms
    auth: {
      // Which auth form is currently active
      activeForm: 'login', // 'login', 'register', 'verify', 'onboarding'
      
      // Login form fields
      login: {
        email: '',
        password: '',
        rememberMe: false,
      },
      
      // Registration form fields
      register: {
        email: '',
        password: '',
        confirmPassword: '',
        name: '',
        acceptTerms: false,
      },
      
      // Verification form fields
      verify: {
        code: '',
      },
      
      // Onboarding form fields
      onboarding: {
        profilePicture: null,
        bio: '',
        interests: [],
      },
    },
    
    // Another form section example (like user settings)
    settings: {
      profile: {
        name: '',
        email: '',
        bio: '',
      },
      notifications: {
        emailNotifications: true,
        pushNotifications: false,
      },
    },
  },
  
  // Form validation errors
  errors: {
    auth: {
      login: {},
      register: {},
      verify: {},
      onboarding: {},
    },
    settings: {
      profile: {},
      notifications: {},
    },
  },
  
  /**
   * Set the active authentication form
   * @param {string} formType - The form type to set active
   */
  setActiveAuthForm: (formType) => 
    set((state) => ({
      forms: {
        ...state.forms,
        auth: {
          ...state.forms.auth,
          activeForm: formType,
        },
      },
    })),
  
  /**
   * Update a specific field in a specific form
   * @param {string} formSection - Top-level form section (e.g., 'auth', 'settings')
   * @param {string} formName - Specific form name (e.g., 'login', 'profile')
   * @param {string} field - Field name to update
   * @param {any} value - New value for the field
   */
  updateFormField: (formSection, formName, field, value) =>
    set((state) => ({
      forms: {
        ...state.forms,
        [formSection]: {
          ...state.forms[formSection],
          [formName]: {
            ...state.forms[formSection][formName],
            [field]: value,
          },
        },
      },
    })),
  
  /**
   * Reset a specific form to its initial state
   * @param {string} formSection - Top-level form section (e.g., 'auth', 'settings')
   * @param {string} formName - Specific form name (e.g., 'login', 'profile')
   */
  resetForm: (formSection, formName) => {
    // Get the initial state of the form
    const initialState = get().forms[formSection][formName];
    const resetState = {};
    
    // Create a reset state with empty values of the same type
    Object.keys(initialState).forEach(key => {
      const value = initialState[key];
      if (Array.isArray(value)) {
        resetState[key] = [];
      } else if (typeof value === 'boolean') {
        resetState[key] = false;
      } else if (typeof value === 'number') {
        resetState[key] = 0;
      } else {
        resetState[key] = '';
      }
    });
    
    // Update the state with the reset values
    set((state) => ({
      forms: {
        ...state.forms,
        [formSection]: {
          ...state.forms[formSection],
          [formName]: resetState,
        },
      },
    }));
  },
  
  /**
   * Sets validation errors for a specific form
   * @param {string} formSection - Top-level form section (e.g., 'auth', 'settings')
   * @param {string} formName - Specific form name (e.g., 'login', 'profile')
   * @param {Object} errors - Object containing field errors
   */
  setFormErrors: (formSection, formName, errors) =>
    set((state) => ({
      errors: {
        ...state.errors,
        [formSection]: {
          ...state.errors[formSection],
          [formName]: errors,
        },
      },
    })),
});

export default createFormSlice