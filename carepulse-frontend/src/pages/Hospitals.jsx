import { useMemo, useState } from "react";
import Card from "../components/Card";
import StatusBanner from "../components/StatusBanner";
import {
  IconHospital,
  IconLocation,
  IconPhone,
  IconDirections,
} from "../components/Icons";

// ------------------------------------------------------------
// MOCK DATA
// Temporary hospital data for UI development.
// Later this can be replaced with Google Places API response.
// ------------------------------------------------------------

const MOCK_HOSPITALS = [
  // =========================
  // DELHI
  // =========================
  {
    id: "delhi-1",
    city: "Delhi",
    name: "AIIMS New Delhi",
    type: "Multi-Speciality Hospital",
    address: "Ansari Nagar, New Delhi, Delhi",
    distance_km: 2.4,
    phone: "+91 11 2659 3333",
    rating: 4.8,
    rating_count: 1240,
    emergency: true,
    highlyRated: true,
    open24: true,
  },
  {
    id: "delhi-2",
    city: "Delhi",
    name: "Safdarjung Hospital",
    type: "Government Hospital",
    address: "Ansari Nagar West, New Delhi, Delhi",
    distance_km: 4.2,
    phone: "+91 11 2673 0000",
    rating: 4.5,
    rating_count: 980,
    emergency: true,
    highlyRated: true,
    open24: true,
  },

    // =========================
  // GHAZIABAD
  // =========================
  {
    id: "ghaziabad-1",
    city: "Ghaziabad",
    name: "Yashoda Super Speciality Hospital",
    type: "Multi-Speciality Hospital",
    address: "Nehru Nagar, Ghaziabad, Uttar Pradesh",
    distance_km: 3.2,
    phone: "+91 120 418 8888",
    rating: 4.5,
    rating_count: 920,
    emergency: true,
    highlyRated: true,
    open24: true,
  },
  {
    id: "ghaziabad-2",
    city: "Ghaziabad",
    name: "Max Super Speciality Hospital",
    type: "Multi-Speciality Hospital",
    address: "Vaishali, Ghaziabad, Uttar Pradesh",
    distance_km: 5.4,
    phone: "+91 120 452 2222",
    rating: 4.4,
    rating_count: 810,
    emergency: true,
    highlyRated: false,
    open24: true,
  },

    // =========================
  // MEERUT
  // =========================
  {
    id: "meerut-1",
    city: "Meerut",
    name: "KMC Hospital",
    type: "Multi-Speciality Hospital",
    address: "Garh Road, Meerut, Uttar Pradesh",
    distance_km: 3.8,
    phone: "+91 121 276 0000",
    rating: 4.5,
    rating_count: 740,
    emergency: true,
    highlyRated: true,
    open24: true,
  },
  {
    id: "meerut-2",
    city: "Meerut",
    name: "Lala Lajpat Rai Memorial Medical College",
    type: "Government Medical College",
    address: "Garh Road, Meerut, Uttar Pradesh",
    distance_km: 6.1,
    phone: "+91 121 276 0001",
    rating: 4.3,
    rating_count: 620,
    emergency: true,
    highlyRated: false,
    open24: true,
  },

  // =========================
  // MUMBAI
  // =========================
  {
    id: "mumbai-1",
    city: "Mumbai",
    name: "Kokilaben Dhirubhai Ambani Hospital",
    type: "Multi-Speciality Hospital",
    address: "Andheri West, Mumbai, Maharashtra",
    distance_km: 3.1,
    phone: "+91 22 4269 6969",
    rating: 4.7,
    rating_count: 2100,
    emergency: true,
    highlyRated: true,
    open24: true,
  },
  {
    id: "mumbai-2",
    city: "Mumbai",
    name: "Lilavati Hospital",
    type: "Multi-Speciality Hospital",
    address: "Bandra West, Mumbai, Maharashtra",
    distance_km: 5.6,
    phone: "+91 22 2675 1000",
    rating: 4.6,
    rating_count: 1850,
    emergency: true,
    highlyRated: true,
    open24: true,
  },

  // =========================
  // BENGALURU
  // =========================
  {
    id: "bengaluru-1",
    city: "Bengaluru",
    name: "Manipal Hospital",
    type: "Multi-Speciality Hospital",
    address: "Old Airport Road, Bengaluru, Karnataka",
    distance_km: 4.2,
    phone: "+91 80 2502 4444",
    rating: 4.6,
    rating_count: 1800,
    emergency: true,
    highlyRated: true,
    open24: true,
  },
  {
    id: "bengaluru-2",
    city: "Bengaluru",
    name: "Narayana Health City",
    type: "Multi-Speciality Hospital",
    address: "Bommasandra, Bengaluru, Karnataka",
    distance_km: 7.8,
    phone: "+91 80 7122 2222",
    rating: 4.5,
    rating_count: 1450,
    emergency: true,
    highlyRated: true,
    open24: true,
  },

  // =========================
  // CHENNAI
  // =========================
  {
    id: "chennai-1",
    city: "Chennai",
    name: "Apollo Hospitals Chennai",
    type: "Multi-Speciality Hospital",
    address: "Greams Road, Chennai, Tamil Nadu",
    distance_km: 3.5,
    phone: "+91 44 2829 3333",
    rating: 4.7,
    rating_count: 1900,
    emergency: true,
    highlyRated: true,
    open24: true,
  },
  {
    id: "chennai-2",
    city: "Chennai",
    name: "MIOT International",
    type: "Speciality Hospital",
    address: "Manapakkam, Chennai, Tamil Nadu",
    distance_km: 6.4,
    phone: "+91 44 4200 2288",
    rating: 4.6,
    rating_count: 1320,
    emergency: true,
    highlyRated: true,
    open24: true,
  },

  // =========================
  // HYDERABAD
  // =========================
  {
    id: "hyderabad-1",
    city: "Hyderabad",
    name: "Apollo Hospitals Hyderabad",
    type: "Multi-Speciality Hospital",
    address: "Jubilee Hills, Hyderabad, Telangana",
    distance_km: 3.8,
    phone: "+91 40 2360 7777",
    rating: 4.6,
    rating_count: 1650,
    emergency: true,
    highlyRated: true,
    open24: true,
  },
  {
    id: "hyderabad-2",
    city: "Hyderabad",
    name: "Yashoda Hospitals",
    type: "Multi-Speciality Hospital",
    address: "Somajiguda, Hyderabad, Telangana",
    distance_km: 5.1,
    phone: "+91 40 4567 4567",
    rating: 4.5,
    rating_count: 1520,
    emergency: true,
    highlyRated: true,
    open24: true,
  },

  // =========================
  // KOLKATA
  // =========================
  {
    id: "kolkata-1",
    city: "Kolkata",
    name: "Apollo Multispeciality Hospitals",
    type: "Multi-Speciality Hospital",
    address: "Canal Circular Road, Kolkata, West Bengal",
    distance_km: 4.1,
    phone: "+91 33 4420 2121",
    rating: 4.5,
    rating_count: 1280,
    emergency: true,
    highlyRated: true,
    open24: true,
  },
  {
    id: "kolkata-2",
    city: "Kolkata",
    name: "AMRI Hospitals",
    type: "Multi-Speciality Hospital",
    address: "Dhakuria, Kolkata, West Bengal",
    distance_km: 6.3,
    phone: "+91 33 6680 0000",
    rating: 4.4,
    rating_count: 1120,
    emergency: true,
    highlyRated: false,
    open24: true,
  },

  // =========================
  // PUNE
  // =========================
  {
    id: "pune-1",
    city: "Pune",
    name: "Ruby Hall Clinic",
    type: "Multi-Speciality Hospital",
    address: "Sassoon Road, Pune, Maharashtra",
    distance_km: 3.6,
    phone: "+91 20 6645 5100",
    rating: 4.5,
    rating_count: 1400,
    emergency: true,
    highlyRated: true,
    open24: true,
  },
  {
    id: "pune-2",
    city: "Pune",
    name: "Jehangir Hospital",
    type: "Multi-Speciality Hospital",
    address: "Sangamvadi, Pune, Maharashtra",
    distance_km: 5.8,
    phone: "+91 20 6681 9999",
    rating: 4.4,
    rating_count: 980,
    emergency: true,
    highlyRated: false,
    open24: true,
  },

  // =========================
  // AHMEDABAD
  // =========================
  {
    id: "ahmedabad-1",
    city: "Ahmedabad",
    name: "Zydus Hospital",
    type: "Multi-Speciality Hospital",
    address: "Sarkhej-Gandhinagar Highway, Ahmedabad, Gujarat",
    distance_km: 4.5,
    phone: "+91 79 6619 0200",
    rating: 4.6,
    rating_count: 1200,
    emergency: true,
    highlyRated: true,
    open24: true,
  },
  {
    id: "ahmedabad-2",
    city: "Ahmedabad",
    name: "Sterling Hospital",
    type: "Multi-Speciality Hospital",
    address: "Memnagar, Ahmedabad, Gujarat",
    distance_km: 6.2,
    phone: "+91 79 4001 1111",
    rating: 4.4,
    rating_count: 1050,
    emergency: true,
    highlyRated: false,
    open24: true,
  },

  // =========================
  // JAIPUR
  // =========================
  {
    id: "jaipur-1",
    city: "Jaipur",
    name: "Fortis Escorts Hospital Jaipur",
    type: "Multi-Speciality Hospital",
    address: "Malviya Nagar, Jaipur, Rajasthan",
    distance_km: 4.0,
    phone: "+91 141 254 7000",
    rating: 4.5,
    rating_count: 920,
    emergency: true,
    highlyRated: true,
    open24: true,
  },
  {
    id: "jaipur-2",
    city: "Jaipur",
    name: "Manipal Hospital Jaipur",
    type: "Multi-Speciality Hospital",
    address: "Sector 5, Vidhyadhar Nagar, Jaipur, Rajasthan",
    distance_km: 7.1,
    phone: "+91 141 516 0000",
    rating: 4.4,
    rating_count: 870,
    emergency: true,
    highlyRated: false,
    open24: true,
  },

  // =========================
  // LUCKNOW
  // =========================
  {
    id: "lucknow-1",
    city: "Lucknow",
    name: "Medanta Hospital Lucknow",
    type: "Multi-Speciality Hospital",
    address: "Sushant Golf City, Lucknow, Uttar Pradesh",
    distance_km: 4.3,
    phone: "+91 522 450 5050",
    rating: 4.6,
    rating_count: 1150,
    emergency: true,
    highlyRated: true,
    open24: true,
  },
  {
    id: "lucknow-2",
    city: "Lucknow",
    name: "ApolloMed Hospital",
    type: "Multi-Speciality Hospital",
    address: "Kanpur Road, Lucknow, Uttar Pradesh",
    distance_km: 6.7,
    phone: "+91 522 334 4444",
    rating: 4.4,
    rating_count: 930,
    emergency: true,
    highlyRated: false,
    open24: true,
  },

  // =========================
  // CHANDIGARH
  // =========================
  {
    id: "chandigarh-1",
    city: "Chandigarh",
    name: "PGIMER Chandigarh",
    type: "Government Medical Institute",
    address: "Sector 12, Chandigarh",
    distance_km: 3.2,
    phone: "+91 172 275 6565",
    rating: 4.7,
    rating_count: 2100,
    emergency: true,
    highlyRated: true,
    open24: true,
  },
  {
    id: "chandigarh-2",
    city: "Chandigarh",
    name: "Fortis Hospital Mohali",
    type: "Multi-Speciality Hospital",
    address: "Phase 8, Mohali, Punjab",
    distance_km: 7.5,
    phone: "+91 172 469 2222",
    rating: 4.5,
    rating_count: 1120,
    emergency: true,
    highlyRated: true,
    open24: true,
  },

  // =========================
  // BHOPAL
  // =========================
  {
    id: "bhopal-1",
    city: "Bhopal",
    name: "AIIMS Bhopal",
    type: "Government Medical Institute",
    address: "Saket Nagar, Bhopal, Madhya Pradesh",
    distance_km: 4.2,
    phone: "+91 755 267 2333",
    rating: 4.6,
    rating_count: 890,
    emergency: true,
    highlyRated: true,
    open24: true,
  },
  {
    id: "bhopal-2",
    city: "Bhopal",
    name: "Bansal Hospital",
    type: "Multi-Speciality Hospital",
    address: "Shahpura, Bhopal, Madhya Pradesh",
    distance_km: 6.1,
    phone: "+91 755 408 6000",
    rating: 4.4,
    rating_count: 760,
    emergency: true,
    highlyRated: false,
    open24: true,
  },

  // =========================
  // PATNA
  // =========================
  {
    id: "patna-1",
    city: "Patna",
    name: "AIIMS Patna",
    type: "Government Medical Institute",
    address: "Phulwarisharif, Patna, Bihar",
    distance_km: 4.8,
    phone: "+91 612 245 1070",
    rating: 4.5,
    rating_count: 820,
    emergency: true,
    highlyRated: true,
    open24: true,
  },
  {
    id: "patna-2",
    city: "Patna",
    name: "Paras HMRI Hospital",
    type: "Multi-Speciality Hospital",
    address: "Raja Bazar, Patna, Bihar",
    distance_km: 6.4,
    phone: "+91 612 710 7777",
    rating: 4.4,
    rating_count: 740,
    emergency: true,
    highlyRated: false,
    open24: true,
  },

  // =========================
  // BHUBANESWAR
  // =========================
  {
    id: "bhubaneswar-1",
    city: "Bhubaneswar",
    name: "AIIMS Bhubaneswar",
    type: "Government Medical Institute",
    address: "Patrapada, Bhubaneswar, Odisha",
    distance_km: 3.9,
    phone: "+91 674 247 6000",
    rating: 4.6,
    rating_count: 850,
    emergency: true,
    highlyRated: true,
    open24: true,
  },
  {
    id: "bhubaneswar-2",
    city: "Bhubaneswar",
    name: "Apollo Hospitals Bhubaneswar",
    type: "Multi-Speciality Hospital",
    address: "Sainik School Road, Bhubaneswar, Odisha",
    distance_km: 6.0,
    phone: "+91 674 666 1010",
    rating: 4.5,
    rating_count: 920,
    emergency: true,
    highlyRated: true,
    open24: true,
  },

  // =========================
  // GUWAHATI
  // =========================
  {
    id: "guwahati-1",
    city: "Guwahati",
    name: "Gauhati Medical College Hospital",
    type: "Government Medical College",
    address: "Bhangagarh, Guwahati, Assam",
    distance_km: 3.4,
    phone: "+91 361 252 9457",
    rating: 4.4,
    rating_count: 720,
    emergency: true,
    highlyRated: false,
    open24: true,
  },
  {
    id: "guwahati-2",
    city: "Guwahati",
    name: "GNRC Hospitals",
    type: "Multi-Speciality Hospital",
    address: "Six Mile, Guwahati, Assam",
    distance_km: 6.2,
    phone: "+91 361 710 0000",
    rating: 4.3,
    rating_count: 680,
    emergency: true,
    highlyRated: false,
    open24: true,
  },

  // =========================
  // KOCHI
  // =========================
  {
    id: "kochi-1",
    city: "Kochi",
    name: "Amrita Hospital Kochi",
    type: "Multi-Speciality Hospital",
    address: "Ponekkara, Kochi, Kerala",
    distance_km: 4.2,
    phone: "+91 484 285 1234",
    rating: 4.7,
    rating_count: 1600,
    emergency: true,
    highlyRated: true,
    open24: true,
  },
  {
    id: "kochi-2",
    city: "Kochi",
    name: "Aster Medcity",
    type: "Multi-Speciality Hospital",
    address: "Cheranalloor, Kochi, Kerala",
    distance_km: 7.0,
    phone: "+91 484 669 9999",
    rating: 4.6,
    rating_count: 1400,
    emergency: true,
    highlyRated: true,
    open24: true,
  },

  // =========================
  // COIMBATORE
  // =========================
  {
    id: "coimbatore-1",
    city: "Coimbatore",
    name: "KMCH",
    type: "Multi-Speciality Hospital",
    address: "Avinashi Road, Coimbatore, Tamil Nadu",
    distance_km: 3.7,
    phone: "+91 422 432 3800",
    rating: 4.5,
    rating_count: 950,
    emergency: true,
    highlyRated: true,
    open24: true,
  },
  {
    id: "coimbatore-2",
    city: "Coimbatore",
    name: "PSG Hospitals",
    type: "Teaching Hospital",
    address: "Peelamedu, Coimbatore, Tamil Nadu",
    distance_km: 6.3,
    phone: "+91 422 434 5000",
    rating: 4.4,
    rating_count: 820,
    emergency: true,
    highlyRated: false,
    open24: true,
  },

  // =========================
  // INDORE
  // =========================
  {
    id: "indore-1",
    city: "Indore",
    name: "Bombay Hospital Indore",
    type: "Multi-Speciality Hospital",
    address: "Ring Road, Indore, Madhya Pradesh",
    distance_km: 4.3,
    phone: "+91 731 477 1111",
    rating: 4.5,
    rating_count: 900,
    emergency: true,
    highlyRated: true,
    open24: true,
  },
  {
    id: "indore-2",
    city: "Indore",
    name: "Choithram Hospital",
    type: "Multi-Speciality Hospital",
    address: "Manik Bagh Road, Indore, Madhya Pradesh",
    distance_km: 6.5,
    phone: "+91 731 236 2491",
    rating: 4.4,
    rating_count: 780,
    emergency: true,
    highlyRated: false,
    open24: true,
  },

  // =========================
  // NAGPUR
  // =========================
  {
    id: "nagpur-1",
    city: "Nagpur",
    name: "Wockhardt Hospitals Nagpur",
    type: "Multi-Speciality Hospital",
    address: "Shankar Nagar, Nagpur, Maharashtra",
    distance_km: 4.0,
    phone: "+91 712 662 4444",
    rating: 4.5,
    rating_count: 840,
    emergency: true,
    highlyRated: true,
    open24: true,
  },
  {
    id: "nagpur-2",
    city: "Nagpur",
    name: "Alexis Multispeciality Hospital",
    type: "Multi-Speciality Hospital",
    address: "Mankapur, Nagpur, Maharashtra",
    distance_km: 6.6,
    phone: "+91 712 712 0000",
    rating: 4.4,
    rating_count: 710,
    emergency: true,
    highlyRated: false,
    open24: true,
  },

  // =========================
  // SURAT
  // =========================
  {
    id: "surat-1",
    city: "Surat",
    name: "Kiran Multi Super Speciality Hospital",
    type: "Multi-Speciality Hospital",
    address: "Vasta Devdi Road, Surat, Gujarat",
    distance_km: 4.1,
    phone: "+91 261 716 1111",
    rating: 4.5,
    rating_count: 850,
    emergency: true,
    highlyRated: true,
    open24: true,
  },
  {
    id: "surat-2",
    city: "Surat",
    name: "New Civil Hospital Surat",
    type: "Government Hospital",
    address: "Majura Gate, Surat, Gujarat",
    distance_km: 6.2,
    phone: "+91 261 224 4456",
    rating: 4.2,
    rating_count: 620,
    emergency: true,
    highlyRated: false,
    open24: true,
  },

  // =========================
  // KANPUR
  // =========================
  {
    id: "kanpur-1",
    city: "Kanpur",
    name: "Regency Hospital Kanpur",
    type: "Multi-Speciality Hospital",
    address: "Sarvodaya Nagar, Kanpur, Uttar Pradesh",
    distance_km: 4.5,
    phone: "+91 512 350 0000",
    rating: 4.4,
    rating_count: 760,
    emergency: true,
    highlyRated: false,
    open24: true,
  },
  {
    id: "kanpur-2",
    city: "Kanpur",
    name: "LLR Hospital",
    type: "Government Medical College",
    address: "Swaroop Nagar, Kanpur, Uttar Pradesh",
    distance_km: 6.1,
    phone: "+91 512 255 9476",
    rating: 4.3,
    rating_count: 690,
    emergency: true,
    highlyRated: false,
    open24: true,
  },

  // =========================
  // VARANASI
  // =========================
  {
    id: "varanasi-1",
    city: "Varanasi",
    name: "IMS BHU Hospital",
    type: "Teaching Hospital",
    address: "BHU Campus, Varanasi, Uttar Pradesh",
    distance_km: 3.8,
    phone: "+91 542 236 7568",
    rating: 4.6,
    rating_count: 980,
    emergency: true,
    highlyRated: true,
    open24: true,
  },
  {
    id: "varanasi-2",
    city: "Varanasi",
    name: "Heritage Hospitals",
    type: "Multi-Speciality Hospital",
    address: "Lanka, Varanasi, Uttar Pradesh",
    distance_km: 5.9,
    phone: "+91 542 236 8888",
    rating: 4.4,
    rating_count: 650,
    emergency: true,
    highlyRated: false,
    open24: true,
  },

  // =========================
  // RANCHI
  // =========================
  {
    id: "ranchi-1",
    city: "Ranchi",
    name: "Rajendra Institute of Medical Sciences",
    type: "Government Medical Institute",
    address: "Bariatu, Ranchi, Jharkhand",
    distance_km: 4.0,
    phone: "+91 651 254 1533",
    rating: 4.4,
    rating_count: 700,
    emergency: true,
    highlyRated: false,
    open24: true,
  },
  {
    id: "ranchi-2",
    city: "Ranchi",
    name: "Medica Hospital Ranchi",
    type: "Multi-Speciality Hospital",
    address: "Tupudana, Ranchi, Jharkhand",
    distance_km: 6.4,
    phone: "+91 651 398 8888",
    rating: 4.3,
    rating_count: 590,
    emergency: true,
    highlyRated: false,
    open24: true,
  },

  // =========================
  // DEHRADUN
  // =========================
  {
    id: "dehradun-1",
    city: "Dehradun",
    name: "Max Super Speciality Hospital",
    type: "Multi-Speciality Hospital",
    address: "Mussoorie Diversion Road, Dehradun, Uttarakhand",
    distance_km: 3.5,
    phone: "+91 135 667 0000",
    rating: 4.5,
    rating_count: 720,
    emergency: true,
    highlyRated: true,
    open24: true,
  },
  {
    id: "dehradun-2",
    city: "Dehradun",
    name: "Shri Mahant Indiresh Hospital",
    type: "Teaching Hospital",
    address: "Patel Nagar, Dehradun, Uttarakhand",
    distance_km: 6.0,
    phone: "+91 135 667 3000",
    rating: 4.3,
    rating_count: 580,
    emergency: true,
    highlyRated: false,
    open24: true,
  },

  // =========================
  // SRINAGAR
  // =========================
  {
    id: "srinagar-1",
    city: "Srinagar",
    name: "SKIMS Hospital",
    type: "Speciality Hospital",
    address: "Soura, Srinagar, Jammu and Kashmir",
    distance_km: 4.2,
    phone: "+91 194 240 1013",
    rating: 4.5,
    rating_count: 760,
    emergency: true,
    highlyRated: true,
    open24: true,
  },
  {
    id: "srinagar-2",
    city: "Srinagar",
    name: "Government Medical College Srinagar",
    type: "Government Medical College",
    address: "Karan Nagar, Srinagar, Jammu and Kashmir",
    distance_km: 6.3,
    phone: "+91 194 244 1365",
    rating: 4.3,
    rating_count: 520,
    emergency: true,
    highlyRated: false,
    open24: true,
  },

  // =========================
  // VISAKHAPATNAM
  // =========================
  {
    id: "vizag-1",
    city: "Visakhapatnam",
    name: "CARE Hospitals Visakhapatnam",
    type: "Multi-Speciality Hospital",
    address: "Ram Nagar, Visakhapatnam, Andhra Pradesh",
    distance_km: 3.9,
    phone: "+91 891 304 9999",
    rating: 4.5,
    rating_count: 720,
    emergency: true,
    highlyRated: true,
    open24: true,
  },
  {
    id: "vizag-2",
    city: "Visakhapatnam",
    name: "Apollo Hospitals Visakhapatnam",
    type: "Multi-Speciality Hospital",
    address: "Health City, Arilova, Visakhapatnam, Andhra Pradesh",
    distance_km: 6.5,
    phone: "+91 891 286 7777",
    rating: 4.4,
    rating_count: 680,
    emergency: true,
    highlyRated: false,
    open24: true,
  },

  // =========================
  // MYSURU
  // =========================
  {
    id: "mysuru-1",
    city: "Mysuru",
    name: "Manipal Hospital Mysore",
    type: "Multi-Speciality Hospital",
    address: "Vijayanagar, Mysuru, Karnataka",
    distance_km: 4.1,
    phone: "+91 821 240 9000",
    rating: 4.5,
    rating_count: 620,
    emergency: true,
    highlyRated: true,
    open24: true,
  },
  {
    id: "mysuru-2",
    city: "Mysuru",
    name: "Columbia Asia Hospital Mysore",
    type: "Multi-Speciality Hospital",
    address: "Hebbal, Mysuru, Karnataka",
    distance_km: 6.2,
    phone: "+91 821 398 9899",
    rating: 4.4,
    rating_count: 580,
    emergency: true,
    highlyRated: false,
    open24: true,
  },

  // =========================
  // VADODARA
  // =========================
  {
    id: "vadodara-1",
    city: "Vadodara",
    name: "Sterling Hospital Vadodara",
    type: "Multi-Speciality Hospital",
    address: "Race Course Road, Vadodara, Gujarat",
    distance_km: 4.3,
    phone: "+91 265 309 9999",
    rating: 4.5,
    rating_count: 650,
    emergency: true,
    highlyRated: true,
    open24: true,
  },
  {
    id: "vadodara-2",
    city: "Vadodara",
    name: "Baroda Heart Institute",
    type: "Speciality Hospital",
    address: "Old Padra Road, Vadodara, Gujarat",
    distance_km: 6.0,
    phone: "+91 265 232 2200",
    rating: 4.3,
    rating_count: 510,
    emergency: true,
    highlyRated: false,
    open24: true,
  },

  // =========================
  // AMRITSAR
  // =========================
  {
    id: "amritsar-1",
    city: "Amritsar",
    name: "Amandeep Hospital",
    type: "Multi-Speciality Hospital",
    address: "GT Road, Amritsar, Punjab",
    distance_km: 4.0,
    phone: "+91 183 505 5555",
    rating: 4.4,
    rating_count: 560,
    emergency: true,
    highlyRated: false,
    open24: true,
  },
  {
    id: "amritsar-2",
    city: "Amritsar",
    name: "Fortis Hospital Amritsar",
    type: "Multi-Speciality Hospital",
    address: "Majitha-Verka Bypass Road, Amritsar, Punjab",
    distance_km: 6.4,
    phone: "+91 183 301 0101",
    rating: 4.5,
    rating_count: 610,
    emergency: true,
    highlyRated: true,
    open24: true,
  },

  // =========================
  // RAIPUR
  // =========================
  {
    id: "raipur-1",
    city: "Raipur",
    name: "AIIMS Raipur",
    type: "Government Medical Institute",
    address: "Tatibandh, Raipur, Chhattisgarh",
    distance_km: 3.7,
    phone: "+91 771 257 3777",
    rating: 4.6,
    rating_count: 720,
    emergency: true,
    highlyRated: true,
    open24: true,
  },
  {
    id: "raipur-2",
    city: "Raipur",
    name: "Ramkrishna Care Hospital",
    type: "Multi-Speciality Hospital",
    address: "Pachpedi Naka, Raipur, Chhattisgarh",
    distance_km: 6.1,
    phone: "+91 771 422 2222",
    rating: 4.4,
    rating_count: 560,
    emergency: true,
    highlyRated: false,
    open24: true,
  },
];

