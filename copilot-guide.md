# Copilot Agent Mode Guide: Building Dogstagram

## Overview

This guide is an alternative path through Lesson 2.19. Instead of typing every file by hand from [lesson.md](./lesson.md), you will reach the same finished app, a Dogstagram build with tab navigation, an image picker, an authentication flow with biometric login, and an EAS Android build, by writing prompts for VS Code Copilot in Agent mode and reviewing what it produces.

The two paths are not meant to be combined on the same project. Pick one:

- **Code-along path:** follow [lesson.md](./lesson.md) and type every file yourself.
- **Agent path:** follow this guide, starting from the same point in the codebase, and delegate the implementation to Copilot Agent mode, reviewing and correcting its output at every step.

Both paths produce the same learning objectives. The code-along path builds muscle memory for React Navigation and Expo APIs by typing them out. The agent path builds a different, increasingly important skill: directing an AI agent with a clear, well-scoped prompt, then reviewing its work critically before accepting it. Neither skill replaces the other.

> **This is not "let the agent do it and walk away."** Every step below ends with a review instruction. Copilot can write the code, run the terminal commands, and even fix its own errors, but you remain responsible for checking that the result is correct, minimal, and matches the project's conventions.

---

## Prerequisites

- The `dogstagram` project at the end of Lesson 2.16, exactly as described in the "Starting Point" section of [lesson.md](./lesson.md).
- VS Code with the GitHub Copilot extension installed and signed in.
- Copilot Chat set to **Agent mode** (the mode selector in the Chat view, not "Ask" or "Edit").
- A physical device or emulator with Expo Go installed, for testing along the way.

If you have not used Agent mode before, open the Chat view (`Cmd+Ctrl+I` on macOS, `Ctrl+Alt+I` on Windows/Linux), select **Agent** from the mode dropdown at the top of the chat panel, and confirm your model of choice is selected.

---

## How to use this guide

Each part below gives you:

1. **Context to give Copilot first**, so it grounds its plan in the actual project rather than guessing.
2. **A single prompt** covering the whole part, written the way you would type it into the Chat view.
3. **What to expect** Copilot to do, so you can tell whether it went off track.
4. **A review checklist**, the concrete things to check before you move to the next part.

Do not paste every prompt back-to-back without reading the output in between. Agent mode will show you a plan and a list of file changes before or as it applies them, review that list every time.

> **Common mistake:** pasting the next part's prompt while Copilot is still mid-edit on the current one. Wait for it to finish and for you to complete the review checklist before moving on.

---

## Part 1: From One Screen to a Navigable App

### Context to give Copilot first

Open `App.js` in the editor so it is part of Copilot's active context, then start a new Agent mode conversation with this framing prompt:

```text
I'm working on a React Native Expo app called Dogstagram. Right now App.js is a
single screen: font loading, a header, a "Get Dog" / "Clear" button pair, and a
FlatList gallery of dog photos fetched from an API. There is no navigation yet.

Before you change anything, inspect the project structure and confirm your
understanding of the current App.js. Do not modify any files yet.
```

### The prompt

```text
Turn this single-screen app into a tab-based app using React Navigation.

Requirements:

- Install @react-navigation/native, @react-navigation/bottom-tabs,
  react-native-screens, react-native-safe-area-context, and
  @react-native-vector-icons/ionicons using `npx expo install`, not npm install.
- Create a screens/ folder and a navigation/ folder.
- Move the entire current contents of App.js into screens/ExploreScreen.js,
  renaming the component from App to ExploreScreen. Update the relative asset
  path for the wallpaper image since the file now lives one folder deeper.
- Remove SafeAreaProvider/SafeAreaView usage from ExploreScreen if present;
  the navigator handles safe-area insets itself.
- Create three stub screens: screens/MyDogsScreen.js, screens/AddDogScreen.js,
  and screens/SettingsScreen.js. Each should just render its own name centered
  on screen for now.
- Add a WHITE color token to styles/colors.js for use in the tab header.
- Create navigation/TabNavigator.js with a bottom tab navigator containing
  four tabs: Explore, MyDogs (label "My Dogs"), AddDog (label "Add Dog"), and
  Settings. Give each an appropriate Ionicons icon (e.g. compass, paw,
  add-circle, settings).
- Update App.js to be a slim entry point: it should keep font loading (the
  useFonts call and loading check) and wrap TabNavigator in a
  NavigationContainer.

Explain your plan and the files you intend to create or change before you
start, then implement it.
```

