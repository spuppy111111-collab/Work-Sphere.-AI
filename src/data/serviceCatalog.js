// =========================================================================
// WorkSphere AI — 50 Service Categories & 250 Services Master Catalogue
// Shared across Customer Dashboard & Worker Dashboard
// =========================================================================

export const SERVICE_GROUPS = [
  {
    id: 1,
    key: "home-maintenance",
    title: "Home Maintenance & Repairs",
    icon: "Home",
    color: "#D6B779",
  },
  {
    id: 2,
    key: "cleaning-household",
    title: "Cleaning & Household Services",
    icon: "Sparkles",
    color: "#A3C4BC",
  },
  {
    id: 3,
    key: "appliances-installation",
    title: "Appliances & Home Installation",
    icon: "Tv",
    color: "#E2B770",
  },
  {
    id: 4,
    key: "vehicle-transport",
    title: "Vehicle & Transport Services",
    icon: "Car",
    color: "#8FA396",
  },
  {
    id: 5,
    key: "technology-digital",
    title: "Technology & Digital Services",
    icon: "Laptop",
    color: "#9BB1FF",
  },
  {
    id: 6,
    key: "personal-daily-life",
    title: "Personal & Daily-Life Services",
    icon: "Scissors",
    color: "#F4A261",
  },
  {
    id: 7,
    key: "business-professional",
    title: "Business & Professional Services",
    icon: "FileSpreadsheet",
    color: "#C59B27",
  },
  {
    id: 8,
    key: "construction-property",
    title: "Construction & Property Services",
    icon: "Layers",
    color: "#E76F51",
  },
  {
    id: 9,
    key: "family-events",
    title: "Family, Events & Lifestyle",
    icon: "PartyPopper",
    color: "#E9C46A",
  },
  {
    id: 10,
    key: "local-utility",
    title: "Local, Utility & Specialised Services",
    icon: "Package",
    color: "#2A9D8F",
  },
];

