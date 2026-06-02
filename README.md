# Rizkify Mobile - Documentation

## Project Overview

**Rizkify Mobile** is a React Native mobile application designed to combat food waste by creating a community-driven platform for sharing surplus food. The app connects individuals, restaurants, supermarkets, and other food establishments with people who can use food that would otherwise go to waste.

### The Food Waste Crisis

Every year, approximately **1.3 billion tons** of food is wasted globally while millions face hunger. Rizkify addresses this paradox by:

**Key Problems Solved:**

- **Restaurant & Cafe Surplus**: Daily unsold food from establishments
- **Household Excess**: Extra groceries and cooked meals
- **Event Leftovers**: Food from weddings, parties, and gatherings
- **Near-Expiry Products**: Perfectly good food approaching sell-by dates

### How Rizkify Works

**For Food Donors:**

- 📱 Snap a photo of surplus food
- 📍 Set pickup location and time window
- 🏷️ Add details (quantity, dietary info, expiry)
- 🤝 Connect with nearby recipients

**For Food Recipients:**

- 🔍 Browse available food in your area
- ⏰ Reserve items for convenient pickup
- 📲 Get real-time notifications
- 🌱 Track your environmental impact

### Environmental Impact Features

- **Carbon Footprint Calculator**: See CO₂ emissions prevented
- **Water Savings Tracker**: Visualize water conservation from food rescue
- **Landfill Diversion**: Monitor kilograms kept from landfills
- **Community Impact**: Collective achievements of local users

### Safety & Quality Assurance

- Clear food handling guidelines
- Donor rating system
- Expiry date tracking
- Food category best practices

## Installation Guide

### Prerequisites

1. **Node.js** (v16 or newer)
2. **npm** or **yarn**
3. **Expo CLI** (recommended)
4. **Mobile Device** with Expo Go app OR Simulator

### Step-by-Step Installation

#### 1. Clone & Setup

```bash
# Clone the repository
git clone https://github.com/zyq-m/rizkify-mobile.git

# Navigate to project
cd rizkify-mobile

# Install dependencies
npm install
# or
yarn install
```

#### 2. Environment Configuration

Create a `.env` file in the root directory:

```env
EXPO_PUBLIC_API_URL=your_backend_api_url
EXPO_PUBLIC_MAPS_API_KEY=your_google_maps_key
EXPO_PUBLIC_GOOGLE_PLACES_KEY=your_google_places_key
```

#### 3. Run the Application

**Option A: Using Expo Go (Easiest for Testing)**

```bash
# Start the development server
npm start
# or
expo start
```

- Scan the QR code with Expo Go app (iOS/Android)
- App loads directly on your phone

**Option B: iOS Simulator (Mac Only)**

```bash
# Install iOS simulator dependencies
npm run ios
```

**Option C: Android Emulator**

```bash
# Ensure Android Studio & emulator are running
npm run android
```

#### 4. Development Features

```bash
# Clear cache if experiencing issues
expo start --clear

# Run in production mode
expo start --no-dev --minify

# View logs
expo logs
```

### Quick Troubleshooting

**Common Issues & Solutions:**

1. **"Module not found" errors**

   ```bash
   rm -rf node_modules
   npm install
   ```

2. **Expo Go connection problems**
   - Ensure phone and computer are on same WiFi
   - Try `expo start --tunnel`

3. **Build failures**

   ```bash
   expo prebuild --clean
   ```

4. **API connection issues**
   - Verify `.env` file exists
   - Check backend server is running

### Production Build

**For Android APK:**

```bash
expo build:android
```

**For iOS IPA:**

```bash
expo build:ios
```

**Note:** Production builds require Expo account and may take 15-30 minutes.

### Schma

```sql
-- Enums
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');
CREATE TYPE "RequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'COMPLETED');

-- Tables
CREATE TABLE "users" (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  role "UserRole" DEFAULT 'USER',
  is_suspended BOOLEAN DEFAULT false,
  location JSONB,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
-- Note: password is handled by Supabase Auth automatically

CREATE TABLE "categories" (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE "conditions" (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE "items" (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  quantity INT DEFAULT 1,
  expiry DATE NOT NULL,
  description TEXT,
  location JSONB NOT NULL,
  location_description TEXT,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE NOT NULL,
  condition_id UUID REFERENCES conditions(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE "item_images" (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT NOT NULL,
  item_id UUID REFERENCES items(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE "liked_items" (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  item_id UUID REFERENCES items(id) ON DELETE CASCADE NOT NULL,
  UNIQUE(user_id, item_id)
);

CREATE TABLE "item_requests" (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  status "RequestStatus" DEFAULT 'PENDING',
  quantity INT DEFAULT 1,
  message TEXT,
  requester_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  provider_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  item_id UUID REFERENCES items(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE "chat_messages" (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  image_url TEXT,
  is_read BOOLEAN DEFAULT false,
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  item_request_id UUID REFERENCES item_requests(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Realtime for chat
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;

```

#### RLS Policies (brief)

You'll need policies like:

- users — can read all, update own
- items — can read all, insert/update/delete own
- chat_messages — can read/insert if you're sender or receiver

---

_Join the movement against food waste! Every meal shared through Rizkify saves resources, reduces emissions, and builds community connections._