### What to expect

Copilot should propose a plan naming the same files listed in [lesson.md](./lesson.md)'s Part 1 (`screens/ExploreScreen.js`, three stub screens, `navigation/TabNavigator.js`, a slimmed `App.js`), run the `npx expo install` command, and then create or edit each file. It may phrase the plan differently or order the steps differently from the lesson, that is expected; what matters is whether the resulting files work.

### Review checklist

- Open the diff or changed-files list. Confirm `App.js` no longer contains the gallery/button JSX, only font loading and `NavigationContainer`.
- Confirm the wallpaper `require(...)` path in `ExploreScreen.js` was updated to account for the extra folder depth (`../assets/...`, not `./assets/...`). This is the single most common thing Copilot gets wrong when moving files, check it explicitly.
- Run the app in Expo Go. **Device check:** four tabs appear at the bottom, each with an icon. The Explore tab behaves exactly as the original single screen did; the other three show placeholder text.
- Ask Copilot to explain any package it installed that you do not recognize, before trusting it:
  ```text
  Explain what react-native-screens and react-native-safe-area-context are used
  for and why React Navigation needs them.
  ```

---

## Part 2: Image Picker on AddDogScreen

### Context to give Copilot first

```text
AddDogScreen currently just renders placeholder text. I want to build it out
to let the user pick a dog photo from their library or take a new one with the
camera, then send that photo to the MyDogs tab. Read screens/AddDogScreen.js
and navigation/TabNavigator.js before proposing anything.
```

### The prompt

```text
Implement AddDogScreen so the user can pick or capture a dog photo and send it
to the My Dogs tab.

Requirements:

- Install expo-image-picker with `npx expo install`.
- In app.json, add an expo-image-picker plugin entry declaring both
  photosPermission and cameraPermission strings, since this screen uses both
  the library picker and the camera.
- AddDogScreen should have a "Pick a Photo" button that opens the library via
  launchImageLibraryAsync, and a "Take a Photo" button that opens the camera
  via launchCameraAsync. Use shared image options: images only, allow editing,
  square aspect ratio, quality 0.8.
- Before opening the camera, check camera permission using
  useCameraPermissions(). On iOS, request permission if undetermined, and show
  an alert directing the user to Settings if denied. Skip this check entirely
  on Android. The library picker does not need a manual permission check; it
  triggers the system dialog on its own.
- Once a photo is selected or taken, show a preview image with "Save" and
  "Clear" buttons. "Save" should navigate to the MyDogs tab, passing the image
  URI as a route param called `dog`. "Clear" should reset back to no photo
  selected.
- Match the visual style of the rest of the app: use the existing Button
  component and Colors from styles/colors.js.

Explain your plan first, including which permission checks apply to which
platform and why, then implement it.
```

### What to expect

Copilot should install `expo-image-picker`, edit `app.json`'s `plugins` array, and rewrite `AddDogScreen.js` with `pickImageHandler`, `checkCameraPermission`, `takeImageHandler`, and `confirmImageHandler`, matching the shape in [lesson.md](./lesson.md)'s Part 2. Watch for whether it correctly skips the permission check on Android, this is an easy detail for an agent to drop or over-generalize.

### Review checklist