export const SERVICE_CATEGORIES = [
  // -------------------------------------------------------------
  // Group 1: 🏠 Home Maintenance & Repairs
  // -------------------------------------------------------------
  {
    id: "plumbing",
    name: "Plumbing",
    groupId: 1,
    groupName: "Home Maintenance & Repairs",
    icon: "Droplets",
    description: "Pipe leakage repair, tap installation, bathroom plumbing, drain blockage removal, water tank repair.",
    sortOrder: 1,
    services: [
      { id: "plumbing-pipe-leak", name: "Pipe Leakage Repair", description: "Detection and fixing of concealed or exposed pipeline leaks.", basePrice: 449 },
      { id: "plumbing-tap-install", name: "Tap Installation", description: "Fitting and replacing basin taps, kitchen bib cocks, and shower heads.", basePrice: 249 },
      { id: "plumbing-bathroom-plumb", name: "Bathroom Plumbing", description: "Complete commode, flush tank, diverter, and shower installation.", basePrice: 699 },
      { id: "plumbing-drain-block", name: "Drain Blockage Removal", description: "Clearing choked sink traps, floor drains, and sewer pipes.", basePrice: 399 },
      { id: "plumbing-water-tank", name: "Water Tank Repair", description: "Overhead tank float valve, ball cock, and leak sealing.", basePrice: 599 },
    ],
  },
  {
    id: "electrical-services",
    name: "Electrical Services",
    groupId: 1,
    groupName: "Home Maintenance & Repairs",
    icon: "Zap",
    description: "Fan installation, switchboard repair, wiring repair, light installation, MCB troubleshooting.",
    sortOrder: 2,
    services: [
      { id: "elec-fan-install", name: "Fan Installation", description: "Ceiling fan assembly, regulator connection, and canopy mounting.", basePrice: 299 },
      { id: "elec-switchboard-repair", name: "Switchboard Repair", description: "Socket replacement, modular switch fix, and earthing checks.", basePrice: 249 },
      { id: "elec-wiring-repair", name: "Wiring Repair", description: "Short-circuit troubleshooting, conduit re-wiring, and load balancing.", basePrice: 499 },
      { id: "elec-light-install", name: "Light Installation", description: "False ceiling spotlights, chandeliers, LED panel batten fittings.", basePrice: 249 },
      { id: "elec-mcb-troubleshoot", name: "MCB Troubleshooting", description: "Main distribution board fuse, RCCB, and circuit breaker trip fixes.", basePrice: 399 },
    ],
  },
  {
    id: "carpentry",
    name: "Carpentry",
    groupId: 1,
    groupName: "Home Maintenance & Repairs",
    icon: "Hammer",
    description: "Door repair, cupboard repair, furniture assembly, shelf installation, wooden window repair.",
    sortOrder: 3,
    services: [
      { id: "carp-door-repair", name: "Door Repair", description: "Hinges adjustment, lock fitting, door shaving, and frame leveling.", basePrice: 349 },
      { id: "carp-cupboard-repair", name: "Cupboard Repair", description: "Wardrobe slider tracks, hydraulic hinges, and drawer channel fix.", basePrice: 399 },
      { id: "carp-furniture-assembly", name: "Furniture Assembly", description: "Assembly of flat-pack beds, study desks, and modular units.", basePrice: 499 },
      { id: "carp-shelf-installation", name: "Shelf Installation", description: "Floating wall shelves, book racks, and wooden ledge mounting.", basePrice: 299 },
      { id: "carp-window-repair", name: "Wooden Window Repair", description: "Window pane fitting, latch alignment, and teakwood frame touchup.", basePrice: 399 },
    ],
  },
  {
    id: "painting-services",
    name: "Painting Services",
    groupId: 1,
    groupName: "Home Maintenance & Repairs",
    icon: "Paintbrush",
    description: "Interior painting, exterior painting, wall repainting, texture painting, waterproof coating.",
    sortOrder: 4,
    services: [
      { id: "paint-interior", name: "Interior Painting", description: "Living room, bedroom emulsions, primer application, and masking.", basePrice: 999 },
      { id: "paint-exterior", name: "Exterior Painting", description: "Weather-proof exterior apex coat, scaffolding prep, and primer.", basePrice: 1499 },
      { id: "paint-wall-repainting", name: "Wall Repainting", description: "Single-wall refresh, tenant touchups, and stain cover coating.", basePrice: 599 },
      { id: "paint-texture", name: "Texture Painting", description: "Accent wall metallic, stucco, and designer pattern finish.", basePrice: 1299 },
      { id: "paint-waterproof-coating", name: "Waterproof Coating", description: "Anti-fungal wall sealant, damp-block primer, and moisture coat.", basePrice: 899 },
    ],
  },
  {
    id: "masonry",
    name: "Masonry",
    groupId: 1,
    groupName: "Home Maintenance & Repairs",
    icon: "Layers",
    description: "Brickwork, cement plastering, wall crack repair, tile fixing, concrete patch repair.",
    sortOrder: 5,
    services: [
      { id: "mason-brickwork", name: "Brickwork", description: "Partition walls, boundary bricks, and parapet construction.", basePrice: 799 },
      { id: "mason-cement-plastering", name: "Cement Plastering", description: "Smooth sand-faced plastering, ceiling patching, and screeding.", basePrice: 699 },
      { id: "mason-wall-crack-repair", name: "Wall Crack Repair", description: "Polymer-modified mortar groove filling and structural mesh fix.", basePrice: 499 },
      { id: "mason-tile-fixing", name: "Tile Fixing", description: "Loose floor tile replacement, bathroom skirting, and adhesive repair.", basePrice: 449 },
      { id: "mason-concrete-patch", name: "Concrete Patch Repair", description: "Spalling concrete repair, lintel re-cementing, and foundation seal.", basePrice: 599 },
    ],
  },

  // -------------------------------------------------------------
  // Group 2: 🧹 Cleaning & Household Services
  // -------------------------------------------------------------
  {
    id: "home-cleaning",
    name: "Home Cleaning",
    groupId: 2,
    groupName: "Cleaning & Household Services",
    icon: "Home",
    description: "Full house cleaning, bathroom cleaning, kitchen cleaning, dust removal, move-in cleaning.",
    sortOrder: 6,
    services: [
      { id: "clean-full-house", name: "Full House Cleaning", description: "Comprehensive dusting, mopping, cobweb clearing, and sanitization.", basePrice: 1499 },
      { id: "clean-bathroom", name: "Bathroom Cleaning", description: "Tile scale removal, commode descaling, mirror polishing, and drain wash.", basePrice: 399 },
      { id: "clean-kitchen", name: "Kitchen Cleaning", description: "Countertop degreasing, backsplash wiping, and cabinet wipe-down.", basePrice: 699 },
      { id: "clean-dust-removal", name: "Dust Removal", description: "High-reach fan, false ceiling, ventilator, and curtain vacuuming.", basePrice: 349 },
      { id: "clean-move-in", name: "Move-in Cleaning", description: "Post-handover deep scrub, window tracks, and odor neutralization.", basePrice: 1799 },
    ],
  },
  {
    id: "deep-cleaning",
    name: "Deep Cleaning",
    groupId: 2,
    groupName: "Cleaning & Household Services",
    icon: "Sparkles",
    description: "Sofa deep cleaning, mattress cleaning, floor scrubbing, kitchen degreasing, post-renovation cleaning.",
    sortOrder: 7,
    services: [
      { id: "deep-sofa-cleaning", name: "Sofa Deep Cleaning", description: "Fabric shampoo injection-extraction, stain removal, leather conditioner.", basePrice: 699 },
      { id: "deep-mattress-cleaning", name: "Mattress Cleaning", description: "UV-C dust mite vacuuming, stain treatment, and deodorizing.", basePrice: 599 },
      { id: "deep-floor-scrubbing", name: "Floor Scrubbing", description: "Single-disc machine scrubbing for granite, vitrified tile, and marble.", basePrice: 899 },
      { id: "deep-kitchen-degreasing", name: "Kitchen Degreasing", description: "Heavy grease removal from oil-stained tiles, exhaust hoods, and racks.", basePrice: 799 },
      { id: "deep-post-renovation", name: "Post-Renovation Cleaning", description: "Cement droplet removal, paint splatter cleanup, and fine dust vacuum.", basePrice: 1999 },
    ],
  },
  {
    id: "laundry-ironing",
    name: "Laundry & Ironing",
    groupId: 2,
    groupName: "Cleaning & Household Services",
    icon: "Shirt",
    description: "Clothes washing, steam ironing, dry-cleaning coordination, blanket washing, laundry pickup and delivery.",
    sortOrder: 8,
    services: [
      { id: "laundry-clothes-washing", name: "Clothes Washing", description: "Fabric-safe machine wash with detergent, softener, and fold.", basePrice: 299 },
      { id: "laundry-steam-ironing", name: "Steam Ironing", description: "Crisp wrinkle-free pressing for formals, silk sarees, and linens.", basePrice: 199 },
      { id: "laundry-dry-cleaning", name: "Dry-Cleaning Coordination", description: "Professional solvent cleaning for blazers, lehengas, and woolens.", basePrice: 499 },
      { id: "laundry-blanket-washing", name: "Blanket Washing", description: "Heavy comforter, mink blanket, and duvet deep sanitization.", basePrice: 349 },
      { id: "laundry-pickup-delivery", name: "Laundry Pickup & Delivery", description: "Doorstep collection and scheduled delivery within 24 hours.", basePrice: 99 },
    ],
  },
  {
    id: "gardening",
    name: "Gardening",
    groupId: 2,
    groupName: "Cleaning & Household Services",
    icon: "Flower2",
    description: "Lawn mowing, plant trimming, garden maintenance, pot planting, garden cleanup.",
    sortOrder: 9,
    services: [
      { id: "garden-lawn-mowing", name: "Lawn Mowing", description: "Grass trimmer edging, uniform lawn height cut, and clippings disposal.", basePrice: 499 },
      { id: "garden-plant-trimming", name: "Plant Trimming", description: "Hedge pruning, deadheading rose bushes, and aesthetic tree shaping.", basePrice: 399 },
      { id: "garden-maintenance", name: "Garden Maintenance", description: "Soil aerating, organic fertilizer/compost top-dress, and weeding.", basePrice: 599 },
      { id: "garden-pot-planting", name: "Pot Planting", description: "Repotting indoor ornamentals, potting mix prep, and nursery transfer.", basePrice: 299 },
      { id: "garden-cleanup", name: "Garden Cleanup", description: "Fallen foliage rake, dry branch clearing, and terrace garden wash.", basePrice: 349 },
    ],
  },
  {
    id: "pest-control",
    name: "Pest Control",
    groupId: 2,
    groupName: "Cleaning & Household Services",
    icon: "Bug",
    description: "Cockroach control, termite treatment, mosquito control, ant treatment, rodent control.",
    sortOrder: 10,
    services: [
      { id: "pest-cockroach", name: "Cockroach Control", description: "Odorless herbal gel baiting in kitchen cabinets and drainage points.", basePrice: 699 },
      { id: "pest-termite", name: "Termite Treatment", description: "Drill-fill-seal chemical barrier along walls, doors, and timber.", basePrice: 1499 },
      { id: "pest-mosquito", name: "Mosquito Control", description: "Cold-fogging and larvicide misting for yards, basements, and indoors.", basePrice: 599 },
      { id: "pest-ant", name: "Ant Treatment", description: "Targeted syrup and powder application for black/red ant colonies.", basePrice: 449 },
      { id: "pest-rodent", name: "Rodent Control", description: "Snap traps, glue boards, and entry-point mesh seal against rats.", basePrice: 549 },
    ],
  },

  // -------------------------------------------------------------
  // Group 3: ❄️ Appliances & Home Installation
  // -------------------------------------------------------------
  {
    id: "ac-services",
    name: "AC Services",
    groupId: 3,
    groupName: "Appliances & Home Installation",
    icon: "AirVent",
    description: "AC servicing, filter cleaning, AC installation, cooling troubleshooting, AC removal and relocation.",
    sortOrder: 11,
    services: [
      { id: "ac-servicing", name: "AC Servicing", description: "High-pressure jet wash of cooling coils, outdoor unit, and blower.", basePrice: 599 },
      { id: "ac-filter-cleaning", name: "Filter Cleaning", description: "Electrostatic mesh foam wash and air vent antimicrobial wipe.", basePrice: 249 },
      { id: "ac-installation", name: "AC Installation", description: "Indoor unit bracket mounting, copper pipe flare, and vacuum testing.", basePrice: 1199 },
      { id: "ac-cooling-troubleshoot", name: "Cooling Troubleshooting", description: "Gas level measurement, capacitor test, and compressor diagnosis.", basePrice: 449 },
      { id: "ac-removal-relocation", name: "AC Removal and Relocation", description: "Safe refrigerant pump-down, dismounting, and transit bracket packaging.", basePrice: 799 },
    ],
  },
  {
    id: "washing-machine-repair",
    name: "Washing Machine Repair",
    groupId: 3,
    groupName: "Appliances & Home Installation",
    icon: "ShieldCheck",
    description: "Drainage repair, spin-cycle repair, installation, inlet pipe replacement, general servicing.",
    sortOrder: 12,
    services: [
      { id: "wm-drainage-repair", name: "Drainage Repair", description: "Drain pump lint unclogging, valve solenoid replacement, hose fix.", basePrice: 399 },
      { id: "wm-spin-cycle-repair", name: "Spin-Cycle Repair", description: "Drum bearing check, motor belt tensioning, and suspension strut fix.", basePrice: 499 },
      { id: "wm-installation", name: "Washing Machine Installation", description: "Inlet tap connector, drain pipe slope alignment, and vibration pads.", basePrice: 349 },
      { id: "wm-inlet-pipe-replace", name: "Inlet Pipe Replacement", description: "Braided hose fitting with auto-shutoff brass adaptor.", basePrice: 249 },
      { id: "wm-general-servicing", name: "General Servicing", description: "Descaling wash, filter clean, door gasket fungal check, leveling.", basePrice: 449 },
    ],
  },
  {
    id: "refrigerator-repair",
    name: "Refrigerator Repair",
    groupId: 3,
    groupName: "Appliances & Home Installation",
    icon: "AirVent",
    description: "Cooling diagnosis, thermostat repair, water leakage repair, door seal replacement, general servicing.",
    sortOrder: 13,
    services: [
      { id: "fridge-cooling-diagnosis", name: "Cooling Diagnosis", description: "Evaporator fan inspection, gas leak test, and relay capacitor check.", basePrice: 449 },
      { id: "fridge-thermostat-repair", name: "Thermostat Repair", description: "Temperature sensor calibration and defrost timer replacement.", basePrice: 499 },
      { id: "fridge-water-leakage", name: "Water Leakage Repair", description: "Defrost drain trough unclogging and drip pan realignment.", basePrice: 349 },
      { id: "fridge-door-seal-replace", name: "Door Seal Replacement", description: "Magnetic gasket installation to stop cooling loss and frost buildup.", basePrice: 399 },
      { id: "fridge-general-servicing", name: "General Servicing", description: "Condenser coil vacuum, refrigerant check, and internal sanitize.", basePrice: 499 },
    ],
  },
  {
    id: "kitchen-appliance-repair",
    name: "Kitchen Appliance Repair",
    groupId: 3,
    groupName: "Appliances & Home Installation",
    icon: "Zap",
    description: "Microwave repair, induction stove repair, chimney servicing, dishwasher repair, mixer grinder repair.",
    sortOrder: 14,
    services: [
      { id: "kit-microwave-repair", name: "Microwave Repair", description: "Magnetron testing, turntable coupler fix, door safety switch repair.", basePrice: 449 },
      { id: "kit-induction-repair", name: "Induction Stove Repair", description: "IGBT circuit repair, glass top crack inspection, fan cleaning.", basePrice: 399 },
      { id: "kit-chimney-servicing", name: "Chimney Servicing", description: "Baffle filter degreasing, motor carbon cleaning, exhaust duct test.", basePrice: 599 },
      { id: "kit-dishwasher-repair", name: "Dishwasher Repair", description: "Spray arm unclogging, water valve repair, detergent dispenser fix.", basePrice: 549 },
      { id: "kit-mixer-grinder-repair", name: "Mixer Grinder Repair", description: "Coupler replacement, blade sharpening, carbon brush install.", basePrice: 249 },
    ],
  },
  {
    id: "home-installation",
    name: "Home Installation",
    groupId: 3,
    groupName: "Appliances & Home Installation",
    icon: "Tv",
    description: "TV wall mounting, curtain rod installation, wall shelf mounting, furniture assembly, picture frame mounting.",
    sortOrder: 15,
    services: [
      { id: "inst-tv-wall-mounting", name: "TV Wall Mounting", description: "Solid wall or plywood mount bracket setup with spirit level accuracy.", basePrice: 399 },
      { id: "inst-curtain-rod", name: "Curtain Rod Installation", description: "Drill bracket mounting, finial fitting, and rod alignment.", basePrice: 249 },
      { id: "inst-wall-shelf-mounting", name: "Wall Shelf Mounting", description: "Anchor bolt drilling for floating bookshelves and ledges.", basePrice: 299 },
      { id: "inst-furniture-assembly", name: "Furniture Assembly", description: "Wardrobes, study tables, shoe cabinets, and modular units.", basePrice: 499 },
      { id: "inst-picture-frame", name: "Picture Frame Mounting", description: "Wall collage, mirror hanging, and wall art secure fixing.", basePrice: 199 },
    ],
  },

  // -------------------------------------------------------------
  // Group 4: 🚗 Vehicle & Transport Services
  // -------------------------------------------------------------
  {
    id: "bike-repair",
    name: "Bike Repair",
    groupId: 4,
    groupName: "Vehicle & Transport Services",
    icon: "Bike",
    description: "Bike servicing, brake repair, chain adjustment, battery replacement, puncture repair.",
    sortOrder: 16,
    services: [
      { id: "bike-servicing", name: "Bike Servicing", description: "Engine oil change, air filter cleaning, spark plug check, wash.", basePrice: 399 },
      { id: "bike-brake-repair", name: "Brake Repair", description: "Disc brake bleed, brake shoe replacement, and lever adjustment.", basePrice: 249 },
      { id: "bike-chain-adjustment", name: "Chain Adjustment", description: "Sprocket lubrication, chain slack tightening, and wash.", basePrice: 199 },
      { id: "bike-battery-replace", name: "Battery Replacement", description: "Terminal cleaning, voltage check, and new battery installation.", basePrice: 249 },
      { id: "bike-puncture-repair", name: "Puncture Repair", description: "Tubeless tyre puncture plug, valve replacement, pressure check.", basePrice: 149 },
    ],
  },
  {
    id: "car-repair",
    name: "Car Repair",
    groupId: 4,
    groupName: "Vehicle & Transport Services",
    icon: "Car",
    description: "General servicing, brake inspection, battery replacement, engine diagnostics, minor mechanical repairs.",
    sortOrder: 17,
    services: [
      { id: "car-general-servicing", name: "General Servicing", description: "Synthetic engine oil topup, filter check, coolant, 30-point check.", basePrice: 999 },
      { id: "car-brake-inspection", name: "Brake Inspection", description: "Brake pad thickness, rotor disc skimming, and brake fluid topup.", basePrice: 499 },
      { id: "car-battery-replace", name: "Battery Replacement", description: "Doorstep battery health diagnostic, terminal grease, install.", basePrice: 349 },
      { id: "car-engine-diagnostics", name: "Engine Diagnostics", description: "OBD-II scanner fault code analysis, sensor diagnosis, reset.", basePrice: 499 },
      { id: "car-minor-mechanical", name: "Minor Mechanical Repairs", description: "Wiper motor repair, horn fix, belt squeak adjustment, door latch.", basePrice: 399 },
    ],
  },
  {
    id: "car-wash-detailing",
    name: "Car Wash & Detailing",
    groupId: 4,
    groupName: "Vehicle & Transport Services",
    icon: "Sparkles",
    description: "Exterior wash, interior vacuuming, seat cleaning, polishing, headlight restoration.",
    sortOrder: 18,
    services: [
      { id: "det-exterior-wash", name: "Exterior Wash", description: "Foam cannon shampoo wash, underbody rinse, microfiber hand dry.", basePrice: 399 },
      { id: "det-interior-vacuuming", name: "Interior Vacuuming", description: "Footwell, dashboard, AC vent blower cleaning, boot vacuum.", basePrice: 299 },
      { id: "det-seat-cleaning", name: "Seat Cleaning", description: "Fabric shampoo extraction or leather conditioning coat.", basePrice: 599 },
      { id: "det-polishing", name: "Polishing", description: "Machine wax polish, swirl reduction, hydrophobic gloss coat.", basePrice: 899 },
      { id: "det-headlight-restore", name: "Headlight Restoration", description: "Oxidation wet sanding, compounding, and UV protective clear seal.", basePrice: 449 },
    ],
  },
  {
    id: "roadside-assistance",
    name: "Roadside Assistance",
    groupId: 4,
    groupName: "Vehicle & Transport Services",
    icon: "AlertTriangle",
    description: "Flat tyre assistance, jump-start assistance, fuel delivery, breakdown support, towing coordination.",
    sortOrder: 19,
    services: [
      { id: "rsa-flat-tyre", name: "Flat Tyre Assistance", description: "On-site stepney wheel replacement and tyre inflator fill.", basePrice: 299 },
      { id: "rsa-jump-start", name: "Jump-Start Assistance", description: "Heavy-duty jumper cable booster start for dead car/bike battery.", basePrice: 349 },
      { id: "rsa-fuel-delivery", name: "Fuel Delivery", description: "Emergency 3-5 litres petrol/diesel doorstep or highway delivery.", basePrice: 249 },
      { id: "rsa-breakdown-support", name: "Breakdown Support", description: "On-spot mechanical inspection for clutch/coolant/starter fault.", basePrice: 449 },
      { id: "rsa-towing-coord", name: "Towing Coordination", description: "Flatbed or wheel-lift tow truck dispatch to nearest garage.", basePrice: 999 },
    ],
  },
  {
    id: "packers-movers",
    name: "Packers & Movers",
    groupId: 4,
    groupName: "Vehicle & Transport Services",
    icon: "Truck",
    description: "Home shifting, office relocation, furniture moving, packing and unpacking, local goods transport.",
    sortOrder: 20,
    services: [
      { id: "pack-home-shifting", name: "Home Shifting", description: "Full 1BHK/2BHK/3BHK bubble wrap, loading, transport, unloading.", basePrice: 2499 },
      { id: "pack-office-relocation", name: "Office Relocation", description: "Workstation dismounting, electronics crate packing, and transport.", basePrice: 3499 },
      { id: "pack-furniture-moving", name: "Furniture Moving", description: "Single-item bed, sofa, or dining table safe intercity/local shift.", basePrice: 699 },
      { id: "pack-packing-unpacking", name: "Packing and Unpacking", description: "Carton box supply, fragile bubble cushioning, and unpacking at site.", basePrice: 899 },
      { id: "pack-local-transport", name: "Local Goods Transport", description: "Mini truck (Tata Ace/Pickup) dedicated booking with verified driver.", basePrice: 799 },
    ],
  },

  // -------------------------------------------------------------
  // Group 5: 💻 Technology & Digital Services
  // -------------------------------------------------------------
  {
    id: "computer-laptop-repair",
    name: "Computer & Laptop Repair",
    groupId: 5,
    groupName: "Technology & Digital Services",
    icon: "Laptop",
    description: "OS installation, laptop troubleshooting, hardware diagnosis, software installation, computer cleanup.",
    sortOrder: 21,
    services: [
      { id: "comp-os-install", name: "OS Installation", description: "Windows 11 / Linux / macOS clean setup with latest driver updates.", basePrice: 499 },
      { id: "comp-laptop-troubleshoot", name: "Laptop Troubleshooting", description: "Overheating thermal paste, blue screen (BSOD) fix, battery check.", basePrice: 449 },
      { id: "comp-hardware-diagnosis", name: "Hardware Diagnosis", description: "RAM upgrade, NVMe SSD speedup, motherboard chip-level testing.", basePrice: 399 },
      { id: "comp-software-install", name: "Software Installation", description: "Antivirus, MS Office, CAD/dev tools, and license activations.", basePrice: 299 },
      { id: "comp-cleanup", name: "Computer Cleanup", description: "Malware removal, junk temp clearing, and boot speed optimization.", basePrice: 349 },
    ],
  },
  {
    id: "mobile-repair",
    name: "Mobile Repair",
    groupId: 5,
    groupName: "Technology & Digital Services",
    icon: "Smartphone",
    description: "Screen replacement, battery replacement, charging port repair, speaker repair, software troubleshooting.",
    sortOrder: 22,
    services: [
      { id: "mob-screen-replace", name: "Screen Replacement", description: "Original quality OLED/LCD display fitting with touch warranty.", basePrice: 899 },
      { id: "mob-battery-replace", name: "Battery Replacement", description: "Doorstep high-capacity battery swap with cycle health reset.", basePrice: 499 },
      { id: "mob-charging-port", name: "Charging Port Repair", description: "Type-C / Lightning port cleaning or PCB flex replacement.", basePrice: 349 },
      { id: "mob-speaker-repair", name: "Speaker Repair", description: "Ear-piece mesh de-dusting, ringer speaker swap, microphone fix.", basePrice: 349 },
      { id: "mob-software-troubleshoot", name: "Software Troubleshooting", description: "Bootloop unbrick, FRP unlock, firmware re-flash, backup restore.", basePrice: 399 },
    ],
  },
  {
    id: "wifi-networking",
    name: "Wi-Fi & Networking",
    groupId: 5,
    groupName: "Technology & Digital Services",
    icon: "Wifi",
    description: "Router installation, Wi-Fi troubleshooting, LAN cabling, network configuration, Wi-Fi extender setup.",
    sortOrder: 23,
    services: [
      { id: "net-router-install", name: "Router Installation", description: "Dual-band Wi-Fi 6 router configuration, SSID, and security setup.", basePrice: 349 },
      { id: "net-wifi-troubleshoot", name: "Wi-Fi Troubleshooting", description: "Dead zone diagnosis, channel interference adjustment, drop fix.", basePrice: 299 },
      { id: "net-lan-cabling", name: "LAN Cabling", description: "CAT6 cable routing, RJ45 crimping, wall faceplate termination.", basePrice: 449 },
      { id: "net-configuration", name: "Network Configuration", description: "Static IP, port forwarding, guest network, and QoS priority.", basePrice: 399 },
      { id: "net-extender-setup", name: "Wi-Fi Extender Setup", description: "Mesh node pairing, repeater placement, and seamless roaming test.", basePrice: 299 },
    ],
  },
  {
    id: "cctv-security-systems",
    name: "CCTV & Security Systems",
    groupId: 5,
    groupName: "Technology & Digital Services",
    icon: "Camera",
    description: "CCTV installation, camera troubleshooting, DVR/NVR setup, video doorbell installation, camera maintenance.",
    sortOrder: 24,
    services: [
      { id: "cctv-installation", name: "CCTV Installation", description: "Dome & bullet camera drill mounting, power supply, and BNC/RJ45 wiring.", basePrice: 599 },
      { id: "cctv-troubleshoot", name: "Camera Troubleshooting", description: "No video signal fix, infrared night vision test, loose wire check.", basePrice: 399 },
      { id: "cctv-dvr-nvr-setup", name: "DVR/NVR Setup", description: "Hard drive surveillance format, remote phone app live-view sync.", basePrice: 499 },
      { id: "cctv-video-doorbell", name: "Video Doorbell Installation", description: "Chime wiring, two-way audio setup, motion sensor zone config.", basePrice: 449 },
      { id: "cctv-maintenance", name: "Camera Maintenance", description: "Lens cleaning, water ingress check, angle adjust, firmware update.", basePrice: 349 },
    ],
  },
  {
    id: "website-digital-services",
    name: "Website & Digital Services",
    groupId: 5,
    groupName: "Technology & Digital Services",
    icon: "Globe",
    description: "Business website creation, landing pages, website maintenance, domain and hosting setup, website speed optimization.",
    sortOrder: 25,
    services: [
      { id: "web-business-site", name: "Business Website Creation", description: "Modern responsive 5-page company website with contact form.", basePrice: 4999 },
      { id: "web-landing-pages", name: "Landing Pages", description: "High-converting marketing lead page with CTA and analytics integration.", basePrice: 1999 },
      { id: "web-maintenance", name: "Website Maintenance", description: "Content updates, plugin security patches, and monthly backups.", basePrice: 999 },
      { id: "web-domain-hosting", name: "Domain & Hosting Setup", description: "DNS record configuration, SSL cert install, professional mail setup.", basePrice: 499 },
      { id: "web-speed-opt", name: "Website Speed Optimization", description: "Image WebP compression, caching config, Core Web Vitals audit.", basePrice: 899 },
    ],
  },

  // -------------------------------------------------------------
  // Group 6: 👨🍳 Personal & Daily-Life Services
  // -------------------------------------------------------------
  {
    id: "barber-services",
    name: "Barber Services",
    groupId: 6,
    groupName: "Personal & Daily-Life Services",
    icon: "Scissors",
    description: "Haircut, beard trimming, hair styling, head shave, home haircut service.",
    sortOrder: 26,
    services: [
      { id: "barber-haircut", name: "Haircut", description: "Gentlemen & boys precision haircut with scissors/clipper and neck shave.", basePrice: 199 },
      { id: "barber-beard-trim", name: "Beard Trimming", description: "Beard shaping, razor line edge cleanup, and beard oil massage.", basePrice: 149 },
      { id: "barber-hair-styling", name: "Hair Styling", description: "Blow-dry styling, matte wax/gel finish, and scalp refresh.", basePrice: 149 },
      { id: "barber-head-shave", name: "Head Shave", description: "Smooth traditional clean shave with warm foam and soothing lotion.", basePrice: 199 },
      { id: "barber-home-service", name: "Home Haircut Service", description: "Full sanitised salon kit brought to your doorstep for utmost comfort.", basePrice: 299 },
    ],
  },
  {
    id: "beauty-salon",
    name: "Beauty & Salon",
    groupId: 6,
    groupName: "Personal & Daily-Life Services",
    icon: "Smile",
    description: "Facial, waxing, threading, manicure, pedicure.",
    sortOrder: 27,
    services: [
      { id: "beauty-facial", name: "Facial", description: "Herbal/Fruit/Gold glow facial with exfoliation and face pack.", basePrice: 699 },
      { id: "beauty-waxing", name: "Waxing", description: "Rica / Honey waxing for arms, legs, and underarms with pre-post care.", basePrice: 399 },
      { id: "beauty-threading", name: "Threading", description: "Eyebrow shaping, upper lip, forehead, and chin threading.", basePrice: 99 },
      { id: "beauty-manicure", name: "Manicure", description: "Nail shaping, cuticle trimming, gentle scrub, and nail color finish.", basePrice: 349 },
      { id: "beauty-pedicure", name: "Pedicure", description: "Soothing foot soak, heel dead skin removal, massage, and polish.", basePrice: 449 },
    ],
  },
  {
    id: "home-cooking",
    name: "Home Cooking",
    groupId: 6,
    groupName: "Personal & Daily-Life Services",
    icon: "ChefHat",
    description: "Daily meal preparation, vegetarian cooking, non-vegetarian cooking, party cooking, meal preparation for the week.",
    sortOrder: 28,
    services: [
      { id: "cook-daily-meal", name: "Daily Meal Preparation", description: "Fresh homestyle breakfast, lunch, or dinner cooking in your kitchen.", basePrice: 399 },
      { id: "cook-vegetarian", name: "Vegetarian Cooking", description: "Authentic regional curries, dal, sambar, rasam, and fresh rotis.", basePrice: 349 },
      { id: "cook-non-veg", name: "Non-Vegetarian Cooking", description: "Biryani, chicken/mutton curries, fish fry with custom spice levels.", basePrice: 499 },
      { id: "cook-party-cooking", name: "Party Cooking", description: "Special gathering menu cooking for up to 15-20 guests at home.", basePrice: 1199 },
      { id: "cook-weekly-prep", name: "Meal Preparation for the Week", description: "Batch cooking, gravy bases, chopped staples, and freezer portions.", basePrice: 699 },
    ],
  },
  {
    id: "home-tuition",
    name: "Home Tuition",
    groupId: 6,
    groupName: "Personal & Daily-Life Services",
    icon: "GraduationCap",
    description: "School subject tuition, mathematics tutoring, science tutoring, English tutoring, computer basics tutoring.",
    sortOrder: 29,
    services: [
      { id: "tuit-school-subject", name: "School Subject Tuition", description: "Class 1-10 all CBSE/ICSE/State syllabus homework & concept help.", basePrice: 399 },
      { id: "tuit-maths", name: "Mathematics Tutoring", description: "Algebra, geometry, trigonometry step-by-step problem practice.", basePrice: 449 },
      { id: "tuit-science", name: "Science Tutoring", description: "Physics, Chemistry, Biology lab concepts and exam coaching.", basePrice: 449 },
      { id: "tuit-english", name: "English Tutoring", description: "Grammar, reading comprehension, writing skills, and spoken fluency.", basePrice: 349 },
      { id: "tuit-computer-basics", name: "Computer Basics Tutoring", description: "Typing, MS Office, safe web browsing, and foundational coding.", basePrice: 399 },
    ],
  },
  {
    id: "photography-videography",
    name: "Photography & Videography",
    groupId: 6,
    groupName: "Personal & Daily-Life Services",
    icon: "Film",
    description: "Birthday photography, event photography, product photography, video shooting, photo editing.",
    sortOrder: 30,
    services: [
      { id: "photo-birthday", name: "Birthday Photography", description: "Candid portraits, cake cutting coverage, and high-res digital album.", basePrice: 1999 },
      { id: "photo-event", name: "Event Photography", description: "Engagements, anniversaries, corporate ceremonies with pro lighting.", basePrice: 2999 },
      { id: "photo-product", name: "Product Photography", description: "E-commerce studio tabletop catalog shots on pure white background.", basePrice: 999 },
      { id: "photo-video-shooting", name: "Video Shooting", description: "4K cinematic footage, gimbal stabilization, and crisp audio capture.", basePrice: 2499 },
      { id: "photo-editing", name: "Photo Editing", description: "Color grading, blemish touchup, background removal, and retouching.", basePrice: 499 },
    ],
  },

  // -------------------------------------------------------------
  // Group 7: 🏢 Business & Professional Services
  // -------------------------------------------------------------
  {
    id: "graphic-design",
    name: "Graphic Design",
    groupId: 7,
    groupName: "Business & Professional Services",
    icon: "Palette",
    description: "Logo design, poster design, visiting cards, brochures, social media creatives.",
    sortOrder: 31,
    services: [
      { id: "des-logo", name: "Logo Design", description: "Custom vector brand mark with typography and color guide.", basePrice: 1199 },
      { id: "des-poster", name: "Poster Design", description: "Promotional event posters and marketing display graphics.", basePrice: 499 },
      { id: "des-visiting-cards", name: "Visiting Cards", description: "Double-sided modern business card design ready for print.", basePrice: 349 },
      { id: "des-brochures", name: "Brochures", description: "Bi-fold or tri-fold company profile leaflet design.", basePrice: 799 },
      { id: "des-social-creatives", name: "Social Media Creatives", description: "Pack of 5 Instagram & Facebook posts with Canva/PSD assets.", basePrice: 699 },
    ],
  },
  {
    id: "digital-marketing",
    name: "Digital Marketing",
    groupId: 7,
    groupName: "Business & Professional Services",
    icon: "TrendingUp",
    description: "Social media management, SEO, Google Business Profile setup, ad campaign setup, content planning.",
    sortOrder: 32,
    services: [
      { id: "mkt-social-media", name: "Social Media Management", description: "Weekly calendar, reels planning, hashtag strategy, engagement.", basePrice: 2499 },
      { id: "mkt-seo", name: "SEO Optimization", description: "On-page meta tags, keyword analysis, and Google Search Console audit.", basePrice: 1999 },
      { id: "mkt-google-business", name: "Google Business Profile Setup", description: "Local verification, location pin, hours, and photos optimization.", basePrice: 499 },
      { id: "mkt-ad-campaign", name: "Ad Campaign Setup", description: "Meta (Instagram/FB) or Google Search PPC ad target setup.", basePrice: 1299 },
      { id: "mkt-content-planning", name: "Content Planning", description: "30-day editorial content blueprint with copywriting hooks.", basePrice: 899 },
    ],
  },
  {
    id: "accounting-bookkeeping",
    name: "Accounting & Bookkeeping",
    groupId: 7,
    groupName: "Business & Professional Services",
    icon: "Calculator",
    description: "Bookkeeping, invoice preparation, expense tracking, bank reconciliation, financial record organization.",
    sortOrder: 33,
    services: [
      { id: "acc-bookkeeping", name: "Bookkeeping", description: "Tally / QuickBooks ledger entry and monthly journal maintenance.", basePrice: 1199 },
      { id: "acc-invoice-prep", name: "Invoice Preparation", description: "Professional GST invoice templates and billing generation.", basePrice: 399 },
      { id: "acc-expense-tracking", name: "Expense Tracking", description: "Receipt digitization, categorized expense sheets, cashflow reports.", basePrice: 699 },
      { id: "acc-bank-reconciliation", name: "Bank Reconciliation", description: "Matching bank statements with accounting entries and clearance check.", basePrice: 799 },
      { id: "acc-financial-records", name: "Financial Record Organization", description: "End-of-year tax document consolidation and balance sheet prep.", basePrice: 1499 },
    ],
  },
  {
    id: "office-assistance",
    name: "Office Assistance",
    groupId: 7,
    groupName: "Business & Professional Services",
    icon: "FileSpreadsheet",
    description: "Data entry, document formatting, spreadsheet preparation, printing and scanning, virtual administrative assistance.",
    sortOrder: 34,
    services: [
      { id: "off-data-entry", name: "Data Entry", description: "Accurate form typing, ERP data input, and CRM record updates.", basePrice: 349 },
      { id: "off-document-format", name: "Document Formatting", description: "Word/PDF header-footer cleanup, styling, and table of contents.", basePrice: 299 },
      { id: "off-spreadsheet-prep", name: "Spreadsheet Preparation", description: "Excel formula (VLOOKUP/XLOOKUP), pivot tables, and dashboard charts.", basePrice: 499 },
      { id: "off-printing-scanning", name: "Printing & Scanning", description: "Bulk document digitization, OCR indexing, and secure spiral bind.", basePrice: 249 },
      { id: "off-virtual-assistant", name: "Virtual Administrative Assistance", description: "Email inbox management, appointment calendar scheduling, reminders.", basePrice: 799 },
    ],
  },
  {
    id: "career-resume-services",
    name: "Career & Resume Services",
    groupId: 7,
    groupName: "Business & Professional Services",
    icon: "FileText",
    description: "Resume creation, CV formatting, LinkedIn profile optimization, interview preparation, portfolio creation.",
    sortOrder: 35,
    services: [
      { id: "car-resume-creation", name: "Resume Creation", description: "ATS-optimized single/two page professional resume writing.", basePrice: 699 },
      { id: "car-cv-formatting", name: "CV Formatting", description: "Academic & executive CV restructuring with clean typography.", basePrice: 449 },
      { id: "car-linkedin-opt", name: "LinkedIn Profile Optimization", description: "Catchy headline, summary bio, experience bullet points rewrite.", basePrice: 599 },
      { id: "car-interview-prep", name: "Interview Preparation", description: "1-on-1 mock behavioral interview with personalized feedback.", basePrice: 899 },
      { id: "car-portfolio-creation", name: "Portfolio Creation", description: "Digital showcase for designers, engineers, and creators.", basePrice: 999 },
    ],
  },

  // -------------------------------------------------------------
  // Group 8: 🏗️ Construction & Property Services
  // -------------------------------------------------------------
  {
    id: "tile-flooring",
    name: "Tile & Flooring",
    groupId: 8,
    groupName: "Construction & Property Services",
    icon: "Layers",
    description: "Floor tile installation, bathroom tile replacement, tile grouting, marble polishing, flooring repair.",
    sortOrder: 36,
    services: [
      { id: "tile-floor-install", name: "Floor Tile Installation", description: "Precision tile spacing, spirit leveling, adhesive bedding.", basePrice: 799 },
      { id: "tile-bathroom-replace", name: "Bathroom Tile Replacement", description: "Damaged wall tile removal, waterproof backing, and new tile fit.", basePrice: 599 },
      { id: "tile-grouting", name: "Tile Grouting", description: "Epoxy anti-stain grout application in kitchen and shower joints.", basePrice: 399 },
      { id: "tile-marble-polishing", name: "Marble Polishing", description: "Diamond pad hone grinding, silicating, and mirror shine buff.", basePrice: 1199 },
      { id: "tile-flooring-repair", name: "Flooring Repair", description: "Hollow tile fixing, chip repair, and border strip realignment.", basePrice: 449 },
    ],
  },
  {
    id: "waterproofing",
    name: "Waterproofing",
    groupId: 8,
    groupName: "Construction & Property Services",
    icon: "Droplets",
    description: "Terrace waterproofing, bathroom leak treatment, wall dampness treatment, roof crack sealing, balcony waterproofing.",
    sortOrder: 37,
    services: [
      { id: "wp-terrace", name: "Terrace Waterproofing", description: "Polymer membrane / elastomeric coating with UV reflective topcoat.", basePrice: 1499 },
      { id: "wp-bathroom-leak", name: "Bathroom Leak Treatment", description: "Non-destructive grouting injection to stop seepage into ceilings below.", basePrice: 799 },
      { id: "wp-wall-dampness", name: "Wall Dampness Treatment", description: "Anti-efflorescence chemical coat and moisture barrier treatment.", basePrice: 699 },
      { id: "wp-roof-crack", name: "Roof Crack Sealing", description: "V-groove polyurea crack filler and fiber mesh reinforcing.", basePrice: 599 },
      { id: "wp-balcony", name: "Balcony Waterproofing", description: "Slope realignment, tile barrier seal, and rainwater drain waterproofing.", basePrice: 649 },
    ],
  },
  {
    id: "welding-metalwork",
    name: "Welding & Metalwork",
    groupId: 8,
    groupName: "Construction & Property Services",
    icon: "Flame",
    description: "Gate fabrication, grill repair, railing installation, metal frame fabrication, welding repairs.",
    sortOrder: 38,
    services: [
      { id: "weld-gate-fab", name: "Gate Fabrication", description: "Custom MS/SS sliding and swing main entrance gate welding.", basePrice: 1899 },
      { id: "weld-grill-repair", name: "Grill Repair", description: "Window safety grill welding, hinge re-attachment, and rust grinding.", basePrice: 399 },
      { id: "weld-railing-install", name: "Railing Installation", description: "Staircase and balcony stainless steel or iron railing fitting.", basePrice: 999 },
      { id: "weld-metal-frame", name: "Metal Frame Fabrication", description: "Shed trusses, air cooler stands, and heavy storage rack frames.", basePrice: 799 },
      { id: "weld-repairs", name: "Welding Repairs", description: "On-site electric arc welding for broken hinges, brackets, and furniture.", basePrice: 349 },
    ],
  },
  {
    id: "glass-aluminium-works",
    name: "Glass & Aluminium Works",
    groupId: 8,
    groupName: "Construction & Property Services",
    icon: "Maximize",
    description: "Glass door installation, window repair, aluminium frame fabrication, shower partition installation, mirror fitting.",
    sortOrder: 39,
    services: [
      { id: "glass-door-install", name: "Glass Door Installation", description: "Toughened glass door with floor spring, patch fittings, and lock.", basePrice: 1299 },
      { id: "glass-window-repair", name: "Window Repair", description: "Sliding aluminium window roller wheel, lock latch, and track fix.", basePrice: 399 },
      { id: "glass-aluminium-frame", name: "Aluminium Frame Fabrication", description: "Powder-coated aluminium partition and office cubicle framing.", basePrice: 999 },
      { id: "glass-shower-partition", name: "Shower Partition Installation", description: "Frameless 8mm glass screen with silicone water guard strip.", basePrice: 899 },
      { id: "glass-mirror-fitting", name: "Mirror Fitting", description: "Beveled edge bathroom and dressing mirror anchor bracket mounting.", basePrice: 299 },
    ],
  },
  {
    id: "interior-design",
    name: "Interior Design",
    groupId: 8,
    groupName: "Construction & Property Services",
    icon: "Layout",
    description: "Room layout planning, modular kitchen design, wardrobe planning, false ceiling design, furniture layout consultation.",
    sortOrder: 40,
    services: [
      { id: "int-room-layout", name: "Room Layout Planning", description: "2D spatial floor plan with ergonomic circulation and lighting map.", basePrice: 1499 },
      { id: "int-modular-kitchen", name: "Modular Kitchen Design", description: "L-shape, U-shape, parallel kitchen 3D elevation and hardware spec.", basePrice: 2499 },
      { id: "int-wardrobe-planning", name: "Wardrobe Planning", description: "Floor-to-ceiling sliding/hinged wardrobe internal organizer plan.", basePrice: 1199 },
      { id: "int-false-ceiling", name: "False Ceiling Design", description: "Gypsum & POP cove lighting designer ceiling layout.", basePrice: 999 },
      { id: "int-furniture-layout", name: "Furniture Layout Consultation", description: "On-site walk-through for furniture scale, color, and finish choices.", basePrice: 899 },
    ],
  },

  // -------------------------------------------------------------
  // Group 9: 👨👩👧 Family, Events & Lifestyle
  // -------------------------------------------------------------
  {
    id: "elderly-assistance",
    name: "Elderly Assistance",
    groupId: 9,
    groupName: "Family, Events & Lifestyle",
    icon: "Heart",
    description: "Companionship, grocery assistance, appointment accompaniment, daily routine assistance, non-medical home support.",
    sortOrder: 41,
    services: [
      { id: "eld-companionship", name: "Companionship", description: "Friendly home visit, reading, conversation, and mental engagement.", basePrice: 299 },
      { id: "eld-grocery-assist", name: "Grocery Assistance", description: "Assisting senior citizens with local shopping and carrying essentials.", basePrice: 249 },
      { id: "eld-appointment-acc", name: "Appointment Accompaniment", description: "Escorting to clinic, hospital, or bank with attentive care.", basePrice: 449 },
      { id: "eld-daily-routine", name: "Daily Routine Assistance", description: "Help with evening walking, mobility support, and routine check.", basePrice: 349 },
      { id: "eld-non-medical", name: "Non-Medical Home Support", description: "Assisting with phone apps, bill payment, and household coordination.", basePrice: 299 },
    ],
  },
  {
    id: "babysitting-childcare",
    name: "Babysitting & Childcare",
    groupId: 9,
    groupName: "Family, Events & Lifestyle",
    icon: "Baby",
    description: "Hourly babysitting, after-school supervision, playtime supervision, homework supervision, occasional childcare.",
    sortOrder: 42,
    services: [
      { id: "baby-hourly", name: "Hourly Babysitting", description: "Attentive verified child supervision in the comfort of your home.", basePrice: 249 },
      { id: "baby-after-school", name: "After-School Supervision", description: "Greeting child from school bus, snack serving, and safe keeping.", basePrice: 299 },
      { id: "baby-playtime", name: "Playtime Supervision", description: "Engaging indoor board games, storytelling, and creative drawing.", basePrice: 249 },
      { id: "baby-homework", name: "Homework Supervision", description: "Ensuring school assignments and reading are completed diligently.", basePrice: 299 },
      { id: "baby-occasional", name: "Occasional Childcare", description: "Evening or weekend childcare when parents attend functions.", basePrice: 399 },
    ],
  },
  {
    id: "event-decoration",
    name: "Event Decoration",
    groupId: 9,
    groupName: "Family, Events & Lifestyle",
    icon: "PartyPopper",
    description: "Birthday decoration, balloon decoration, stage decoration, flower decoration, engagement decoration.",
    sortOrder: 43,
    services: [
      { id: "dec-birthday", name: "Birthday Decoration", description: "Theme backdrop banner, welcome board, and customized party setup.", basePrice: 1499 },
      { id: "dec-balloon", name: "Balloon Decoration", description: "Balloon arch, organic garland, foil number balloons, and pillars.", basePrice: 999 },
      { id: "dec-stage", name: "Stage Decoration", description: "Fabric drape backdrop, fairy light curtain, and center stage floral ring.", basePrice: 2999 },
      { id: "dec-flower", name: "Flower Decoration", description: "Fresh marigold, jasmine, or exotic rose & orchid floral arrangement.", basePrice: 1999 },
      { id: "dec-engagement", name: "Engagement Decoration", description: "Elegant couple ring ceremony backdrop with personalized signage.", basePrice: 3499 },
    ],
  },
  {
    id: "catering-services",
    name: "Catering Services",
    groupId: 9,
    groupName: "Family, Events & Lifestyle",
    icon: "Utensils",
    description: "Birthday catering, small-party catering, vegetarian catering, snack catering, buffet service staff.",
    sortOrder: 44,
    services: [
      { id: "cat-birthday", name: "Birthday Catering", description: "Kid-friendly party spread (pizzas, nuggets, noodles, dessert).", basePrice: 1999 },
      { id: "cat-small-party", name: "Small-Party Catering", description: "Curated 15-30 person lunch/dinner menu with chaffing dish setup.", basePrice: 2999 },
      { id: "cat-vegetarian", name: "Vegetarian Catering", description: "Traditional multi-course South Indian banana leaf / buffet feast.", basePrice: 2499 },
      { id: "cat-snack", name: "Snack Catering", description: "High-tea savories, samosas, cutlets, sweets, and fresh tea/coffee.", basePrice: 1499 },
      { id: "cat-buffet-staff", name: "Buffet Service Staff", description: "Trained, uniformed servers for replenishment and plate clearance.", basePrice: 799 },
    ],
  },
  {
    id: "pet-care",
    name: "Pet Care",
    groupId: 9,
    groupName: "Family, Events & Lifestyle",
    icon: "Dog",
    description: "Pet grooming, dog walking, pet sitting, pet bathing, pet transport coordination.",
    sortOrder: 45,
    services: [
      { id: "pet-grooming", name: "Pet Grooming", description: "Breed-specific haircut, nail clipping, ear cleaning, and brush-out.", basePrice: 699 },
      { id: "pet-dog-walking", name: "Dog Walking", description: "30-45 minute active outdoor walk and exercise for dogs.", basePrice: 199 },
      { id: "pet-sitting", name: "Pet Sitting", description: "Home pet care, timely feeding, play, and company while you travel.", basePrice: 399 },
      { id: "pet-bathing", name: "Pet Bathing", description: "Anti-tick medicated shampoo bath, blow dry, and coat perfume.", basePrice: 449 },
      { id: "pet-transport", name: "Pet Transport Coordination", description: "Pet-friendly cab escort to vet clinics or boarding facilities.", basePrice: 349 },
    ],
  },

  // -------------------------------------------------------------
  // Group 10: 🚚 Local, Utility & Specialised Services
  // -------------------------------------------------------------
  {
    id: "local-delivery-errands",
    name: "Local Delivery & Errands",
    groupId: 10,
    groupName: "Local, Utility & Specialised Services",
    icon: "Package",
    description: "Document delivery, parcel pickup, grocery pickup, medicine pickup, local item delivery.",
    sortOrder: 46,
    services: [
      { id: "del-document", name: "Document Delivery", description: "Urgent signed papers, bank documents, or passport photos delivered.", basePrice: 149 },
      { id: "del-parcel-pickup", name: "Parcel Pickup", description: "Pickup from courier hubs or shops and doorstep drop-off.", basePrice: 149 },
      { id: "del-grocery-pickup", name: "Grocery Pickup", description: "Purchasing and delivering items from your designated local grocery store.", basePrice: 199 },
      { id: "del-medicine-pickup", name: "Medicine Pickup", description: "Pharmacy prescription pickup with careful verification and cold pack.", basePrice: 149 },
      { id: "del-local-delivery", name: "Local Item Delivery", description: "Home-cooked food, gifts, or forgotten keys delivered across town.", basePrice: 149 },
    ],
  },
  {
    id: "water-purifier-services",
    name: "Water Purifier Services",
    groupId: 10,
    groupName: "Local, Utility & Specialised Services",
    icon: "Filter",
    description: "RO servicing, filter replacement, purifier installation, water leakage repair, routine maintenance.",
    sortOrder: 47,
    services: [
      { id: "ro-servicing", name: "RO Servicing", description: "Membrane flush, TDS check, booster pump pressure check, sanitization.", basePrice: 399 },
      { id: "ro-filter-replace", name: "Filter Replacement", description: "Sediment filter, activated carbon block, and post-carbon filter swap.", basePrice: 499 },
      { id: "ro-purifier-install", name: "Purifier Installation", description: "Wall mount plate drill, inlet diverter valve, and drain pipe setup.", basePrice: 349 },
      { id: "ro-leakage-repair", name: "Water Leakage Repair", description: "Push-fit elbow lock replacement, SMPS adapter repair, valve fix.", basePrice: 249 },
      { id: "ro-routine-maint", name: "Routine Maintenance", description: "Complete TDS/pH mineral test, sediment pre-filter clean, flush.", basePrice: 299 },
    ],
  },
  {
    id: "solar-energy-services",
    name: "Solar Energy Services",
    groupId: 10,
    groupName: "Local, Utility & Specialised Services",
    icon: "Sun",
    description: "Solar panel cleaning, installation coordination, inverter inspection, solar system maintenance, performance checks.",
    sortOrder: 48,
    services: [
      { id: "sol-panel-cleaning", name: "Solar Panel Cleaning", description: "De-ionized water wash and soft brush dust removal to restore wattage.", basePrice: 599 },
      { id: "sol-install-coord", name: "Installation Coordination", description: "Rooftop shadow analysis, frame angle, and net-metering liaison.", basePrice: 999 },
      { id: "sol-inverter-inspect", name: "Inverter Inspection", description: "Solar on-grid / hybrid inverter error codes, MC4 connector test.", basePrice: 499 },
      { id: "sol-system-maint", name: "Solar System Maintenance", description: "Earthing electrode check, junction box surge protector, cables.", basePrice: 699 },
      { id: "sol-performance-check", name: "Performance Checks", description: "Strings DC voltage measurement vs peak kilowatt generation audit.", basePrice: 449 },
    ],
  },
  {
    id: "locksmith-services",
    name: "Locksmith Services",
    groupId: 10,
    groupName: "Local, Utility & Specialised Services",
    icon: "Lock",
    description: "Lock replacement, door lock repair, new lock installation, key duplication, digital lock installation.",
    sortOrder: 49,
    services: [
      { id: "lock-replacement", name: "Lock Replacement", description: "Mortise cylinder, main door rim lock, or bedroom handle swap.", basePrice: 349 },
      { id: "lock-door-repair", name: "Door Lock Repair", description: "Jammed key extraction, strike plate realignment, and lubrication.", basePrice: 299 },
      { id: "lock-new-installation", name: "New Lock Installation", description: "Fresh wooden door hole mortising and lockset alignment.", basePrice: 449 },
      { id: "lock-key-duplication", name: "Key Duplication", description: "Doorstep laser cutting for brass, dimple, and computer keys.", basePrice: 199 },
      { id: "lock-digital-install", name: "Digital Lock Installation", description: "Biometric fingerprint / keypad smart lock door installation.", basePrice: 799 },
    ],
  },
  {
    id: "waste-management",
    name: "Waste Management",
    groupId: 10,
    groupName: "Local, Utility & Specialised Services",
    icon: "Trash2",
    description: "Household junk removal, furniture disposal coordination, garden waste removal, recyclable collection, post-event cleanup.",
    sortOrder: 50,
    services: [
      { id: "waste-junk-removal", name: "Household Junk Removal", description: "Attic, store room, and balcony uncluttering with eco-sorting.", basePrice: 499 },
      { id: "waste-furniture-disposal", name: "Furniture Disposal Coordination", description: "Broken mattress, dismantled almirah, old sofa transport to dump.", basePrice: 699 },
      { id: "waste-garden-removal", name: "Garden Waste Removal", description: "Heavy branches, pruned hedge bags, and dry tree trunk haul.", basePrice: 399 },
      { id: "waste-recyclable-collect", name: "Recyclable Collection", description: "Old newspapers, carton boxes, scrap metal doorstep pickup.", basePrice: 149 },
      { id: "waste-event-cleanup", name: "Post-Event Cleanup", description: "Function hall / home party waste bag collection and floor sweep.", basePrice: 899 },
    ],
  },
];

