export const PRESET_REELS = [
  {
    id: 'preset-video',
    title: 'Tier 1 Demo: Spot Name Visible in Reel Video',
    reelUrl: 'https://www.instagram.com/reel/C8CoffeeVideoDemo/',
    author: 'cafewanderer',
    description: 'Sunday morning coffee ritual at this specialty roastery. Such calm vibes!',
    simulatedType: 'video',
    audioTranscript: 'Welcome to Roastery Coffee House in Hyderabad. Their cold brews and bagel breakfast are unmatched.',
    comments: [
      { author: 'coffee_lover', text: 'Their outdoor patio is so peaceful!' },
      { author: 'traveller_aj', text: 'Best coffee roaster in Banjara Hills hands down.' }
    ],
    expectedPlace: {
      placeName: 'Roastery Coffee House',
      category: 'Cafe',
      cityOrArea: 'Banjara Hills, Hyderabad',
      evidence: 'Detected "Roastery Coffee House" logo on coffee cup and audio voiceover mention.',
    }
  },
  {
    id: 'preset-caption',
    title: 'Tier 2 Demo: Video Unbranded, Place Revealed in Caption',
    reelUrl: 'https://www.instagram.com/reel/C9BakeryCaptionDemo/',
    author: 'mumbaifoodie',
    description: 'Obsessed with the freshly baked pastrami sandwiches and retro interior here! 📍 Veronica’s, Waroda Rd, Ranwar, Bandra West. #mumbaieats #veronicas',
    simulatedType: 'caption',
    audioTranscript: 'Check out the juiciest sandwich in the city. The crust is crunchy, cheese is melted to perfection.',
    comments: [
      { author: 'priya_m', text: 'Those sandwiches look insane!' },
      { author: 'rahul_k', text: 'Is it pet friendly?' }
    ],
    expectedPlace: {
      placeName: "Veronica's",
      category: 'Bakery',
      cityOrArea: 'Bandra West, Mumbai',
      evidence: 'Extracted venue tag "Veronica’s, Waroda Rd, Ranwar, Bandra West" from caption.',
    }
  },
  {
    id: 'preset-comments',
    title: 'Tier 3 Demo: Hidden in Video & Caption, Disclosed in Comments',
    reelUrl: 'https://www.instagram.com/reel/C10SecretCafeDemo/',
    author: 'delhisecrets',
    description: 'Found the most aesthetic hidden plant cafe in Central Delhi! Bookmark for your next date! Save & share with someone you want to go with! ✨☕🌿',
    simulatedType: 'comments',
    audioTranscript: 'Hidden spot in the heart of Delhi with over 500 plants and amazing pasta.',
    comments: [
      { author: 'rohit_foodie', text: 'Bro where is this?? Name please!' },
      { author: 'delhisecrets', text: '@rohit_foodie It is Cafe Tesu in Essex Farms, Adchini!', isAuthorReply: true },
      { author: 'simran_22', text: 'Omg Cafe Tesu is my absolute favorite, their cheesecake is heavenly' }
    ],
    expectedPlace: {
      placeName: 'Cafe Tesu',
      category: 'Cafe',
      cityOrArea: 'Adchini, New Delhi',
      evidence: 'Creator @delhisecrets replied to @rohit_foodie: "It is Cafe Tesu in Essex Farms, Adchini!"',
    }
  }
];
