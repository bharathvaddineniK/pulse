export interface QuickSignal {
  id: string;
  category: string;
  icon: string;
  prompt: string;
  options: string[];
  responses: Record<string, string>; // Maps answer → smart summary
}

export const quickSignalsData: QuickSignal[] = [
  // 🛣️ Mobility & Outdoors
  {
    id: 'traffic_smooth',
    category: '🛣️ Mobility & Outdoors',
    icon: '🚗',
    prompt: 'Traffic smooth?',
    options: ['Smooth', 'Congested'],
    responses: {
      Smooth: 'Everyone reports smooth traffic right now.',
      Congested: 'Traffic seems a bit heavy around the area.',
    },
  },
  {
    id: 'road_work',
    category: '🛣️ Mobility & Outdoors',
    icon: '🚧',
    prompt: 'Any road work nearby?',
    options: ['Yes', 'No'],
    responses: {
      Yes: 'Road work spotted nearby — drive safe!',
      No: 'No ongoing road work in the area.',
    },
  },
  {
    id: 'parking_easy',
    category: '🛣️ Mobility & Outdoors',
    icon: '🅿️',
    prompt: 'Parking easy to find?',
    options: ['Easy', 'Tough'],
    responses: {
      Easy: 'Plenty of parking spots right now.',
      Tough: 'Parking’s tough around here at the moment.',
    },
  },
  {
    id: 'public_transport',
    category: '🛣️ Mobility & Outdoors',
    icon: '🚌',
    prompt: 'Public transport running?',
    options: ['Yes', 'No'],
    responses: {
      Yes: 'Public transport seems to be running smoothly.',
      No: 'Looks like some delays in public transport.',
    },
  },
  {
    id: 'pedestrian_clear',
    category: '🛣️ Mobility & Outdoors',
    icon: '🚶',
    prompt: 'Pedestrian area clear?',
    options: ['Clear', 'Blocked'],
    responses: {
      Clear: 'Walkways are open and clear.',
      Blocked: 'Some obstructions noticed on pedestrian paths.',
    },
  },

  // 🌤️ Environment & Air
  {
    id: 'air_feels_heavy',
    category: '🌤️ Environment & Air',
    icon: '🌬️',
    prompt: 'Air feels heavy?',
    options: ['Fresh', 'Dusty'],
    responses: {
      Fresh: 'Air feels fresh and light right now.',
      Dusty: 'Air quality seems dusty today.',
    },
  },
  {
    id: 'sky_looks',
    category: '🌤️ Environment & Air',
    icon: '☁️',
    prompt: 'Sky looks?',
    options: ['Clear', 'Cloudy'],
    responses: {
      Clear: 'Clear blue skies overhead.',
      Cloudy: 'Clouds are gathering in the sky.',
    },
  },
  {
    id: 'smog_visible',
    category: '🌤️ Environment & Air',
    icon: '🏭',
    prompt: 'Smog visible?',
    options: ['No', 'Yes'],
    responses: {
      No: 'Clear skies today — no smog in sight.',
      Yes: 'Smog is visible in parts of the area.',
    },
  },
  {
    id: 'feels_humid',
    category: '🌤️ Environment & Air',
    icon: '💧',
    prompt: 'Feels humid outside?',
    options: ['Yes', 'No'],
    responses: {
      Yes: 'Feels humid outside today.',
      No: 'Not too humid — air feels dry and pleasant.',
    },
  },
  {
    id: 'rain_started',
    category: '🌤️ Environment & Air',
    icon: '🌧️',
    prompt: 'Rain started?',
    options: ['No', 'Yes'],
    responses: {
      No: 'No rain yet — skies are holding up.',
      Yes: 'Rain’s started in your area.',
    },
  },

  // 🔊 Noise & Activity
  {
    id: 'noise_around',
    category: '🔊 Noise & Activity',
    icon: '🔊',
    prompt: 'Noise around?',
    options: ['Quiet', 'Loud'],
    responses: {
      Quiet: 'Neighborhood’s calm and quiet.',
      Loud: 'Most users say it’s a bit noisy outside.',
    },
  },
  {
    id: 'construction_nearby',
    category: '🔊 Noise & Activity',
    icon: '🏗️',
    prompt: 'Construction nearby?',
    options: ['Yes', 'No'],
    responses: {
      Yes: 'Construction noise detected nearby.',
      No: 'No construction activity around.',
    },
  },
  {
    id: 'sirens_audible',
    category: '🔊 Noise & Activity',
    icon: '🚨',
    prompt: 'Sirens audible?',
    options: ['No', 'Yes'],
    responses: {
      No: 'No emergency sirens heard recently.',
      Yes: 'Sirens reported — something might be happening nearby.',
    },
  },
  {
    id: 'music_volume',
    category: '🔊 Noise & Activity',
    icon: '🎵',
    prompt: 'Music volume outside?',
    options: ['Low', 'High'],
    responses: {
      Low: 'Soft tunes around — chill vibes.',
      High: 'Loud music heard outside.',
    },
  },

  // 🧍 Crowds & Social Flow
  {
    id: 'crowded_outside',
    category: '🧍 Crowds & Social Flow',
    icon: '🧍',
    prompt: 'Crowded outside?',
    options: ['Empty', 'Busy'],
    responses: {
      Empty: 'Streets seem quiet right now.',
      Busy: 'Quite a few people outside today.',
    },
  },
  {
    id: 'shops_crowded',
    category: '🧍 Crowds & Social Flow',
    icon: '🏪',
    prompt: 'Shops crowded?',
    options: ['No', 'Yes'],
    responses: {
      No: 'Shops aren’t too crowded at the moment.',
      Yes: 'Shops seem busy right now.',
    },
  },
  {
    id: 'park_packed',
    category: '🧍 Crowds & Social Flow',
    icon: '🌳',
    prompt: 'Park packed?',
    options: ['No', 'Yes'],
    responses: {
      No: 'Parks are quiet and peaceful.',
      Yes: 'Parks are full of people today.',
    },
  },
  {
    id: 'footpath_clear',
    category: '🧍 Crowds & Social Flow',
    icon: '🚶',
    prompt: 'Footpath clear?',
    options: ['Yes', 'No'],
    responses: {
      Yes: 'Footpaths are clear for walking.',
      No: 'Some obstructions on the footpath.',
    },
  },

  // ⚡ Utilities & Essentials
  {
    id: 'power_cut',
    category: '⚡ Utilities & Essentials',
    icon: '⚡',
    prompt: 'Power cut?',
    options: ['No', 'Yes'],
    responses: {
      No: 'Power supply seems stable across the area.',
      Yes: 'Some areas report power outages.',
    },
  },
  {
    id: 'water_supply',
    category: '⚡ Utilities & Essentials',
    icon: '💧',
    prompt: 'Water supply fine?',
    options: ['Yes', 'No'],
    responses: {
      Yes: 'Water supply is running normally.',
      No: 'Water supply issues reported nearby.',
    },
  },
  {
    id: 'internet_stable',
    category: '⚡ Utilities & Essentials',
    icon: '🌐',
    prompt: 'Internet stable?',
    options: ['Yes', 'No'],
    responses: {
      Yes: 'Internet connections appear stable.',
      No: 'Some users facing connectivity drops.',
    },
  },
  {
    id: 'streetlights_working',
    category: '⚡ Utilities & Essentials',
    icon: '💡',
    prompt: 'Streetlights working?',
    options: ['Yes', 'No'],
    responses: {
      Yes: 'Streetlights are functioning properly.',
      No: 'Some areas have streetlight issues.',
    },
  },
  {
    id: 'garbage_pickup',
    category: '⚡ Utilities & Essentials',
    icon: '🗑️',
    prompt: 'Garbage pickup done?',
    options: ['Yes', 'No'],
    responses: {
      Yes: 'Garbage pickup completed for today.',
      No: 'Garbage pickup still pending in some areas.',
    },
  },

  // 🧠 Local Awareness
  {
    id: 'unusual_smell',
    category: '🧠 Local Awareness',
    icon: '🔥',
    prompt: 'Any unusual smell or smoke?',
    options: ['No', 'Yes'],
    responses: {
      No: 'No smoke or unusual smells detected.',
      Yes: 'Reports of smoke or unusual odors nearby.',
    },
  },
  {
    id: 'stray_animals',
    category: '🧠 Local Awareness',
    icon: '🐕',
    prompt: 'Any stray animals around?',
    options: ['No', 'Yes'],
    responses: {
      No: 'No stray animals reported nearby.',
      Yes: 'Stray animals seen around the area.',
    },
  },
  {
    id: 'lost_item',
    category: '🧠 Local Awareness',
    icon: '🔍',
    prompt: 'Lost item seen recently?',
    options: ['No', 'Yes'],
    responses: {
      No: 'No lost items reported.',
      Yes: 'Someone reported a lost item nearby.',
    },
  },
  {
    id: 'local_event',
    category: '🧠 Local Awareness',
    icon: '🎪',
    prompt: 'Any local event today?',
    options: ['No', 'Yes'],
    responses: {
      No: 'No events scheduled for today.',
      Yes: 'Local event happening nearby!',
    },
  },
];
