import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import MapPlaceholder from "@/components/nearby/MapPlaceholder";
import FacilityCard from "@/components/nearby/FacilityCard";
import { facilities } from "@/data/facilitiesData";
import { supabase } from "@/integrations/supabase/client";

export type FacilityType = "hospital" | "clinic" | "pharmacy";

export interface Facility {
  id: string;
  name: string;
  type: FacilityType;
  distance: number;
  specialties: string[];
  resources: {
    oxygenCylinders: {
      available: number;
      total: number;
    };
    bloodBank: string[];
    icuBeds: {
      available: number;
      total: number;
    };
    pharmacyOpen: boolean;
  };
  contact: {
    phone: string;
    address: string;
  };
  coordinates: {
    lat: number;
    lng: number;
  };
}

const NearbyServices = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [allFacilities, setAllFacilities] = useState<Facility[]>(facilities);
  const [filteredFacilities, setFilteredFacilities] = useState<Facility[]>(facilities);

  useEffect(() => {
    fetchRegisteredHospitals();
  }, []);

  const fetchRegisteredHospitals = async () => {
    const { data, error } = await supabase
      .from('hospital_profiles')
      .select('*');

    if (error) {
      console.error('Error fetching hospitals:', error);
      return;
    }

    if (data) {
      const registeredFacilities: Facility[] = data.map((hospital) => ({
        id: hospital.id,
        name: hospital.name,
        type: "hospital" as FacilityType,
        distance: 0.5, // Default distance, can be calculated based on coordinates
        specialties: hospital.specialties || [],
        resources: {
          oxygenCylinders: {
            available: hospital.oxygen_cylinders_available || 0,
            total: hospital.oxygen_cylinders_total || 0,
          },
          bloodBank: hospital.blood_bank_types || [],
          icuBeds: {
            available: hospital.icu_beds_available || 0,
            total: hospital.icu_beds_total || 0,
          },
          pharmacyOpen: hospital.pharmacy_open || false,
        },
        contact: {
          phone: hospital.phone,
          address: hospital.address,
        },
        coordinates: {
          lat: Number(hospital.latitude) || 28.6139,
          lng: Number(hospital.longitude) || 77.2090,
        },
      }));

      // Merge registered hospitals with static facilities
      const combined = [...registeredFacilities, ...facilities];
      setAllFacilities(combined);
      setFilteredFacilities(combined);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setFilteredFacilities(allFacilities);
      return;
    }

    const lowerQuery = query.toLowerCase();
    const filtered = allFacilities.filter((facility) => {
      // Search in name
      if (facility.name.toLowerCase().includes(lowerQuery)) return true;
      
      // Search in specialties
      if (facility.specialties.some(s => s.toLowerCase().includes(lowerQuery))) return true;
      
      // Search for oxygen
      if (lowerQuery.includes("oxygen") && facility.resources.oxygenCylinders.available > 0) return true;
      
      // Search for blood types
      if (facility.resources.bloodBank.some(type => type.toLowerCase().includes(lowerQuery))) return true;
      
      // Search for ICU
      if (lowerQuery.includes("icu") && facility.resources.icuBeds.available > 0) return true;
      
      // Search for pharmacy
      if (lowerQuery.includes("pharmacy") && facility.resources.pharmacyOpen) return true;
      
      return false;
    });

    setFilteredFacilities(filtered);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Nearby Services</h1>
        <p className="text-muted-foreground">
          Find hospitals, clinics, and medical facilities near you
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
        <Input
          placeholder='Search by name, specialty, "Oxygen", "ICU", blood type (e.g., "A+", "O-")...'
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10 h-12 text-base"
        />
      </div>

      {/* Map Placeholder */}
      <MapPlaceholder />

      {/* Facilities List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-foreground">
            Medical Facilities ({filteredFacilities.length})
          </h2>
          {searchQuery && (
            <button
              onClick={() => handleSearch("")}
              className="text-sm text-primary hover:underline"
            >
              Clear search
            </button>
          )}
        </div>

        {filteredFacilities.length === 0 ? (
          <div className="text-center py-12 bg-muted/30 rounded-lg">
            <p className="text-muted-foreground">No facilities found matching your search</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredFacilities.map((facility, index) => (
              <FacilityCard
                key={facility.id}
                facility={facility}
                index={index}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NearbyServices;
