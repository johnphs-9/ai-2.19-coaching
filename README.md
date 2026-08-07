# 2.19 Building a Sample App II - Dogstagram (cont'd)

## Lesson Overview

A coaching session that continues the Dogstagram app from Lesson 2.16, which is still a single screen with no navigation at this point. Lesson 2.18 built a separate, unrelated practice app, so Dogstagram itself has not changed since 2.16. This session first migrates the single screen into a bottom-tab app, then adds photo capture and selection via `expo-image-picker`, builds a full authentication flow with login and register screens, adds biometric login via `expo-local-authentication`, and finishes with a real Android build via EAS. By the end of the session the app is a complete, multi-screen React Native application that exercises navigation, native device capabilities, and a real build pipeline.

## Dependencies

- [Lesson](./lesson.md)

## Lesson Objectives

- Set up bottom-tab navigation with React Navigation, splitting a single-screen app into multiple screens
- Integrate `expo-image-picker` to allow users to pick a photo from the library or take a new one, handling iOS camera permissions correctly
- Build a complete authentication flow with login and register screens, and add biometric login using `expo-local-authentication`

## Lesson Plan

| Duration | What | How or Why |
| --------- | ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| 30 min | Recap Lessons 2.17 and 2.18 | React Navigation concepts from 2.17 (navigators, `navigation`/`route` props, nesting); native device capabilities from 2.18 (permissions, `expo-image-picker`, `expo-camera`, `expo-local-authentication`). Clarify that 2.18's app was a separate project, not Dogstagram, so today starts by adding navigation to Dogstagram for the first time |
| 20 min | Part 1: From one screen to a navigable app | Install React Navigation; migrate `App.js` into `screens/ExploreScreen.js`; add stub `MyDogsScreen`, `AddDogScreen`, `SettingsScreen`; build `TabNavigator`; slim down `App.js` |
| 20 min | Part 2: Image picker on AddDogScreen | Install `expo-image-picker`; configure `photosPermission`/`cameraPermission` in `app.json`; implement gallery picker, camera handler with iOS permission check, image preview, and `navigation.navigate` to pass the URI |
| 15 min | Part 3: Receiving the photo in MyDogsScreen | `useEffect` watching `route.params?.dog`; append to `myDogs` state with `randomUUID`; `FlatList` with `aspectRatio` images |
| 10 min | Activity 1 | Add infinite scroll to ExploreScreen using `onEndReached` and `onEndReachedThreshold`; fix the scroll-to-end behaviour so it only fires on the "Get Dog" button, not on every infinite-scroll load |
| 15 min | Part 4: Authentication flow | `AuthContext` with `login` and `logout`; `LoginScreen` and `RegisterScreen`; `AuthStackNavigator` with native-stack; `NavigationApp` switching on `isAuthenticated`. Auth state is session-only by design; no `AsyncStorage` persistence |
| 10 min | Activity 2 | Add biometric login to `AuthContext` and a fingerprint `TouchableOpacity` to `LoginScreen` using `expo-local-authentication`. Best tested on a physical device |
| 10 min | Part 5: Building an Android APK with EAS | Set the app icon; `eas login`, `git init`, `eas build:configure`, edit `eas.json` for an APK profile, `eas build --platform android --profile preview`. Expect the actual build to take 8-10 min on a free account, learners can start it and keep working while it runs in the background |
| **Total** | | **~120 min** |
| 60 min | Assignment time | Self-directed: learners finish any incomplete Parts or Activities at their own pace, work through the Bonus Challenges, or let their EAS build finish running while continuing other work. No separate assignment file for this coaching session |
