// WorkSphere AI — Local Worker Marketplace & Services Platform
// Pilot Launch: Guntur & Vijayawada, Andhra Pradesh, India

export const LOCALITIES = [
  { id: "brodipet", name: "Brodipet", pincode: "522002" },
  { id: "arundelpet", name: "Arundelpet", pincode: "522002" },
  { id: "lakshmipuram", name: "Lakshmipuram", pincode: "522007" },
  { id: "pattabhipuram", name: "Pattabhipuram", pincode: "522006" },
  { id: "koretipadu", name: "Koretipadu", pincode: "522007" },
  { id: "vidyanagar", name: "Vidyanagar", pincode: "522007" },
  { id: "syamalanagar", name: "Syamala Nagar", pincode: "522006" },
  { id: "gujanagundla", name: "Gujanagundla", pincode: "522006" },
  { id: "amaravathi-rd", name: "Amaravathi Road", pincode: "522034" },
  { id: "old-guntur", name: "Old Guntur", pincode: "522001" },
  { id: "governorpet", name: "Governorpet (Vijayawada)", pincode: "520002" },
  { id: "benz-circle", name: "Benz Circle (Vijayawada)", pincode: "520010" }
];

export const CATEGORIES = [
  {
    id: "wood-polishing",
    slug: "Wood Polish & Carpentry",
    name_en: "Wood Polish & Carpentry",
    name_te: "వుడ్ పాలిషింగ్ & వడ్రంగం",
    icon: "Hammer",
    description: "Teakwood doors, antique restoration, PU/Melamine finish, cupboards & custom carpentry",
    keywords: ["wood", "polish", "door", "cupboard", "wardrobe", "teak", "varnish", "furniture", "carpenter", "టేబుల్", "తలుపు", "చెక్క", "కప్‌బోర్డ్", "పాలిష్"]
  },
  {
    id: "plumbing",
    slug: "Plumbing & Pipe Repair",
    name_en: "Plumbing & Pipe Repair",
    name_te: "ప్లంబింగ్ & పైప్ రిపేర్",
    icon: "Droplets",
    description: "Pipe leakage, tap replacement, bathroom fittings, water tank & motor overhaul",
    keywords: ["plumber", "pipe", "leak", "tap", "drain", "tank", "water", "flush", "లీక్", "పైప్", "ట్యాప్", "నీరు", "ప్లంబర్"]
  },
  {
    id: "electrical",
    slug: "Electrical & Wiring",
    name_en: "Electrical & Wiring",
    name_te: "ఎలక్ట్రికల్ & వైరింగ్",
    icon: "Zap",
    description: "Short circuit repair, ceiling fan installation, MCB trip fix, inverter wiring & lighting",
    keywords: ["electric", "wire", "switch", "short circuit", "fan", "light", "mcb", "inverter", "కరెంట్", "ఫ్యాన్", "లైట్", "స్విచ్", "ఎలక్ట్రీషియన్"]
  },
  {
    id: "ac-repair",
    slug: "AC & Appliance Repair",
    name_en: "AC & Appliance Repair",
    name_te: "ఏసీ & ఉపకరణాల రిపేర్",
    icon: "AirVent",
    description: "Split/Window AC servicing, gas charging, refrigerator cooling repair, washing machine",
    keywords: ["ac", "air conditioner", "fridge", "refrigerator", "washing machine", "cooling", "gas", "కూలింగ్", "ఏసీ", "గ్యాస్", "ఫ్రిడ్జ్"]
  },
  {
    id: "painting",
    slug: "Painting & Wall Care",
    name_en: "Painting & Wall Care",
    name_te: "పెయింటింగ్ & వాల్ కేర్",
    icon: "Paintbrush",
    description: "Interior/Exterior painting, wall putty, damp proofing, texture & waterproofing",
    keywords: ["paint", "color", "wall", "putty", "waterproof", "damp", "texture", "రంగులు", "పెయింట్", "గోడలు", "పుట్టీ"]
  },
  {
    id: "other",
    slug: "Other Services",
    name_en: "Other Services",
    name_te: "ఇతర సేవలు",
    icon: "Wrench",
    description: "Masonry, tile fixing, metal fabrication, welding, glass work, and miscellaneous repairs",
    keywords: ["other", "tile", "mason", "welding", "grill", "glass", "repair", "fix", "ఇతర", "మేస్త్రీ", "వెల్డింగ్"]
  }
];

export const WORKERS = [];
export const INITIAL_BOOKINGS = [];
export const INITIAL_COMPLAINTS = [];

export const DEMAND_DATA = {
  byLocality: [],
  byCategory: [],
  byTimeSlot: [],
  monthlyTrend: []
};

