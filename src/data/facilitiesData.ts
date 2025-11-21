import type { Facility } from "@/pages/NearbyServices";

export const facilities: Facility[] = [
  {
    id: "1",
    name: "City General Hospital",
    type: "hospital",
    distance: 1.2,
    specialties: ["Cardiology", "Neurology", "Emergency Care", "Orthopedics"],
    resources: {
      oxygenCylinders: {
        available: 15,
        total: 20,
      },
      bloodBank: ["A+", "A-", "B+", "O+", "O-", "AB+"],
      icuBeds: {
        available: 3,
        total: 12,
      },
      pharmacyOpen: true,
    },
    contact: {
      phone: "+1 (555) 123-4567",
      address: "123 Medical Center Drive, Suite 100",
    },
    coordinates: {
      lat: 40.7128,
      lng: -74.0060,
    },
  },
  {
    id: "2",
    name: "St. Mary's Medical Center",
    type: "hospital",
    distance: 2.5,
    specialties: ["Pediatrics", "Maternity", "Surgery", "Oncology"],
    resources: {
      oxygenCylinders: {
        available: 8,
        total: 15,
      },
      bloodBank: ["A+", "B+", "O+", "AB-"],
      icuBeds: {
        available: 0,
        total: 8,
      },
      pharmacyOpen: true,
    },
    contact: {
      phone: "+1 (555) 234-5678",
      address: "456 Healthcare Boulevard",
    },
    coordinates: {
      lat: 40.7580,
      lng: -73.9855,
    },
  },
  {
    id: "3",
    name: "Wellness Clinic",
    type: "clinic",
    distance: 0.8,
    specialties: ["General Practice", "Dermatology", "Vaccination"],
    resources: {
      oxygenCylinders: {
        available: 3,
        total: 5,
      },
      bloodBank: [],
      icuBeds: {
        available: 0,
        total: 0,
      },
      pharmacyOpen: false,
    },
    contact: {
      phone: "+1 (555) 345-6789",
      address: "789 Wellness Street",
    },
    coordinates: {
      lat: 40.7489,
      lng: -73.9680,
    },
  },
  {
    id: "4",
    name: "Memorial Hospital",
    type: "hospital",
    distance: 3.8,
    specialties: ["Cardiology", "Pulmonology", "ICU Care", "Radiology"],
    resources: {
      oxygenCylinders: {
        available: 22,
        total: 25,
      },
      bloodBank: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"],
      icuBeds: {
        available: 5,
        total: 15,
      },
      pharmacyOpen: true,
    },
    contact: {
      phone: "+1 (555) 456-7890",
      address: "321 Memorial Drive",
    },
    coordinates: {
      lat: 40.7306,
      lng: -73.9352,
    },
  },
  {
    id: "5",
    name: "Rapid Care Clinic",
    type: "clinic",
    distance: 1.5,
    specialties: ["Urgent Care", "X-Ray", "Lab Services"],
    resources: {
      oxygenCylinders: {
        available: 5,
        total: 8,
      },
      bloodBank: [],
      icuBeds: {
        available: 0,
        total: 0,
      },
      pharmacyOpen: true,
    },
    contact: {
      phone: "+1 (555) 567-8901",
      address: "555 Quick Street",
    },
    coordinates: {
      lat: 40.7614,
      lng: -73.9776,
    },
  },
  {
    id: "6",
    name: "University Medical Center",
    type: "hospital",
    distance: 4.2,
    specialties: ["Neurosurgery", "Trauma Care", "Burn Unit", "Transplant"],
    resources: {
      oxygenCylinders: {
        available: 0,
        total: 18,
      },
      bloodBank: ["O+", "O-", "A+"],
      icuBeds: {
        available: 1,
        total: 20,
      },
      pharmacyOpen: true,
    },
    contact: {
      phone: "+1 (555) 678-9012",
      address: "100 University Avenue",
    },
    coordinates: {
      lat: 40.7282,
      lng: -74.0776,
    },
  },
];