- Confirm `app.json` has both `photosPermission` and `cameraPermission` declared under the `expo-image-picker` plugin entry, not just one.
- Read the permission-check function. Confirm it returns early on Android (`Platform.OS === "android"`) before touching `cameraPermission.status`.
- **Device check:** tap "Pick a Photo," select an image, confirm the preview appears. Tap "Take a Photo" on a physical device, confirm the camera opens (this will not work in an iOS Simulator, only a real device or Android emulator with camera support).
- Tap "Save" and confirm the app switches to the My Dogs tab. The image will not appear there yet, that is expected until Part 3.
- Ask Copilot to justify the permission split before you accept it, if anything looks off:
  ```text
  Why does the camera permission check apply only to iOS and not Android in
  this implementation?
  ```

---

## Part 3: Receiving the Photo in MyDogsScreen

### Context to give Copilot first

```text
AddDogScreen now navigates to the MyDogs tab with a route param called `dog`
containing an image URI. MyDogsScreen is still a stub. There is no backend for
this app, so photos need to be kept in local state rather than fetched from a
server.
```

### The prompt

```text
Update MyDogsScreen to receive and display photos passed from AddDogScreen.

Requirements:

- Keep a local `myDogs` array in state, each entry with a unique id (use
  expo-crypto's randomUUID) and the image url.
- Use a useEffect that watches route.params?.dog specifically, not the whole
  route.params object, and appends a new entry when a dog param arrives.
- Render the photos in a FlatList, one square image per row, using
  width: "100%" and aspectRatio: 1 so the image fills the screen width on any
  device.
- Show a "No dogs yet." message when the list is empty.

Explain why watching route.params?.dog specifically, rather than the whole
params object, matters for the useEffect dependency array before implementing.
```

### What to expect

Copilot should produce something close to [lesson.md](./lesson.md)'s Part 3 `MyDogsScreen.js`. Its explanation of the dependency array should mention that depending on the whole `route.params` object would re-run the effect on any param change, not just a new photo.

### Review checklist

- Confirm the `useEffect` dependency array is `[route.params?.dog]`, not `[route.params]`.
- **Device check:** run the full flow end to end. Go to Add Dog, pick or take a photo, Save, and confirm the photo appears in My Dogs. Repeat once more and confirm both photos are present, not just the most recent one (this catches a common mistake where the agent replaces state instead of appending to it).
- If Copilot's explanation of the dependency array does not match what you understand, ask it to walk through what happens if you depend on `route.params` as a whole, with a concrete example, before accepting the code.

---

## Activity 1: Add Infinite Scroll to ExploreScreen (Agent path)

This activity works the same way it does in the code-along path: attempt it with a plan-first prompt rather than jumping straight to "implement it." This is where writing a good prompt matters most, because there is a subtle interaction to get right.

### The prompt

```text
ExploreScreen has a FlatList of dog photos and a flatListRef used to scroll to
the bottom. Currently, onContentSizeChange={scrollToEnd} forces a scroll to
the bottom every time the list's content size changes.

I want to add infinite scroll: more dogs should load automatically as the user
scrolls near the bottom of the list.

Before implementing, explain what will go wrong if onContentSizeChange stays
as it is once infinite scroll is added, and propose where scrollToEnd should
be triggered instead. Then implement your proposal using FlatList's
onEndReached and onEndReachedThreshold props, guarding against firing a
duplicate fetch while a request is already in flight or before the list has
any items yet.
```

### Review checklist

- Read Copilot's explanation before it touches any code. It should identify that `onContentSizeChange` cannot distinguish "the button was pressed" from "infinite scroll just added an item," and that leaving it as-is would fight the user's scroll position.
- Confirm the guard condition in the `onEndReached` handler checks both that a fetch is not already in progress and that the list is not still empty.
- **Device check:** press "Get Dog" once, confirm it still scrolls to the new photo. Then scroll to the bottom of the list and confirm more dogs load automatically, without the list jumping back to the top or firing duplicate requests.

---

## Part 4: Authentication Flow with Biometric Login

This part is larger, so it is worth using the explore-plan-implement-verify sequence explicitly rather than a single combined prompt.

### Step 1: Explore and plan

