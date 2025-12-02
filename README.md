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

---

_Join the movement against food waste! Every meal shared through Rizkify saves resources, reduces emissions, and builds community connections._
