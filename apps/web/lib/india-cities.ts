/* ──────────────────────────────────────────────────────────
   India Tier 1 Cities & Parking Locations
   ────────────────────────────────────────────────────────── */

export interface CityOption {
  id: string;
  name: string;
  state: string;
  lat: number;
  lng: number;
}

export interface IndiaParkingLocation {
  id: string;
  cityId: string;
  cityName: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  distance: string;
  pricePerHour: number; // always in INR
  currency: string;
  availableSpots: number;
  totalSpots: number;
  vehicleTypes: ("FOUR_WHEELER" | "TWO_WHEELER")[];
  rating: number;
  // New smart parking attributes
  isEV: boolean;
  isAccessible: boolean;
  isCovered: boolean;
  hasCCTV: boolean;
  cctvScore: number; // 0-100 safety score
  densityZone: "high" | "medium" | "low"; // occupancy density
}

export const INDIAN_TIER_1_CITIES: CityOption[] = [
  { id: "bengaluru", name: "Bengaluru", state: "Karnataka", lat: 12.9716, lng: 77.5946 },
  { id: "delhi-ncr", name: "Delhi NCR", state: "Delhi/Haryana/UP", lat: 28.6139, lng: 77.209 },
  { id: "mumbai", name: "Mumbai", state: "Maharashtra", lat: 18.922, lng: 72.8347 },
  { id: "hyderabad", name: "Hyderabad", state: "Telangana", lat: 17.4486, lng: 78.3741 },
  { id: "pune", name: "Pune", state: "Maharashtra", lat: 18.5204, lng: 73.8567 },
  { id: "chennai", name: "Chennai", state: "Tamil Nadu", lat: 13.0827, lng: 80.2707 },
  { id: "kolkata", name: "Kolkata", state: "West Bengal", lat: 22.5726, lng: 88.3639 },
  { id: "ahmedabad", name: "Ahmedabad", state: "Gujarat", lat: 23.0225, lng: 72.5714 },
  { id: "surat", name: "Surat", state: "Gujarat", lat: 21.1702, lng: 72.8311 },
  { id: "jaipur", name: "Jaipur", state: "Rajasthan", lat: 26.9124, lng: 75.7873 },
  { id: "chandigarh", name: "Chandigarh", state: "Punjab/Haryana", lat: 30.7333, lng: 76.7794 },
  { id: "vishakapatnam", name: "Vishakapatnam", state: "Andhra Pradesh", lat: 17.6868, lng: 83.2185 },
];