```text
I want to add an authentication flow to this app: a login screen, a register
screen, and a way to gate the tab navigator behind being logged in. There is
no backend, so login should be mocked (accept any credentials and mark the
user as authenticated). Do not persist the session between app restarts; keep
it in memory only for this lesson.

Propose an implementation plan covering:

- where authentication state should live (a Context is a reasonable default
  for this size of app)
- what LoginScreen and RegisterScreen need
- how navigation should switch between the auth screens and the main tab
  navigator based on auth state
- any pitfall around calling useContext before its provider has mounted

Do not implement anything yet.
```

Read the plan. Confirm it proposes an `AuthContext` with `login`/`logout` functions, a separate stack navigator for `Login`/`Register`, and a top-level component in `App.js` that reads `isAuthenticated` to decide which navigator to render. If it proposes persisting the session (for example, with `AsyncStorage`), push back:

```text
Do not persist the session yet, keep it in-memory only. I'll cover persistence
separately as a bonus challenge, and AsyncStorage is not appropriate for auth
tokens anyway since it is unencrypted.
```

### Step 2: Implement the approved plan

```text
Implement the plan as discussed:

- contexts/AuthContext.js exporting AuthContext and an AuthProvider with
  isAuthenticated state, login(username, password), and logout()
- screens/LoginScreen.js with username/password inputs, a Login button calling
  login, and a Register button navigating to the Register screen
- screens/RegisterScreen.js with a mocked handleRegister that shows an alert
  explaining it is a mock, plus a "Back to Login" button
- navigation/AuthStackNavigator.js using @react-navigation/native-stack (install
  it first with npx expo install) with headerShown: false
- Update App.js so AuthProvider wraps the app, and a small NavigationApp
  component reads isAuthenticated from context to choose between TabNavigator
  and AuthStackNavigator. Explain why this needs to be a separate component
  from App itself.
- Wire the existing Logout button on SettingsScreen to call logout from
  AuthContext.

Match the visual style already used on AddDogScreen and the rest of the app.
```

### Step 3: Add biometric login

```text
Add a biometric login option to LoginScreen using expo-local-authentication.

Requirements:

- Install expo-local-authentication.
- Add a biometricLogin function to AuthContext that checks hasHardwareAsync()
  and isEnrolledAsync() before calling authenticateAsync(). If either check
  fails, do nothing (return false). If authentication succeeds, set
  isAuthenticated to true.
- Expose biometricLogin from the AuthContext.Provider value.
- Add a fingerprint icon button to LoginScreen, below the existing Login/
  Register buttons, that calls biometricLogin.

Explain why both hasHardwareAsync and isEnrolledAsync need to be checked,
not just one, before implementing.
```

### What to expect

Copilot's explanation for the `NavigationApp` split should mention that `useContext` only works inside a descendant of the provider, so calling it directly in `App` before `AuthProvider` has mounted would read `undefined`. Its explanation for the two biometric checks should distinguish "device has no biometric sensor at all" from "device has a sensor but the user never enrolled a fingerprint or face."

### Review checklist

- Confirm `isAuthenticated` lives only in `useState`, with no `AsyncStorage`, `expo-secure-store`, or similar persistence call anywhere in the diff. If Copilot added persistence anyway, ask it to remove it, that is a bonus challenge, not part of the core flow.
- Confirm `biometricLogin` checks both `hasHardwareAsync()` and `isEnrolledAsync()` and returns early if either is false, rather than jumping straight to `authenticateAsync()`.
- **Device check:** launch the app, confirm the Login screen appears first. Enter any username and password and press Login, confirm the tabs appear. Use the Logout button on Settings, confirm it returns to Login. On a physical device with biometrics enrolled, test the fingerprint button as well.
- Ask for a self-review before moving on:
  ```text
  Review the authentication changes against the requirements I gave you.
  Confirm the session does not persist across app restarts, and that the
  biometric check does not skip either the hardware or enrollment check.
  ```

---

## Part 5: Building an Android APK with EAS

