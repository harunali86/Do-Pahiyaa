export type DemoListing = {
  id: string;
  title: string;
  brand: string;
  model: string;
  year: number;
  city: string;
  price: number;
  kms: number;
  condition: "Excellent" | "Good" | "Fair";
  fuelType: "Petrol" | "Electric";
  ownerType: "1st Owner" | "2nd Owner" | "3rd Owner";
  color: string;
  postedBy: "Seller" | "Dealer";
  rating: number;
  imageTag: string;
  imageUrl: string;
  description: string;
  specs: Record<string, string>;
};

export const demoListings: DemoListing[] = [
  {
    id: "bike-101",
    title: "Yamaha MT-15 V2",
    brand: "Yamaha",
    model: "MT-15 V2",
    year: 2023,
    city: "Bengaluru",
    price: 158000,
    kms: 6800,
    condition: "Excellent",
    fuelType: "Petrol",
    ownerType: "1st Owner",
    color: "Racing Blue",
    postedBy: "Seller",
    rating: 4.8,
    imageTag: "Blue streetfighter",
    imageUrl:
      "https://images.unsplash.com/photo-1558981806-ec527fa84f3d?auto=format&fit=crop&w=1200&q=80",
    description:
      "Single owner bike with full service record, showroom condition, and ceramic coating.",
    specs: {
      engine: "155cc",
      transmission: "6-Speed",
      mileage: "47 km/l",
      abs: "Single Channel"
    }
  },
  {
    id: "bike-102",
    title: "Royal Enfield Classic 350",
    brand: "Royal Enfield",
    model: "Classic 350",
    year: 2022,
    city: "Delhi",
    price: 173000,
    kms: 9100,
    condition: "Good",
    fuelType: "Petrol",
    ownerType: "1st Owner",
    color: "Halcyon Green",
    postedBy: "Dealer",
    rating: 4.6,
    imageTag: "Retro cruiser",
    imageUrl:
      "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1200&q=80",
    description:
      "Dealer-certified, finance available, accident-free history with extended warranty.",
    specs: {
      engine: "349cc",
      transmission: "5-Speed",
      mileage: "35 km/l",
      abs: "Dual Channel"
    }
  },
  {
    id: "bike-103",
    title: "Ather 450X Gen 3",
    brand: "Ather",
    model: "450X",
    year: 2024,
    city: "Hyderabad",
    price: 139000,
    kms: 3200,
    condition: "Excellent",
    fuelType: "Electric",
    ownerType: "1st Owner",
    color: "Space Grey",
    postedBy: "Seller",
    rating: 4.9,
    imageTag: "Electric scooter",
    imageUrl:
      "https://images.unsplash.com/photo-1621932906530-1c095c27633d?auto=format&fit=crop&w=1200&q=80",
    description:
      "Fast charger included, battery health 98%, app connectivity and navigation enabled.",
    specs: {
      range: "146 km",
      top_speed: "90 km/h",
      charging: "0-80% in 4h 30m",
      battery: "3.7 kWh"
    }
  },
  {
    id: "bike-104",
    title: "KTM Duke 250",
    brand: "KTM",
    model: "Duke 250",
    year: 2021,
    city: "Pune",
    price: 182000,
    kms: 12500,
    condition: "Good",
    fuelType: "Petrol",
    ownerType: "2nd Owner",
    color: "Orange",
    postedBy: "Dealer",
    rating: 4.4,
    imageTag: "Aggressive naked",
    imageUrl:
      "https://images.unsplash.com/photo-1580310614729-ccd69652491d?auto=format&fit=crop&w=1200&q=80",
    description:
      "Performance tuned and recent chain-sprocket replacement. Test ride available.",
    specs: {
      engine: "248.8cc",
      transmission: "6-Speed",
      mileage: "30 km/l",
      abs: "Dual Channel"
    }
  },
  {
    id: "bike-105",
    title: "TVS Apache RTR 200 4V",
    brand: "TVS",
    model: "Apache RTR 200",
    year: 2020,
    city: "Mumbai",
    price: 98000,
    kms: 18900,
    condition: "Fair",
    fuelType: "Petrol",
    ownerType: "2nd Owner",
    color: "Matte Black",
    postedBy: "Seller",
    rating: 4.2,
    imageTag: "Street bike",
    imageUrl:
      "https://images.unsplash.com/photo-1609630875171-b1321377ee65?auto=format&fit=crop&w=1200&q=80",
    description:
      "Daily commute friendly, good tyres, recent brake pad replacement and valid insurance.",
    specs: {
      engine: "197.75cc",
      transmission: "5-Speed",
      mileage: "38 km/l",
      abs: "Dual Channel"
    }
  },
  {
    id: "bike-106",
    title: "Honda CB350 RS",
    brand: "Honda",
    model: "CB350 RS",
    year: 2023,
    city: "Chennai",
    price: 189000,
    kms: 5300,
    condition: "Excellent",
    fuelType: "Petrol",
    ownerType: "1st Owner",
    color: "Pearl Blue",
    postedBy: "Dealer",
    rating: 4.7,
    imageTag: "Neo-retro",
    imageUrl:
      "https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?auto=format&fit=crop&w=1200&q=80",
    description:
      "BigWing serviced, accessories installed, low run and complete documentation.",
    specs: {
      engine: "348.36cc",
      transmission: "5-Speed",
      mileage: "35 km/l",
      abs: "Dual Channel"
    }
  }
];