export const INDIA_PARKING_LOCATIONS: IndiaParkingLocation[] = [
  // Bengaluru
  {
    id: "1",
    cityId: "bengaluru",
    cityName: "Bengaluru",
    name: "MG Road Metro Multi-Level",
    address: "Church Street, Off MG Road",
    lat: 12.9756,
    lng: 77.6066,
    distance: "0.4 km",
    pricePerHour: 40,
    currency: "₹",
    availableSpots: 28,
    totalSpots: 60,
    vehicleTypes: ["FOUR_WHEELER", "TWO_WHEELER"],
    rating: 4.8,
    isEV: true, isCovered: true, isAccessible: true, hasCCTV: true, cctvScore: 98, densityZone: "high",
  },
  {
    id: "2",
    cityId: "bengaluru",
    cityName: "Bengaluru",
    name: "Indiranagar 100ft Road Smart Lot",
    address: "12th Main, 100ft Road, Indiranagar",
    lat: 12.9783,
    lng: 77.6408,
    distance: "1.2 km",
    pricePerHour: 50,
    currency: "₹",
    availableSpots: 18,
    totalSpots: 45,
    vehicleTypes: ["FOUR_WHEELER", "TWO_WHEELER"],
    rating: 4.7,
    isEV: true, isCovered: false, isAccessible: true, hasCCTV: true, cctvScore: 95, densityZone: "high",
  },
  {
    id: "3",
    cityId: "bengaluru",
    cityName: "Bengaluru",
    name: "Electronic City Tech Park Garage",
    address: "Phase 1, Hosur Road, E-City",
    lat: 12.8452,
    lng: 77.6602,
    distance: "2.5 km",
    pricePerHour: 30,
    currency: "₹",
    availableSpots: 55,
    totalSpots: 100,
    vehicleTypes: ["FOUR_WHEELER", "TWO_WHEELER"],
    rating: 4.5,
    isEV: false, isCovered: true, isAccessible: false, hasCCTV: true, cctvScore: 91, densityZone: "low",
  },

  // Delhi NCR
  {
    id: "4",
    cityId: "delhi-ncr",
    cityName: "Delhi NCR",
    name: "Connaught Place Inner Circle Garage",
    address: "Block A, Connaught Place, New Delhi",
    lat: 28.6328,
    lng: 77.2197,
    distance: "0.5 km",
    pricePerHour: 50,
    currency: "₹",
    availableSpots: 32,
    totalSpots: 80,
    vehicleTypes: ["FOUR_WHEELER", "TWO_WHEELER"],
    rating: 4.9,
    isEV: true, isCovered: true, isAccessible: true, hasCCTV: true, cctvScore: 99, densityZone: "high",
  },
  {
    id: "5",
    cityId: "delhi-ncr",
    cityName: "Delhi NCR",
    name: "Cyber Hub Cyber City Plaza",
    address: "DLF Cyber City, Sector 24, Gurugram",
    lat: 28.495,
    lng: 77.0895,
    distance: "1.8 km",
    pricePerHour: 60,
    currency: "₹",
    availableSpots: 40,
    totalSpots: 120,
    vehicleTypes: ["FOUR_WHEELER"],
    rating: 4.8,
    isEV: true, isCovered: true, isAccessible: true, hasCCTV: true, cctvScore: 97, densityZone: "medium",
  },
  {
    id: "6",
    cityId: "delhi-ncr",
    cityName: "Delhi NCR",
    name: "Noida Sector 18 Market Multi-Level",
    address: "Block K, Sector 18, Noida",
    lat: 28.5708,
    lng: 77.3261,
    distance: "2.1 km",
    pricePerHour: 40,
    currency: "₹",
    availableSpots: 22,
    totalSpots: 70,
    vehicleTypes: ["FOUR_WHEELER", "TWO_WHEELER"],
    rating: 4.4,
    isEV: false, isCovered: false, isAccessible: false, hasCCTV: true, cctvScore: 85, densityZone: "medium",
  },

  // Mumbai
  {
    id: "7",
    cityId: "mumbai",
    cityName: "Mumbai",
    name: "BKC Financial Center Smart Hub",
    address: "G Block, Bandra Kurla Complex",
    lat: 19.0657,
    lng: 72.8687,
    distance: "0.8 km",
    pricePerHour: 70,
    currency: "₹",
    availableSpots: 45,
    totalSpots: 110,
    vehicleTypes: ["FOUR_WHEELER"],
    rating: 4.9,
    isEV: true, isCovered: true, isAccessible: true, hasCCTV: true, cctvScore: 99, densityZone: "high",
  },
  {
    id: "8",
    cityId: "mumbai",
    cityName: "Mumbai",
    name: "Nariman Point Waterfront Garage",
    address: "Free Press Journal Marg, Nariman Point",
    lat: 18.9256,
    lng: 72.8242,
    distance: "1.1 km",
    pricePerHour: 80,
    currency: "₹",
    availableSpots: 15,
    totalSpots: 50,
    vehicleTypes: ["FOUR_WHEELER", "TWO_WHEELER"],
    rating: 4.6,
    isEV: false, isCovered: false, isAccessible: true, hasCCTV: true, cctvScore: 93, densityZone: "high",
  },

  // Hyderabad
  {
    id: "9",
    cityId: "hyderabad",
    cityName: "Hyderabad",
    name: "HITEC City Cyber Towers Hub",
    address: "Madhapur, HITEC City, Hyderabad",
    lat: 17.4504,
    lng: 78.3808,
    distance: "0.6 km",
    pricePerHour: 40,
    currency: "₹",
    availableSpots: 38,
    totalSpots: 90,
    vehicleTypes: ["FOUR_WHEELER", "TWO_WHEELER"],
    rating: 4.7,
    isEV: true, isCovered: true, isAccessible: false, hasCCTV: true, cctvScore: 94, densityZone: "medium",
  },

  // Pune
  {
    id: "10",
    cityId: "pune",
    cityName: "Pune",
    name: "Hinjewadi IT Park Phase 1 Plaza",
    address: "Rajiv Gandhi Infotech Park, Hinjewadi",
    lat: 18.5912,
    lng: 73.7389,
    distance: "1.4 km",
    pricePerHour: 30,
    currency: "₹",
    availableSpots: 60,
    totalSpots: 130,
    vehicleTypes: ["FOUR_WHEELER", "TWO_WHEELER"],
    rating: 4.6,
    isEV: false, isCovered: true, isAccessible: true, hasCCTV: false, cctvScore: 72, densityZone: "low",
  },

  // Chennai
  {
    id: "11",
    cityId: "chennai",
    cityName: "Chennai",
    name: "Anna Salai Gemini Flyover Plaza",
    address: "Mount Road, Thousand Lights",
    lat: 13.0569,
    lng: 80.2525,
    distance: "0.9 km",
    pricePerHour: 40,
    currency: "₹",
    availableSpots: 25,
    totalSpots: 65,
    vehicleTypes: ["FOUR_WHEELER", "TWO_WHEELER"],
    rating: 4.5,
    isEV: false, isCovered: false, isAccessible: true, hasCCTV: true, cctvScore: 88, densityZone: "medium",
  },

  // Kolkata
  {
    id: "12",
    cityId: "kolkata",
    cityName: "Kolkata",
    name: "Park Street Heritage Parking Hub",
    address: "Park Street, Chowringhee, Kolkata",
    lat: 22.5551,
    lng: 88.3517,
    distance: "0.7 km",
    pricePerHour: 40,
    currency: "₹",
    availableSpots: 20,
    totalSpots: 50,
    vehicleTypes: ["FOUR_WHEELER", "TWO_WHEELER"],
    rating: 4.4,
    isEV: false, isCovered: false, isAccessible: false, hasCCTV: true, cctvScore: 82, densityZone: "high",
  },

  // Ahmedabad
  {
    id: "13",
    cityId: "ahmedabad",
    cityName: "Ahmedabad",
    name: "SG Highway Iskcon Smart Parking",
    address: "SG Highway, Bodakdev",
    lat: 23.0276,
    lng: 72.5074,
    distance: "1.0 km",
    pricePerHour: 30,
    currency: "₹",
    availableSpots: 35,
    totalSpots: 80,
    vehicleTypes: ["FOUR_WHEELER", "TWO_WHEELER"],
    rating: 4.6,
    isEV: true, isCovered: false, isAccessible: false, hasCCTV: false, cctvScore: 65, densityZone: "low",
  },

  // Surat
  {
    id: "14",
    cityId: "surat",
    cityName: "Surat",
    name: "Surat Ring Road Textile Market Garage",
    address: "Ring Road, Begampura",
    lat: 21.1959,
    lng: 72.8302,
    distance: "0.8 km",
    pricePerHour: 30,
    currency: "₹",
    availableSpots: 40,
    totalSpots: 90,
    vehicleTypes: ["FOUR_WHEELER", "TWO_WHEELER"],
    rating: 4.5,
    isEV: false, isCovered: true, isAccessible: false, hasCCTV: false, cctvScore: 70, densityZone: "medium",
  },

  // Jaipur
  {
    id: "15",
    cityId: "jaipur",
    cityName: "Jaipur",
    name: "MI Road Pink City Smart Lot",
    address: "MI Road, Jayanti Market, Jaipur",
    lat: 26.9187,
    lng: 75.8175,
    distance: "0.5 km",
    pricePerHour: 30,
    currency: "₹",
    availableSpots: 25,
    totalSpots: 60,
    vehicleTypes: ["FOUR_WHEELER", "TWO_WHEELER"],
    rating: 4.6,
    isEV: false, isCovered: false, isAccessible: false, hasCCTV: true, cctvScore: 87, densityZone: "medium",
  },

  // Chandigarh
  {
    id: "16",
    cityId: "chandigarh",
    cityName: "Chandigarh",
    name: "Sector 17 City Center Plaza",
    address: "Sector 17-C, Chandigarh",
    lat: 30.7398,
    lng: 76.7827,
    distance: "0.4 km",
    pricePerHour: 40,
    currency: "₹",
    availableSpots: 30,
    totalSpots: 70,
    vehicleTypes: ["FOUR_WHEELER", "TWO_WHEELER"],
    rating: 4.8,
    isEV: true, isCovered: true, isAccessible: true, hasCCTV: true, cctvScore: 96, densityZone: "low",
  },

  // Vishakapatnam
  {
    id: "17",
    cityId: "vishakapatnam",
    cityName: "Vishakapatnam",
    name: "Beach Road RK Beach Complex",
    address: "Beach Road, Pandurangapuram, Vizag",
    lat: 17.7142,
    lng: 83.3235,
    distance: "0.6 km",
    pricePerHour: 30,
    currency: "₹",
    availableSpots: 35,
    totalSpots: 75,
    vehicleTypes: ["FOUR_WHEELER", "TWO_WHEELER"],
    rating: 4.7,
    isEV: false, isCovered: false, isAccessible: false, hasCCTV: false, cctvScore: 60, densityZone: "low",
  },
];
