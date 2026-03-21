import { create } from 'zustand';

export interface LocationIdentifier {
  use: string;
  system: string;
  value: string;
}

export interface Telecom {
  system: string;
  value: string;
  rank: number;
}

export interface ClinicLocation {
  resourceType: string;
  identifier: LocationIdentifier[];
  description?: string;
  address: {
    city?: string;
    district?: string;
    country: string;
  };
  contact?: {
    name: { use: string };
    telecom: Telecom[];
    address: {
      city?: string;
      district?: string;
      country: string;
    };
  };
  managingOrganization: {
    display: string;
  };
  name: string;
  operationalStatus: {
    display: string;
    userSelected: boolean;
  };
  position?: {
    latitude: number;
    longitude: number;
  };
}

interface ClinicStoreState {
  clinics: ClinicLocation[];
  filteredClinics: ClinicLocation[];
  searchQuery: string;
  isLoading: boolean;
  setClinics: (clinics: ClinicLocation[]) => void;
  setSearchQuery: (query: string) => void;
}

export const useClinicStore = create<ClinicStoreState>((set) => ({
  clinics: [],
  filteredClinics: [],
  searchQuery: '',
  isLoading: false,
  setClinics: (clinics) => set({ clinics, filteredClinics: clinics }),
  setSearchQuery: (query) =>
    set((state) => {
      const lowerQuery = query.toLowerCase();
      const filtered = state.clinics.filter(
        (clinic) =>
          clinic.name?.toLowerCase().includes(lowerQuery) ||
          clinic.address?.city?.toLowerCase().includes(lowerQuery) ||
          clinic.address?.district?.toLowerCase().includes(lowerQuery)
      );
      return { searchQuery: query, filteredClinics: filtered };
    }),
}));
