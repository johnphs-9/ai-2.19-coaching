# 2.19 Building a Sample App II - Dogstagram (cont'd)

## Lesson Overview

A coaching session that completes the Dogstagram app begun in Lesson 2.16 and extended in Lesson 2.18. Learners add photo capture and selection via `expo-image-picker`, build a full authentication flow with login and register screens, persist the session with `AsyncStorage`, and add biometric login via `expo-local-authentication`. By the end of the session the app is a complete, multi-screen React Native application that exercises navigation, native device capabilities, and local persistence.

## Dependencies

- [Lesson](./lesson.md)

## Lesson Objectives

- Integrate `expo-image-picker` to allow users to pick a photo from the library or take a new one, handling iOS camera permissions correctly
- Build a navigation-switching auth flow using `AuthContext`, `AuthStackNavigator`, and `BottomTabNavigator`, with persistent login state via `AsyncStorage`
- Add biometric login using `expo-local-authentication`, guarding against devices that lack hardware support

## Lesson Plan

| Duration | What | How or Why |
| --------- | ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| 30 min | Lecture and app demo | Recap 2.18 end state; demo finished Dogstagram; cover expo-image-picker, temporary URIs, AsyncStorage, and expo-local-authentication |
| 5 min | Starting point check | Verify everyone has the 2.18 app running; distribute starter files if needed |
| 30 min | Part 1: Image picker on AddDogScreen | Install expo-image-picker; implement gallery picker, camera handler with iOS permission check, image preview, and navigation.navigate to pass URI |
| 20 min | Part 2: Receiving the photo in MyDogsScreen | useEffect watching route.params?.dog; append to myDogs state with randomUUID; FlatList with aspectRatio images |
| 15 min | Activity 1 | Add infinite scroll to ExploreScreen using onEndReached and onEndReachedThreshold |
| 25 min | Part 3: Authentication flow | AuthContext with login and logout; LoginScreen and RegisterScreen; AuthStackNavigator with native-stack; NavigationApp switching on isAuthenticated |
| 15 min | Part 4: Persisting login state | Install AsyncStorage; update AuthContext to check token on mount, write token on login, remove on logout; wire up SettingsScreen logout button |
| 15 min | Activity 2 | Add biometric login to AuthContext and a fingerprint TouchableOpacity to LoginScreen using expo-local-authentication |
| 10 min | Wrap up and Q&A | Recap, bonus challenges for fast finishers |
| **Total** | | **~165 min - allows a buffer for questions and pacing** |