const DISTANCE_FILTERS = [
  { id: "all", label: "Any distance" },
  { id: "2", label: "Within 2 km" },
  { id: "5", label: "Within 5 km" },
  { id: "10", label: "Within 10 km" },
  { id: "25", label: "Within 25 km" },
];

const QUICK_FILTERS = [
  { id: "emergency", label: "24/7 Emergency" },
  { id: "highlyRated", label: "Highly Rated" },
  { id: "open24", label: "Open 24/7" },
];

export default function Hospitals() {
  const [location, setLocation] = useState("");
  const [locationLabel, setLocationLabel] = useState("");
  const [status, setStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const [distanceFilter, setDistanceFilter] = useState("5");
  const [quickFilters, setQuickFilters] = useState([]);
  const [facilityType, setFacilityType] = useState("All Facilities");
  const [sortBy, setSortBy] = useState("distance");

  const [visibleCount, setVisibleCount] = useState(6);
  const [hasSearched, setHasSearched] = useState(false);
  const [locating, setLocating] = useState(false);

  // ------------------------------------------------------------
  // MOCK SEARCH
  // ------------------------------------------------------------

  function runMockSearch(searchLocation) {
    if (!searchLocation.trim()) return;

    setStatus("loading");
    setErrorMessage("");
    setVisibleCount(6);

    setTimeout(() => {
      setLocationLabel(searchLocation.trim());
      setHasSearched(true);
      setStatus("idle");
    }, 450);
  }

  function handleSubmit(event) {
    event.preventDefault();
    runMockSearch(location);
  }

  // ------------------------------------------------------------
  // GPS
  // ------------------------------------------------------------

  function useMyLocation() {
    if (!navigator.geolocation) {
      setStatus("error");
      setErrorMessage(
        "Your browser doesn't support location lookup."
      );
      return;
    }

    setLocating(true);
    setStatus("idle");
    setErrorMessage("");

    navigator.geolocation.getCurrentPosition(
      () => {
        setLocating(false);

        // Mock GPS location for UI development.
        setLocation("Delhi");
        setLocationLabel("Delhi");
        setHasSearched(true);
        setVisibleCount(6);
      },
      () => {
        setLocating(false);
        setStatus("error");
        setErrorMessage(
          "Couldn't get your location. Check your browser's location permission."
        );
      }
    );
  }

  // ------------------------------------------------------------
  // QUICK FILTERS
  // ------------------------------------------------------------

  function toggleQuickFilter(filterId) {
    setQuickFilters((current) =>
      current.includes(filterId)
        ? current.filter((id) => id !== filterId)
        : [...current, filterId]
    );

    setVisibleCount(6);
  }

  // ------------------------------------------------------------
  // FILTER + SEARCH RESULTS
  // ------------------------------------------------------------

  const filteredResults = useMemo(() => {
    let results = [...MOCK_HOSPITALS];

    // ----------------------------------------------------------
    // CITY / LOCATION SEARCH
    // ----------------------------------------------------------

    if (locationLabel.trim()) {
      const search = locationLabel.trim().toLowerCase();

      results = results.filter((hospital) => {
        const city = hospital.city?.toLowerCase() || "";
        const address = hospital.address?.toLowerCase() || "";
        const name = hospital.name?.toLowerCase() || "";

        return (
          city.includes(search) ||
          address.includes(search) ||
          name.includes(search)
        );
      });
    }

    // ----------------------------------------------------------
    // DISTANCE FILTER
    // ----------------------------------------------------------

    if (distanceFilter !== "all") {
      const maxDistance = Number(distanceFilter);

      results = results.filter(
        (hospital) => hospital.distance_km <= maxDistance
      );
    }

    // ----------------------------------------------------------
    // FACILITY TYPE
    // ----------------------------------------------------------

    if (facilityType === "Emergency") {
      results = results.filter((hospital) => hospital.emergency);
    }

    if (facilityType === "Highly Rated") {
      results = results.filter((hospital) => hospital.rating >= 4.5);
    }

    if (facilityType === "Open 24/7") {
      results = results.filter((hospital) => hospital.open24);
    }

    // ----------------------------------------------------------
    // QUICK FILTERS
    // ----------------------------------------------------------

    quickFilters.forEach((filter) => {
      if (filter === "emergency") {
        results = results.filter((hospital) => hospital.emergency);
      }

      if (filter === "highlyRated") {
        results = results.filter((hospital) => hospital.highlyRated);
      }

      if (filter === "open24") {
        results = results.filter((hospital) => hospital.open24);
      }
    });

    // ----------------------------------------------------------
    // SORTING
    // ----------------------------------------------------------

    if (sortBy === "distance") {
      results.sort(
        (a, b) => a.distance_km - b.distance_km
      );
    }

    if (sortBy === "rating") {
      results.sort((a, b) => b.rating - a.rating);
    }

    if (sortBy === "name") {
      results.sort((a, b) =>
        a.name.localeCompare(b.name)
      );
    }

    return results;
  }, [
    locationLabel,
    distanceFilter,
    facilityType,
    quickFilters,
    sortBy,
  ]);

  const visibleResults = filteredResults.slice(
    0,
    visibleCount
  );

  const hasMore =
    visibleCount < filteredResults.length;

  // ------------------------------------------------------------
  // UI
  // ------------------------------------------------------------

  return (
    <div className="page">

      {/* ---------------------------------------------------- */}
      {/* HEADER */}
      {/* ---------------------------------------------------- */}

      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "1.5rem",
          alignItems: "flex-start",
          marginBottom: "1.4rem",
          flexWrap: "wrap",
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              gap: "0.6rem",
              flexWrap: "wrap",
              marginBottom: "0.65rem",
            }}
          >
            <span
              style={{
                background: "rgba(20, 184, 166, 0.12)",
                color: "var(--primary)",
                borderRadius: "999px",
                padding: "0.35rem 0.7rem",
                fontSize: "0.72rem",
                fontWeight: 700,
                letterSpacing: "0.04em",
              }}
            >
              EMERGENCY & CLINICAL NETWORK
            </span>

            <span
              style={{
                background: "var(--surface)",
                color: "var(--text-muted)",
                borderRadius: "999px",
                padding: "0.35rem 0.7rem",
                fontSize: "0.72rem",
                fontWeight: 600,
              }}
            >
              Live Location Search
            </span>
          </div>

          <h1
            style={{
              fontSize: "1.8rem",
              marginBottom: "0.35rem",
            }}
          >
            Nearby Hospitals & Emergency Centers
          </h1>

          <p
            className="page-lead"
            style={{
              maxWidth: "720px",
              marginBottom: 0,
            }}
          >
            Find nearby hospitals and emergency facilities,
            compare distance and available facility information,
            and get directions or contact details.
          </p>
        </div>

        {/* Emergency banner */}

        <div
          style={{
            background: "rgba(239, 68, 68, 0.12)",
            borderRadius: "14px",
            padding: "0.85rem 1rem",
            minWidth: "250px",
            display: "flex",
            alignItems: "center",
            gap: "0.7rem",
          }}
        >
          <div
            style={{
              width: "26px",
              height: "26px",
              borderRadius: "50%",
              background: "#dc2626",
              flexShrink: 0,
            }}
          />

          <div>
            <div
              style={{
                fontSize: "0.7rem",
                fontWeight: 800,
                color: "#b91c1c",
                letterSpacing: "0.05em",
              }}
            >
              24/7 EMERGENCY
            </div>

            <div
              style={{
                fontWeight: 800,
                fontSize: "0.95rem",
              }}
            >
              Emergency: 112
            </div>

            <div
              style={{
                fontSize: "0.72rem",
                color: "var(--text-muted)",
              }}
            >
              For immediate medical emergencies
            </div>
          </div>
        </div>
      </header>

      {/* ---------------------------------------------------- */}
      {/* LOCATION SEARCH */}
      {/* ---------------------------------------------------- */}

      <Card>
        <form onSubmit={handleSubmit}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "minmax(220px, 1.8fr) minmax(170px, 0.9fr) auto auto",
              gap: "0.7rem",
              alignItems: "end",
            }}
          >
            <div className="field">
              <label htmlFor="hospital-location">
                Location
              </label>

              <div style={{ position: "relative" }}>
                <IconLocation
                  width={17}
                  height={17}
                  style={{
                    position: "absolute",
                    left: "0.8rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                  }}
                />

                <input
                  id="hospital-location"
                  value={location}
                  onChange={(event) =>
                    setLocation(event.target.value)
                  }
                  placeholder="City, area, address, or landmark"
                  style={{
                    paddingLeft: "2.35rem",
                    width: "100%",
                  }}
                />
              </div>
            </div>

            <div className="field">
              <label htmlFor="facility-type">
                Facility type
              </label>

              <select
                id="facility-type"
                value={facilityType}
                onChange={(event) =>
                  setFacilityType(event.target.value)
                }
              >
                <option>All Facilities</option>
                <option>Emergency</option>
                <option>Highly Rated</option>
                <option>Open 24/7</option>
              </select>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={
                status === "loading" ||
                !location.trim()
              }
              style={{
                minHeight: "42px",
                whiteSpace: "nowrap",
              }}
            >
              {status === "loading"
                ? "Searching…"
                : "Find Hospitals"}
            </button>

            <button
              type="button"
              className="btn btn-ghost"
              onClick={useMyLocation}
              disabled={
                locating || status === "loading"
              }
              style={{
                minHeight: "42px",
                whiteSpace: "nowrap",
              }}
            >
              <IconLocation
                width={16}
                height={16}
              />

              {locating ? "Locating…" : "GPS"}
            </button>
          </div>

          {locationLabel && (
            <div
              style={{
                marginTop: "0.85rem",
                display: "flex",
                justifyContent: "space-between",
                gap: "1rem",
                flexWrap: "wrap",
                fontSize: "0.74rem",
                color: "var(--text-muted)",
              }}
            >
              <span>
                <strong
                  style={{
                    color: "var(--primary)",
                  }}
                >
                  ●
                </strong>{" "}
                Location confirmed: {locationLabel}
              </span>

              <span>
                Search radius based on selected distance
              </span>
            </div>
          )}
        </form>
      </Card>

      {/* ---------------------------------------------------- */}
      {/* ERRORS */}
      {/* ---------------------------------------------------- */}

      {status === "error" && (
        <StatusBanner tone="error">
          {errorMessage}
        </StatusBanner>
      )}

      {/* ---------------------------------------------------- */}
      {/* RESULTS */}
      {/* ---------------------------------------------------- */}

      {hasSearched && status !== "loading" && (
        <>
          {/* Distance + sorting */}

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "1rem",
              flexWrap: "wrap",
              marginTop: "1.3rem",
              marginBottom: "0.7rem",
            }}
          >
            <div
              style={{
                display: "flex",
                gap: "0.45rem",
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  fontSize: "0.72rem",
                  fontWeight: 800,
                  color: "var(--text-muted)",
                  marginRight: "0.2rem",
                }}
              >
                DISTANCE:
              </span>

              {DISTANCE_FILTERS.map((filter) => (
                <button
                  key={filter.id}
                  type="button"
                  className={`chip-toggle ${
                    distanceFilter === filter.id
                      ? "active"
                      : ""
                  }`}
                  onClick={() => {
                    setDistanceFilter(filter.id);
                    setVisibleCount(6);
                  }}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.6rem",
              }}
            >
              <span
                style={{
                  fontSize: "0.72rem",
                  color: "var(--text-muted)",
                  fontWeight: 600,
                }}
              >
                Showing {visibleResults.length} of{" "}
                {filteredResults.length}
              </span>

              <select
                value={sortBy}
                onChange={(event) =>
                  setSortBy(event.target.value)
                }
                style={{
                  minHeight: "36px",
                  width: "auto",
                }}
                aria-label="Sort hospitals"
              >
                <option value="distance">
                  Distance (Nearest First)
                </option>
                <option value="rating">
                  Rating (Highest First)
                </option>
                <option value="name">
                  Name (A–Z)
                </option>
              </select>
            </div>
          </div>

          {/* Quick filters */}

          <div
            style={{
              display: "flex",
              gap: "0.45rem",
              flexWrap: "wrap",
              marginBottom: "1.1rem",
              alignItems: "center",
            }}
          >
            <span
              style={{
                fontSize: "0.7rem",
                fontWeight: 800,
                color: "var(--text-muted)",
                marginRight: "0.15rem",
              }}
            >
              QUICK FILTERS:
            </span>

            {QUICK_FILTERS.map((filter) => {
              const active =
                quickFilters.includes(filter.id);

              return (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() =>
                    toggleQuickFilter(filter.id)
                  }
                  style={{
                    border: active
                      ? "1px solid var(--primary)"
                      : "1px solid var(--border)",
                    background: active
                      ? "rgba(20, 184, 166, 0.12)"
                      : "var(--surface)",
                    color: active
                      ? "var(--primary)"
                      : "var(--text)",
                    borderRadius: "999px",
                    padding: "0.35rem 0.7rem",
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  <span
                    style={{
                      color: active
                        ? "var(--primary)"
                        : "#94a3b8",
                      marginRight: "0.25rem",
                    }}
                  >
                    ●
                  </span>

                  {filter.label}
                </button>
              );
            })}
          </div>

          {/* EMPTY STATE */}

          {filteredResults.length === 0 ? (
            <StatusBanner tone="pending">
              No hospitals found for "{locationLabel}".
              Try another city such as Delhi, Mumbai,
              Bengaluru, Chennai, or Hyderabad.
            </StatusBanner>
          ) : (
            <>
              {/* HOSPITAL GRID */}

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(340px, 1fr))",
                  gap: "1rem",
                }}
              >
                {visibleResults.map((hospital) => (
                  <Card
                    key={hospital.id}
                    icon={
                      <IconHospital
                        width={18}
                        height={18}
                      />
                    }
                    title={hospital.name}
                    subtitle={hospital.type}
                    right={
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.25rem",
                          background:
                            "rgba(20, 184, 166, 0.1)",
                          color: "var(--primary)",
                          borderRadius: "999px",
                          padding: "0.3rem 0.55rem",
                          fontSize: "0.72rem",
                          fontWeight: 800,
                          whiteSpace: "nowrap",
                        }}
                      >
                        ★ {hospital.rating}

                        <span
                          style={{
                            fontWeight: 600,
                            opacity: 0.7,
                          }}
                        >
                          ({hospital.rating_count})
                        </span>
                      </span>
                    }
                  >
                    {/* Address */}

                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "0.45rem",
                        marginBottom: "0.45rem",
                        fontSize: "0.78rem",
                        color: "var(--text-muted)",
                      }}
                    >
                      <IconLocation
                        width={15}
                        height={15}
                      />

                      <span>
                        {hospital.address}
                      </span>
                    </div>

                    {/* Distance */}

                    <div
                      style={{
                        fontSize: "0.8rem",
                        fontWeight: 700,
                        color: "var(--primary)",
                        marginBottom: "0.85rem",
                      }}
                    >
                      {hospital.distance_km} km away
                    </div>

                    {/* Information strip */}

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(3, 1fr)",
                        gap: "0.5rem",
                        background:
                          "rgba(59, 130, 246, 0.07)",
                        borderRadius: "10px",
                        padding: "0.7rem",
                        marginBottom: "0.8rem",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontSize: "0.62rem",
                            color:
                              "var(--text-muted)",
                            fontWeight: 700,
                          }}
                        >
                          FACILITY
                        </div>

                        <div
                          style={{
                            fontSize: "0.76rem",
                            fontWeight: 700,
                          }}
                        >
                          Hospital
                        </div>
                      </div>

                      <div>
                        <div
                          style={{
                            fontSize: "0.62rem",
                            color:
                              "var(--text-muted)",
                            fontWeight: 700,
                          }}
                        >
                          RATING
                        </div>

                        <div
                          style={{
                            fontSize: "0.76rem",
                            fontWeight: 700,
                            color:
                              "var(--primary)",
                          }}
                        >
                          {hospital.rating}/5
                        </div>
                      </div>

                      <div>
                        <div
                          style={{
                            fontSize: "0.62rem",
                            color:
                              "var(--text-muted)",
                            fontWeight: 700,
                          }}
                        >
                          ACCESS
                        </div>

                        <div
                          style={{
                            fontSize: "0.76rem",
                            fontWeight: 700,
                          }}
                        >
                          {hospital.open24
                            ? "24/7"
                            : "Standard"}
                        </div>
                      </div>
                    </div>

                    {/* Tags */}

                    <div
                      style={{
                        display: "flex",
                        gap: "0.4rem",
                        flexWrap: "wrap",
                        marginBottom: "1rem",
                      }}
                    >
                      {hospital.emergency && (
                        <span
                          style={{
                            background:
                              "rgba(239, 68, 68, 0.1)",
                            color: "#b91c1c",
                            borderRadius: "4px",
                            padding:
                              "0.25rem 0.45rem",
                            fontSize: "0.64rem",
                            fontWeight: 700,
                          }}
                        >
                          Emergency Care
                        </span>
                      )}

                      {hospital.open24 && (
                        <span
                          style={{
                            background:
                              "rgba(20, 184, 166, 0.1)",
                            color: "var(--primary)",
                            borderRadius: "4px",
                            padding:
                              "0.25rem 0.45rem",
                            fontSize: "0.64rem",
                            fontWeight: 700,
                          }}
                        >
                          Open 24/7
                        </span>
                      )}

                      {hospital.highlyRated && (
                        <span
                          style={{
                            background:
                              "rgba(59, 130, 246, 0.08)",
                            color: "#2563eb",
                            borderRadius: "4px",
                            padding:
                              "0.25rem 0.45rem",
                            fontSize: "0.64rem",
                            fontWeight: 700,
                          }}
                        >
                          Highly Rated
                        </span>
                      )}
                    </div>

                    {/* Actions */}

                    <div
                      style={{
                        display: "flex",
                        gap: "0.55rem",
                        flexWrap: "wrap",
                      }}
                    >
                      <a
                        className="btn btn-primary"
                        href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                          hospital.address
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <IconDirections
                          width={16}
                          height={16}
                        />
                        Directions
                      </a>

                      {hospital.phone && (
                        <a
                          className="btn btn-ghost"
                          href={`tel:${hospital.phone}`}
                        >
                          <IconPhone
                            width={16}
                            height={16}
                          />
                          Call
                        </a>
                      )}
                    </div>
                  </Card>
                ))}
              </div>

              {/* Load more */}

              {hasMore && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    marginTop: "1.4rem",
                  }}
                >
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() =>
                      setVisibleCount(
                        (current) => current + 2
                      )
                    }
                  >
                    ↓ Load 2 Additional Facilities
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* ---------------------------------------------------- */}
      {/* INITIAL STATE */}
      {/* ---------------------------------------------------- */}

      {!hasSearched && status === "idle" && (
        <div
          style={{
            marginTop: "1.4rem",
            textAlign: "center",
            padding: "3rem 1rem",
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "16px",
          }}
        >
          <div
            style={{
              width: "56px",
              height: "56px",
              margin: "0 auto 1rem",
              borderRadius: "16px",
              display: "grid",
              placeItems: "center",
              background:
                "rgba(20, 184, 166, 0.1)",
              color: "var(--primary)",
            }}
          >
            <IconHospital
              width={26}
              height={26}
            />
          </div>

          <h2
            style={{
              fontSize: "1.1rem",
              marginBottom: "0.4rem",
            }}
          >
            Find hospitals near you
          </h2>

          <p
            style={{
              color: "var(--text-muted)",
              fontSize: "0.85rem",
              maxWidth: "500px",
              margin: "0 auto",
            }}
          >
            Enter a city or location to discover
            nearby healthcare facilities.
          </p>
        </div>
      )}
    </div>
  );
}