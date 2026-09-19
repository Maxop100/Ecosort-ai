import { DropOffLocation } from '../src/types';

export const MUNICIPAL_DROPOFF_LOCATIONS: DropOffLocation[] = [
  // New York City
  {
    id: 'nyc-safe-1',
    name: 'NYC Special Waste SAFE Center (Brooklyn)',
    municipality: 'New York City',
    address: 'Bay 41st Street & Shore Parkway, Bensonhurst, Brooklyn, NY',
    acceptedCategories: ['hazardous', 'e-waste'],
    hours: 'Saturday & the last Friday of each month: 10:00 AM – 5:00 PM',
    notes: 'Accepts lithium batteries, paints, motor oil, fluorescent CFL tubes, and prescription drugs. NY State ID required.',
    phone: '(212) 639-9675',
    isSpecializedHazardous: true
  },
  {
    id: 'nyc-safe-2',
    name: 'NYC Special Waste SAFE Center (Queens)',
    municipality: 'New York City',
    address: 'College Point Blvd & 31st Ave, College Point, Queens, NY',
    acceptedCategories: ['hazardous', 'e-waste'],
    hours: 'Saturdays and last Friday of each month: 10:00 AM – 5:00 PM',
    notes: 'Drive-in or walk-in. Keep chemicals in original labeled containers. Free for all NYC residents.',
    isSpecializedHazardous: true
  },
  {
    id: 'nyc-compost-1',
    name: 'Union Square Greenmarket Food Scrap Drop-off',
    municipality: 'New York City',
    address: 'Union Square West & 17th St, Manhattan, NY',
    acceptedCategories: ['organic'],
    hours: 'Mon, Wed, Fri, Sat: 8:00 AM – 5:00 PM',
    notes: 'Accepts fruit peels, coffee grounds, eggshells, and garden clippings. No meat or dairy packaging.',
    isSpecializedHazardous: false
  },

  // San Francisco
  {
    id: 'sf-recology-hhw',
    name: 'San Francisco Household Hazardous Waste Facility',
    municipality: 'San Francisco',
    address: '501 Tunnel Ave, San Francisco, CA 94134',
    acceptedCategories: ['hazardous', 'e-waste'],
    hours: 'Thursday, Friday & Saturday: 8:00 AM – 4:00 PM',
    notes: 'Free drop-off for SF residents. Max 15 gallons or 125 lbs per trip. Seal all battery terminals with clear tape.',
    phone: '(415) 330-1405',
    isSpecializedHazardous: true
  },
  {
    id: 'sf-ewaste-center',
    name: 'Recology San Francisco Recycling Center',
    municipality: 'San Francisco',
    address: '501 Tunnel Ave, San Francisco, CA 94134',
    acceptedCategories: ['e-waste', 'recyclable'],
    hours: 'Monday – Friday: 7:00 AM – 4:30 PM, Saturday: 7:30 AM – 4:00 PM',
    notes: 'Accepts monitors, computers, televisions, scrap metal, clean rigid plastics, and corrugated cardboard.',
    phone: '(415) 330-1400',
    isSpecializedHazardous: false
  },

  // Tokyo
  {
    id: 'tokyo-shinjuku-clean',
    name: 'Shinjuku City Clean Center (新宿区清掃センター)',
    municipality: 'Tokyo',
    address: '1-8-1 Kabukicho, Shinjuku City, Tokyo 160-8484',
    acceptedCategories: ['hazardous', 'e-waste'],
    hours: 'Monday – Saturday: 8:30 AM – 5:00 PM',
    notes: 'Yellow battery collection boxes available at entrance. Dry cell and button cell batteries must be taped.',
    phone: '03-5273-3111',
    isSpecializedHazardous: true
  },
  {
    id: 'tokyo-shibuya-recycle',
    name: 'Shibuya Ward Resource Collection Depot (渋谷区リサイクル)',
    municipality: 'Tokyo',
    address: '1-1 Udagawacho, Shibuya City, Tokyo 150-8010',
    acceptedCategories: ['recyclable', 'e-waste'],
    hours: 'Daily: 9:00 AM – 7:00 PM',
    notes: 'Dedicated small appliance reclamation boxes (telephones, game consoles, AC adapters).',
    isSpecializedHazardous: false
  },

  // Berlin
  {
    id: 'berlin-bsr-gradestrasse',
    name: 'BSR Recyclinghof Gradestraße (Neukölln)',
    municipality: 'Berlin',
    address: 'Gradestraße 77, 12347 Berlin, Germany',
    acceptedCategories: ['hazardous', 'e-waste', 'recyclable'],
    hours: 'Monday – Friday: 7:00 AM – 7:00 PM, Saturday: 7:00 AM – 3:00 PM',
    notes: 'Official BSR Schadstoffsammelstelle. Accepts paints, accumulator batteries, solvents, WEEE appliances.',
    phone: '+49 30 7592-4900',
    isSpecializedHazardous: true
  },
  {
    id: 'berlin-bsr-ostpreussendamm',
    name: 'BSR Recyclinghof Ostpreußendamm (Steglitz)',
    municipality: 'Berlin',
    address: 'Ostpreußendamm 110, 12207 Berlin, Germany',
    acceptedCategories: ['e-waste', 'hazardous', 'recyclable', 'organic'],
    hours: 'Monday – Friday: 7:00 AM – 7:00 PM, Saturday: 7:00 AM – 3:00 PM',
    notes: 'Green waste, garden cuttings, e-waste, and hazardous household chemicals free of charge.',
    isSpecializedHazardous: true
  },

  // Universal / General
  {
    id: 'gen-battery-retail',
    name: 'Retail Electronics & Battery Take-Back Network (Call2Recycle / Best Buy / Home Depot)',
    municipality: 'general',
    address: 'Participating retail hardware stores, big-box electronics retailers, and municipal civic buildings',
    acceptedCategories: ['hazardous', 'e-waste'],
    hours: 'Regular store operating hours (usually 9:00 AM – 9:00 PM)',
    notes: 'Free national kiosks for rechargeable batteries, smartphones, chargers, CFL bulbs, and printer cartridges.',
    isSpecializedHazardous: true
  },
  {
    id: 'gen-community-compost',
    name: 'Municipal Organic Compost Facility & Community Garden Hub',
    municipality: 'general',
    address: 'Local Civic Environmental Center or Regional Wastewater / Composting Plant',
    acceptedCategories: ['organic'],
    hours: 'Tuesday – Saturday: 8:00 AM – 4:00 PM',
    notes: 'Diverts kitchen food scraps, vegetable trimmings, yard waste, and clean unbleached napkins into soil conditioning.',
    isSpecializedHazardous: false
  }
];
