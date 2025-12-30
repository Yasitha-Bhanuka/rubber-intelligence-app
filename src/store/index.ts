import { create } from 'zustand';
import { createAuthSlice, AuthSlice } from './authSlice';

// Placeholder for other slices
interface GradingSlice {
    // grading state
}

interface DiseaseSlice {
    // disease state
}

// Combine all slices
interface AppState extends AuthSlice {
    // Add other slices here
}

export const useStore = create<AppState>()((...a) => ({
    ...createAuthSlice(...a),
}));