// AI Work Assistant Diagnosis Rule Engine — No Prices, Pure Problem Recognition
export function analyzeProblemDescription(text) {
  if (!text || text.trim() === "") {
    return null;
  }
  const lower = text.toLowerCase();

  // Telugu & English keywords matching
  if (
    lower.includes("wood") || lower.includes("polish") || lower.includes("door") || lower.includes("cupboard") || 
    lower.includes("wardrobe") || lower.includes("teak") || lower.includes("carpenter") || lower.includes("varnish") ||
    lower.includes("చెక్క") || lower.includes("తలుపు") || lower.includes("పాలిష్") || lower.includes("కప్‌బోర్డ్") || lower.includes("ఫర్నిచర్")
  ) {
    return {
      categoryId: "wood-polishing",
      categoryName: "Wood Polish & Carpentry",
      categoryNameTe: "వుడ్ పాలిషింగ్ & వడ్రంగం",
      problemType: "Wood finishing, door restoration, or carpentry repairs",
      urgency: "Normal",
      confidence: 0.98,
      explanation: "Identified woodwork and surface polishing needs. Matched to verified local carpenters and polishers."
    };
  }

  if (
    lower.includes("leak") || lower.includes("pipe") || lower.includes("tap") || lower.includes("water") || 
    lower.includes("drain") || lower.includes("tank") || lower.includes("flush") || lower.includes("plumber") ||
    lower.includes("ప్లంబర్") || lower.includes("లీక్") || lower.includes("పైప్") || lower.includes("ట్యాప్") || lower.includes("నీరు") || lower.includes("బాత్‌రూమ్")
  ) {
    return {
      categoryId: "plumbing",
      categoryName: "Plumbing & Pipe Repair",
      categoryNameTe: "ప్లంబింగ్ & పైప్ రిపేర్",
      problemType: "Water leakage, pipe replacement, or sanitary fixture repair",
      urgency: "Urgent",
      confidence: 0.97,
      explanation: "Detected water leakage or plumbing issue. Fast response recommended to prevent property damage."
    };
  }

  if (
    lower.includes("electric") || lower.includes("wire") || lower.includes("shock") || lower.includes("fan") || 
    lower.includes("mcb") || lower.includes("switch") || lower.includes("light") || lower.includes("inverter") ||
    lower.includes("trip") || lower.includes("spark") || lower.includes("short circuit") ||
    lower.includes("కరెంట్") || lower.includes("షాక్") || lower.includes("వైరింగ్") || lower.includes("స్విచ్") || lower.includes("ఫ్యాన్")
  ) {
    return {
      categoryId: "electrical",
      categoryName: "Electrical & Wiring",
      categoryNameTe: "ఎలక్ట్రికల్ & వైరింగ్",
      problemType: "Circuit trip, faulty switchboard, or electrical wiring hazard",
      urgency: "Urgent (High Safety Priority)",
      confidence: 0.99,
      explanation: "Detected electrical safety hazard. Certified local electrician dispatch is advised."
    };
  }

  if (
    lower.includes("ac") || lower.includes("cooling") || lower.includes("fridge") || lower.includes("compressor") || 
    lower.includes("washing machine") || lower.includes("gas") || lower.includes("appliance") ||
    lower.includes("కూలింగ్") || lower.includes("ఏసీ") || lower.includes("ఫ్రిడ్జ్")
  ) {
    return {
      categoryId: "ac-repair",
      categoryName: "AC & Appliance Repair",
      categoryNameTe: "ఏసీ & ఉపకరణాల రిపేర్",
      problemType: "Appliance cooling defect, motor inspection, or maintenance",
      urgency: "Normal",
      confidence: 0.96,
      explanation: "Diagnosed appliance servicing requirement. Matched to technicians with diagnostic tools."
    };
  }

  if (
    lower.includes("paint") || lower.includes("color") || lower.includes("wall") || lower.includes("putty") || 
    lower.includes("waterproof") || lower.includes("damp") || lower.includes("texture") ||
    lower.includes("రంగులు") || lower.includes("పెయింట్") || lower.includes("గోడలు") || lower.includes("పుట్టీ")
  ) {
    return {
      categoryId: "painting",
      categoryName: "Painting & Wall Care",
      categoryNameTe: "పెయింటింగ్ & వాల్ కేర్",
      problemType: "Wall surface preparation, damp proofing, or interior painting",
      urgency: "Scheduled",
      confidence: 0.95,
      explanation: "Identified wall treatment and painting requirements. Suitable for residential site visit."
    };
  }

  // Fallback for general / other services
  return {
    categoryId: "other",
    categoryName: "Other Services",
    categoryNameTe: "ఇతర సేవలు",
    problemType: "General household repair or specialty trade assessment",
    urgency: "Normal",
    confidence: 0.88,
    explanation: "General maintenance request. Matching available verified local technicians in your area."
  };
}
