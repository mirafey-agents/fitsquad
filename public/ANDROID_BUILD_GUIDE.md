# Android Build Guide for FitSquad

## 🚀 Quick Start

### Option 1: Cloud Build (Recommended)
```bash
# Install EAS CLI locally
npm install eas-cli --save-dev

# Login to Expo (create account at https://expo.dev)
npx eas login

# Build Android APK
npm run build:android
```

### Option 2: Local Build
```bash
# Prebuild for Android
npm run prebuild:android

# Run on connected device/emulator
npx expo run:android
```

## 📱 Build Profiles

### Development Build
- **Purpose**: Testing with development features
- **Command**: `npm run build:android-dev`
- **Output**: APK with development client

### Preview Build
- **Purpose**: Testing with production-like features
- **Command**: `npm run build:android`
- **Output**: APK for distribution

### Production Build
- **Purpose**: App Store release
- **Command**: `eas build --platform android --profile production`
- **Output**: AAB (Android App Bundle)

## 🔧 Prerequisites

### For Cloud Build (EAS)
1. Expo account (free)
2. Internet connection
3. No local Android SDK required

### For Local Build
1. Android Studio
2. Android SDK
3. Java Development Kit (JDK)
4. Connected Android device or emulator

## 📋 Testing Steps

### 1. Development Testing
```bash
# Start development server
npm run dev

# Open in Expo Go app
# Test the devices page functionality
```

### 2. APK Testing
```bash
# Build APK
npm run build:android

# Download APK from Expo dashboard
# Install on Android device
# Test HealthConnect integration
```

### 3. Device Testing
```bash
# Connect Android device via USB
# Enable USB debugging
# Run local build
npx expo run:android
```

## 🎯 Testing HealthConnect

### Setup Requirements
1. **Android Device**: HealthConnect requires Android 6+ (API 23+)
2. **HealthConnect App**: Install from Google Play Store
3. **Zepp App**: Install and pair Amazfit device
4. **Data Sharing**: Enable in Zepp settings

### Test Flow
1. Install FitSquad APK
2. Navigate to Devices page
3. Tap "Setup HealthConnect"
4. Grant permissions
5. Sync Amazfit data

## 🔍 Troubleshooting

### Common Issues
- **Build fails**: Check Expo account and internet connection
- **APK won't install**: Enable "Install from unknown sources"
- **HealthConnect not working**: Ensure device has HealthConnect app installed
- **Permissions denied**: Grant all required permissions in device settings

### Debug Commands
```bash
# Check connected devices
adb devices

# View logs
adb logcat

# Install APK
adb install app.apk
```

## 📊 Build Status

- ✅ **Development**: Ready for testing
- ✅ **Preview**: Ready for APK build
- ⏳ **Production**: Configure when ready for release

## 🎉 Next Steps

1. **Test Development Build**: Verify UI and functionality
2. **Build Preview APK**: Test on real device
3. **Test HealthConnect**: Verify Amazfit integration
4. **Production Build**: When ready for release 