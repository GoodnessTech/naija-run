// Catalog of Authentic Nigerian Real-World Luxury Assets, Rides, Mansions & Regalia
// Real-world pricing reflecting actual Nigerian currency benchmarks (2024-2026 economy)

export const ITEM_CATEGORIES = {
  VEHICLE: 'VEHICLE',
  HOUSE: 'HOUSE',
  ACCESSORY: 'ACCESSORY'
};

export const SHOP_ITEMS = [
  // ==========================================
  // 1. VEHICLES & COMMUTE (The Transport Fleet)
  // ==========================================
  {
    id: 'okada_bike',
    name: 'Bajaj Boxer Okada',
    category: ITEM_CATEGORIES.VEHICLE,
    price: 1250000, // ₦1.25 Million
    image: '/assets/shop/okada_bike.jpg',
    tag: 'AGILE SPRINT',
    description: 'Rugged red Bajaj Boxer commercial motorcycle. Swift lane transitions and rapid acceleration to dodge dense traffic.',
    perkText: '+15% Base Sprint Speed & Faster Lane Dodging',
    perk: {
      speedBonus: 2.5,
      laneSpeedMultiplier: 1.35
    }
  },
  {
    id: 'keke_napep',
    name: 'Commercial Keke Napep',
    category: ITEM_CATEGORIES.VEHICLE,
    price: 3500000, // ₦3.5 Million (Real commercial market price)
    image: '/assets/shop/keke_napep.jpg',
    tag: 'CASH MAGNET',
    description: 'Lagos State commercial yellow 3-wheeler tricycle. Equipped with wide passenger cabin and a magnetic perimeter to scoop nearby Naira.',
    perkText: '+65% Naira Magnet Collection Radius',
    perk: {
      magnetBonus: 1.65
    }
  },
  {
    id: 'danfo_bus',
    name: 'Yellow Danfo Commuter Bus',
    category: ITEM_CATEGORIES.VEHICLE,
    price: 8500000, // ₦8.5 Million
    image: '/assets/shop/danfo_bus.jpg',
    tag: 'ARMORED IMPACT',
    description: 'Iconic yellow Lagos commuter bus (Oshodi - CMS - Lekki). Built like a tank, absorbing high-speed impacts without losing momentum.',
    perkText: '+1 Free Obstacle Shield (Absorbs 1 Stumble Cleanly)',
    perk: {
      shieldCount: 1
    }
  },
  {
    id: 'innoson_gwagon',
    name: 'Innoson IVM Armored SUV',
    category: ITEM_CATEGORIES.VEHICLE,
    price: 65000000, // ₦65 Million
    image: '/assets/shop/innoson_gwagon.jpg',
    tag: 'PRESIDENTIAL',
    description: 'Handcrafted Nigerian armored tactical luxury SUV. Commanding aura that repels evil forest spirits and forces pursuers to keep distance.',
    perkText: 'Royal Intimidation: Evil Spirits Start 5m Further Away (23m gap)',
    perk: {
      guardianStartDistanceBonus: 5.0
    }
  },

  // ==========================================
  // 2. REAL ESTATE & ESTATES (The Asset Portfolio)
  // ==========================================
  {
    id: 'surulere_flat',
    name: 'Surulere Modern Penthouse',
    category: ITEM_CATEGORIES.HOUSE,
    price: 45000000, // ₦45 Million
    image: '/assets/shop/surulere_flat.jpg',
    tag: 'STEADY YIELD',
    description: 'Upscale residential apartment on Lagos Mainland with smart inverter system and steady rental capital gains.',
    perkText: '+15% Permanent Score Boost on All Runs',
    perk: {
      scoreMultiplier: 1.15
    }
  },
  {
    id: 'lekki_duplex',
    name: 'Lekki Phase 1 Luxury Duplex',
    category: ITEM_CATEGORIES.HOUSE,
    price: 220000000, // ₦220 Million
    image: '/assets/shop/lekki_duplex.jpg',
    tag: 'ISLAND WEALTH',
    description: 'Contemporary white 5-bedroom duplex with private infinity pool and smart security perimeter in prime Lekki Phase 1.',
    perkText: '+30% High-Value Naira Multiplier on Every Pickup',
    perk: {
      cashBonusPercent: 0.30
    }
  },
  {
    id: 'banana_island',
    name: 'Banana Island Waterfront Palace',
    category: ITEM_CATEGORIES.HOUSE,
    price: 1500000000, // ₦1.5 Billion
    image: '/assets/shop/banana_island.jpg',
    tag: 'BILLIONAIRE EMPIRE',
    description: 'Magnificent billionaire private estate on the Banana Island waterfront with twin mega-yacht docks, helipad, and private lagoon jetty.',
    perkText: '+75% Extra Naira on All Pickups & 2x Career Score',
    perk: {
      cashBonusPercent: 0.75,
      scoreMultiplier: 1.50
    }
  },

  // ==========================================
  // 3. WEARABLE GEAR & REGALIA (The Vault)
  // ==========================================
  {
    id: 'golden_spikes',
    name: 'Super Eagles Carbon Spikes',
    category: ITEM_CATEGORIES.ACCESSORY,
    price: 350000, // ₦350,000
    image: '/assets/shop/golden_spikes.jpg',
    tag: 'HIGH JUMP',
    description: 'Pro-grade athletic sprint track shoes with gold leaf Nigerian eagle wings and rigid carbon fiber sprint plate.',
    perkText: '+25% Jump Clearance & Rapid Landing Recovery',
    perk: {
      jumpPowerBonus: 2.2
    }
  },
  {
    id: 'sango_shades',
    name: 'Sango Gold Aviators',
    category: ITEM_CATEGORIES.ACCESSORY,
    price: 480000, // ₦480,000
    image: '/assets/shop/sango_shades.jpg',
    tag: 'THUNDER VISION',
    description: 'Hand-forged gold frame sunglasses with fiery polarized bronze mirror lenses channeling the thunderous foresight of Sango.',
    perkText: 'Enhanced Reflex Window for Obstacles & Cash Tracking',
    perk: {
      thunderAura: true
    }
  },
  {
    id: 'coral_beads',
    name: 'Benin Royal Red Coral Beads',
    category: ITEM_CATEGORIES.ACCESSORY,
    price: 650000, // ₦650,000
    image: '/assets/shop/coral_beads.jpg',
    tag: 'ANCESTRAL WARD',
    description: 'Authentic royal cylindrical red coral necklace and royal wrist beads blessed by the guild of ancestral artisans.',
    perkText: 'Ancestral Ward: +1.5s Post-Stumble Invulnerability Window',
    perk: {
      recoveryInvulnBonus: 1.5
    }
  },
  {
    id: 'royal_agbada',
    name: 'Emerald Royal Silk Agbada',
    category: ITEM_CATEGORIES.ACCESSORY,
    price: 1200000, // ₦1.2 Million
    image: '/assets/shop/royal_agbada.jpg',
    tag: 'CHIEFTAINCY DRIP',
    description: 'Heavy emerald green silk Aso-Oke Agbada with intricate golden royal embroidery and matching ceremonial Fila cap.',
    perkText: '+20% Career Score Multiplier & Royal Status',
    perk: {
      scoreMultiplier: 1.20
    }
  }
];
