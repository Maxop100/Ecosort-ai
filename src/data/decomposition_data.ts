import { DecompositionStats, WasteCategory } from '../types';

export function getDecompositionStats(itemName: string, category: WasteCategory): DecompositionStats {
  const query = itemName.toLowerCase();

  // 1. Batteries & Hazardous
  if (query.match(/battery|lithium|accumulator|lead|cell|cfl|mercury|paint|chemical|solvent/)) {
    return {
      yearsToDecompose: 100,
      displayTime: 'Corrodes indefinitely (Toxic)',
      landfillMethaneKg: 0.1,
      recyclingEnergySavedPercent: 92,
      toxicityRisk: 'Severe',
      oceanPollutionRisk: 'Critical',
      funFact: 'Lithium batteries in landfills leach cobalt, nickel, and manganese into groundwater, and physical compression causes intense thermal-runaway landfill fires.'
    };
  }

  // 2. Electronics & E-Waste
  if (query.match(/phone|laptop|cable|wire|circuit|screen|charger|keyboard|mouse|electronics/)) {
    return {
      yearsToDecompose: 1000,
      displayTime: '1,000+ Years',
      landfillMethaneKg: 0.5,
      recyclingEnergySavedPercent: 88,
      toxicityRisk: 'Severe',
      oceanPollutionRisk: 'High',
      funFact: 'Recycling 1 million laptops saves the energy equivalent to the electricity used by 3,657 U.S. homes in a year, and recovers gold, silver, and palladium.'
    };
  }

  // 3. Aluminum & Metal Cans
  if (query.match(/aluminum|aluminium|soda can|beverage can|tin can|foil|metal/)) {
    return {
      yearsToDecompose: 250,
      displayTime: '200 – 500 Years',
      landfillMethaneKg: 0.05,
      recyclingEnergySavedPercent: 95,
      toxicityRisk: 'Low',
      oceanPollutionRisk: 'Low',
      funFact: 'Recycling an aluminum can requires 95% less energy than mining bauxite ore to make a new one, and it can be back on store shelves as a new can in just 60 days!'
    };
  }

  // 4. Glass
  if (query.match(/glass|bottle|jar|wine|beverage bottle/)) {
    return {
      yearsToDecompose: 1000000,
      displayTime: '1,000,000+ Years',
      landfillMethaneKg: 0.02,
      recyclingEnergySavedPercent: 30,
      toxicityRisk: 'Low',
      oceanPollutionRisk: 'Low',
      funFact: 'Glass is 100% recyclable and can be melted and remanufactured infinitely with zero loss in chemical purity or structural quality.'
    };
  }

  // 5. Plastic Bottles (PET / HDPE)
  if (query.match(/plastic bottle|pet|water bottle|shampoo|detergent|jug/)) {
    return {
      yearsToDecompose: 450,
      displayTime: '450 – 500 Years',
      landfillMethaneKg: 0.8,
      recyclingEnergySavedPercent: 75,
      toxicityRisk: 'Moderate',
      oceanPollutionRisk: 'Critical',
      funFact: 'PET bottles never truly disappear in nature; UV sunlight breaks them down into microscopic polymer fragments (microplastics) that enter the marine food web.'
    };
  }

  // 6. Plastic Bags & Films (LDPE)
  if (query.match(/bubble wrap|plastic bag|film|wrap|packaging pouch|chip bag/)) {
    return {
      yearsToDecompose: 20,
      displayTime: '20 – 50 Years',
      landfillMethaneKg: 0.6,
      recyclingEnergySavedPercent: 40,
      toxicityRisk: 'Moderate',
      oceanPollutionRisk: 'Critical',
      funFact: 'Thin packaging film is the #1 cause of jammed conveyor belts and motor shutdowns in municipal automated material recovery facilities (MRFs).'
    };
  }

  // 7. Paper & Cardboard
  if (query.match(/cardboard|paper|box|newspaper|carton|magazine|book/)) {
    return {
      yearsToDecompose: 0.2,
      displayTime: '2 – 3 Months',
      landfillMethaneKg: 1.2,
      recyclingEnergySavedPercent: 60,
      toxicityRisk: 'Low',
      oceanPollutionRisk: 'Low',
      funFact: 'When clean cardboard is recycled, every ton saves 17 mature trees, 7,000 gallons of clean water, and 4,100 kilowatt-hours of electrical energy.'
    };
  }

  // 8. Organics / Food waste
  if (category === 'organic' || query.match(/banana|apple|food|peel|scrap|coffee|bread|egg|tea|compost|leaf|yard/)) {
    return {
      yearsToDecompose: 0.08,
      displayTime: '2 – 6 Weeks',
      landfillMethaneKg: 2.1, // Anoxic decomposition in landfills generates high methane
      recyclingEnergySavedPercent: 100, // composting eliminates methane
      toxicityRisk: 'Low',
      oceanPollutionRisk: 'Low',
      funFact: 'Food waste trapped in anaerobic landfills produces methane, a greenhouse gas 28x more potent than CO2. Aerobic municipal composting eliminates this entirely!'
    };
  }

  // Default General Waste
  return {
    yearsToDecompose: 150,
    displayTime: '50 – 150 Years',
    landfillMethaneKg: 0.9,
    recyclingEnergySavedPercent: 50,
    toxicityRisk: 'Moderate',
    oceanPollutionRisk: 'High',
    funFact: 'Municipal solid waste that cannot be segregated is compacted in engineered sanitary landfills or directed to high-efficiency waste-to-energy recovery incinerators.'
  };
}