// Helper to look up a category with robust fuzzy and trade matching
export function getCategoryById(idOrName) {
  if (!idOrName) return SERVICE_CATEGORIES[0];
  const lower = idOrName.toLowerCase().trim();

  // 1. Exact match by id or name
  let found = SERVICE_CATEGORIES.find(
    (c) => c.id.toLowerCase() === lower || c.name.toLowerCase() === lower
  );
  if (found) return found;

  // 2. Trade mapping (e.g., worker trade "Plumber" -> "Plumbing", "Electrician" -> "Electrical Services")
  if (lower.includes("plumb")) return SERVICE_CATEGORIES.find((c) => c.name === "Plumbing") || SERVICE_CATEGORIES[0];
  if (lower.includes("electr")) return SERVICE_CATEGORIES.find((c) => c.name === "Electrical Services") || SERVICE_CATEGORIES[0];
  if (lower.includes("carpent")) return SERVICE_CATEGORIES.find((c) => c.name === "Carpentry") || SERVICE_CATEGORIES[0];
  if (lower.includes("paint")) return SERVICE_CATEGORIES.find((c) => c.name === "Painting Services") || SERVICE_CATEGORIES[0];
  if (lower.includes("clean")) return SERVICE_CATEGORIES.find((c) => c.name === "Home Cleaning") || SERVICE_CATEGORIES[0];
  if (lower.includes("ac ") || lower === "ac" || lower.includes("cool")) return SERVICE_CATEGORIES.find((c) => c.name === "AC Services") || SERVICE_CATEGORIES[0];
  if (lower.includes("appliance") || lower.includes("wash") || lower.includes("fridge")) return SERVICE_CATEGORIES.find((c) => c.name === "Washing Machine Repair") || SERVICE_CATEGORIES[0];
  if (lower.includes("bike") || lower.includes("mechanic")) return SERVICE_CATEGORIES.find((c) => c.name === "Bike Repair") || SERVICE_CATEGORIES[0];

  // 3. Substring match
  found = SERVICE_CATEGORIES.find((c) => {
    const cName = c.name.toLowerCase();
    const cId = c.id.toLowerCase();
    return cName.includes(lower) || lower.includes(cName) || cId.includes(lower) || lower.includes(cId);
  });
  if (found) return found;

  return SERVICE_CATEGORIES[0];
}

// Search across categories and their sub-services
export function searchCatalog(query) {
  if (!query || !query.trim()) return SERVICE_CATEGORIES;
  const q = query.toLowerCase().trim();

  return SERVICE_CATEGORIES.filter((cat) => {
    const catMatch =
      cat.name.toLowerCase().includes(q) ||
      cat.groupName.toLowerCase().includes(q) ||
      cat.description.toLowerCase().includes(q);
    const serviceMatch = cat.services.some(
      (s) =>
        s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q)
    );
    return catMatch || serviceMatch;
  });
}
