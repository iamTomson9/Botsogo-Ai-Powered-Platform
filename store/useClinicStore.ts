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
  distance?: number; // Distance in kilometers
}

interface UserLocation {
  latitude: number;
  longitude: number;
}

interface ClinicStoreState {
  clinics: ClinicLocation[];
  filteredClinics: ClinicLocation[];
  searchQuery: string;
  userLocation: UserLocation | null;
  isLoading: boolean;
  setClinics: (clinics: ClinicLocation[]) => void;
  setSearchQuery: (query: string) => void;
  setUserLocation: (location: UserLocation) => void;
}

// Haversine formula to calculate distance in KM
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const useClinicStore = create<ClinicStoreState>((set) => ({
  clinics: [],
  filteredClinics: [],
  searchQuery: '',
  userLocation: null,
  isLoading: false,
  setClinics: (clinics) => set((state) => {
    let processedClinics = clinics;
    if (state.userLocation) {
        processedClinics = clinics.map(clinic => ({
            ...clinic,
            distance: clinic.position ? calculateDistance(state.userLocation!.latitude, state.userLocation!.longitude, clinic.position.latitude, clinic.position.longitude) : Infinity
        })).sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
    }
    return { clinics: processedClinics, filteredClinics: processedClinics };
  }),
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
  setUserLocation: (location) => set((state) => {
      const clinicsWithDistance = state.clinics.map(clinic => ({
          ...clinic,
          distance: clinic.position ? calculateDistance(location.latitude, location.longitude, clinic.position.latitude, clinic.position.longitude) : Infinity
      })).sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
      
      const lowerQuery = state.searchQuery.toLowerCase();
      const filtered = clinicsWithDistance.filter(
        (clinic) =>
          clinic.name?.toLowerCase().includes(lowerQuery) ||
          clinic.address?.city?.toLowerCase().includes(lowerQuery) ||
          clinic.address?.district?.toLowerCase().includes(lowerQuery)
      );

      return { userLocation: location, clinics: clinicsWithDistance, filteredClinics: filtered };
  }),
}));