export type DemoAuction = {
  id: string;
  listingTitle: string;
  seller: string;
  startPrice: number;
  currentPrice: number;
  reservePrice: number;
  minIncrement: number;
  startsAt: string;
  endsAt: string;
  status: "scheduled" | "live" | "ended";
  city: string;
  bids: number;
  imageUrl: string;
};

export const demoAuctions: DemoAuction[] = [
  {
    id: "auc-901",
    listingTitle: "Kawasaki Ninja 300",
    seller: "Do Pahiyaa Trade Desk",
    startPrice: 210000,
    currentPrice: 238000,
    reservePrice: 240000,
    minIncrement: 2000,
    startsAt: "10:00 AM",
    endsAt: "10:25 AM",
    status: "live",
    city: "Mumbai",
    bids: 24,
    imageUrl:
      "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "auc-902",
    listingTitle: "BMW G310R",
    seller: "BlueWheel Premium",
    startPrice: 195000,
    currentPrice: 195000,
    reservePrice: 210000,
    minIncrement: 3000,
    startsAt: "2:00 PM",
    endsAt: "2:35 PM",
    status: "scheduled",
    city: "Bengaluru",
    bids: 0,
    imageUrl:
      "https://images.unsplash.com/photo-1611242320536-f12d3541249b?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "auc-903",
    listingTitle: "Benelli TRK 502",
    seller: "MetroMoto Exchange",
    startPrice: 315000,
    currentPrice: 356000,
    reservePrice: 345000,
    minIncrement: 5000,
    startsAt: "9:00 AM",
    endsAt: "9:30 AM",
    status: "ended",
    city: "Hyderabad",
    bids: 31,
    imageUrl:
      "https://images.unsplash.com/photo-1517846693594-1567da72af75?auto=format&fit=crop&w=1200&q=80"
  }
];

export type DemoBid = {
  id: string;
  bidder: string;
  amount: number;
  timestamp: string;
};

export const liveBids: DemoBid[] = [
  { id: "b-1", bidder: "BlueWheel Premium", amount: 228000, timestamp: "10:14:12" },
  { id: "b-2", bidder: "Urban Autos India", amount: 230000, timestamp: "10:14:47" },
  { id: "b-3", bidder: "RapidRide Dealers", amount: 232000, timestamp: "10:15:11" },
  { id: "b-4", bidder: "BlueWheel Premium", amount: 236000, timestamp: "10:15:39" },
  { id: "b-5", bidder: "RoadKing Wheels", amount: 238000, timestamp: "10:16:02" }
];

export const kpis = {
  grossMerchandiseValue: 18400000,
  activeListings: 1284,
  liveDeals: 312,
  auctionVolumeToday: 2240000,
  leadUnlockRevenue: 186000,
  conversionRate: 18.4
};