EAS Build involves account setup and interactive terminal prompts that Copilot cannot answer for you (your Expo login, your choice of application id, whether to generate a keystore). Treat this part as a case where you drive the terminal yourself and use Copilot only to explain what is happening or to fix a build error.

### Where to ask Copilot for help

Before running any commands, if anything in this part is unclear:

```text
Explain what EAS Build does, why the project needs to be inside a git
repository for it to work, and the difference between the APK and AAB build
outputs for Android.
```

Then follow [lesson.md](./lesson.md)'s Part 5 directly for the actual commands: setting the app icon, `eas login`, `git init`, `eas build:configure`, editing `eas.json` for the `apk` build type, and `eas build --platform android --profile preview`.

If the build fails, paste the error into Agent mode and let it investigate:

```text
The EAS build failed with this error: [paste error]. Investigate the likely
cause and propose the smallest fix. Do not change unrelated configuration.
```

### Review checklist

- Confirm any fix Copilot proposes touches only `app.json`, `eas.json`, or the specific file the error points to, not unrelated screens or navigation code.
- **Device check:** install the resulting APK on an Android device and confirm it behaves the same as it did in Expo Go.

---

## Keeping a record as you go

For at least one part above, keep a short record of how the agent path went. This is useful both for your own learning and for comparing notes with classmates who took the code-along path.

```markdown
## Part

Which part of Dogstagram did this cover?

## Prompt used

The main prompt you sent.

## What Copilot did well

The useful or correct parts of the result.

## What required correction

Anything inaccurate, incomplete, or unnecessary that you had to fix or push
back on.

## Verification

How you actually tested it: device check, reading the diff, asking a
follow-up question, or something else.
```

---

## Bonus Challenges (Agent path)

Attempt these using the same explore-plan-implement-verify approach as Part 4, rather than a single one-shot prompt:

1. Ask Copilot to add haptic feedback to the Save button on AddDogScreen using `expo-haptics`, matching the package already used in Lesson 2.18.
2. Ask Copilot to plan, then implement, persisting the login session with `expo-secure-store` instead of leaving it in memory. Require the plan to explain why `expo-secure-store` is appropriate here and `AsyncStorage` is not.
3. Ask Copilot to add a "Dog Detail" screen that opens when a photo in MyDogsScreen is tapped, registered in the tab navigator with `tabBarButton: () => null` so it is not visible as its own tab.
4. Ask Copilot to add a delete option to each photo in MyDogsScreen, with an `Alert` confirmation before removal.

For each, before accepting the implementation, ask: did Copilot change anything outside the files this task actually required?

---

## Reflection

Once you have completed the parts above, answer the following, either for yourself or to discuss with your coach:

1. Which parts of building Dogstagram were well suited to delegating to Copilot, and which needed the most correction from you?
2. Did any prompt produce a plan or implementation that quietly did more than you asked for? What was it, and did you catch it before accepting the change?
3. Compare the permission-handling code in Part 2 and the auth code in Part 4 against [lesson.md](./lesson.md)'s reference implementation. Where did they differ, and was the difference an improvement, a regression, or just a different valid approach?
4. Would you have caught the wallpaper asset path issue in Part 1, or the Android permission-check skip in Part 2, if you had not been specifically told to check for them? What does that suggest about reviewing AI-generated code in general?

---

## Additional Resources

- [Tutorial: Work with agents in VS Code](https://code.visualstudio.com/docs/agents/agents-tutorial)
- [Build with agents in VS Code](https://code.visualstudio.com/docs/agents/overview)
- [Use chat in VS Code](https://code.visualstudio.com/docs/chat/chat-overview)
- [Best practices for using GitHub Copilot](https://docs.github.com/en/copilot/get-started/best-practices)
- See also: [ai-vscode-copilot/suggested-lesson-outline.md](../ai-vscode-copilot/suggested-lesson-outline.md) for the fundamentals of prompt structure and Agent mode used throughout this guide.
