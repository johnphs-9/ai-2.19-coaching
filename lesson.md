# Lesson 2.19: Building a Sample App II - Dogstagram (cont'd)

## Overview

- **Duration:** ~2 hours (hands-on lab)
- **Prerequisites:** Lesson 2.18 - Integration of Native Device Capabilities

## Learning Objectives

By the end of this lesson, you will be able to:

1. **Integrate** `expo-image-picker` to let users pick from the photo library or take a new photo, with correct iOS permission handling
2. **Build** a complete authentication flow with login, register, and persistent session using `AsyncStorage`
3. **Add** biometric login using `expo-local-authentication` as a native device capability

## Introduction

In this session you continue the Dogstagram app from Lesson 2.18. At the start of that lesson, the app was a single-screen gallery. By the end of 2.18 it had a bottom-tab navigator, an ExploreScreen fetching dog photos from the API, a MyDogsScreen shell, an AddDogScreen shell, and a SettingsScreen placeholder.

Today you will finish the app: wire up the camera and photo library on AddDogScreen, build a real authentication flow with Login and Register screens, persist the login state so the user stays logged in after restarting the app, and add biometric login as a native shortcut. When you are done, Dogstagram will be a complete, navigable app that uses three native device capabilities.

---

## Starting Point

This lesson continues from the end of Lesson 2.18. Your `dogstagram` project should have:

- `App.js` with font loading, `AuthProvider`, `NavigationContainer`, and a `NavigationApp` function that switches between navigators
- `navigators/BottomTabNavigator.js` with four tabs: Explore, My Dogs, Add Dog, and Settings
- `navigators/AuthStackNavigator.js` with Login and Register screens (shells are fine)
- `screens/ExploreScreen.js` with the FlatList of dogs from the public API
- `screens/MyDogsScreen.js` and `screens/AddDogScreen.js` as shells
- `screens/SettingsScreen.js` as a placeholder
- `context/AuthContext.js` with `isAuthenticated`, `login`, and `logout`
- `components/Button.js`, `components/AppHeader.js`, and `styles/colors.js`

If you did not complete 2.18, ask your instructor for the starter files.

---

## Part 1: Image Picker on AddDogScreen

### Installing the library

```bash
npx expo install expo-image-picker
```

### Setting up state and options

Open `screens/AddDogScreen.js` and replace it with the following shell. Read through it before continuing.

```jsx
import {
  launchCameraAsync,
  launchImageLibraryAsync,
  useCameraPermissions,
} from "expo-image-picker";
import { useState } from "react";
import { Alert, Image, Platform, StyleSheet, Text, View } from "react-native";
import { Colors } from "../styles/colors";
import Button from "../components/Button";

export default function AddDogScreen({ navigation }) {
  const [image, setImage] = useState(null);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();

  const imageOptions = {
    mediaTypes: ["images"],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  };

  return (
    <View style={styles.container}>
      <Text style={styles.instructionText}>
        Choose an existing photo or take a new one.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.WHITE,
    alignItems: "center",
    padding: 10,
  },
  instructionText: {
    fontFamily: "Rubik_400Regular",
    textAlign: "center",
    paddingVertical: 20,
  },
  buttonsContainer: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  previewImage: {
    width: 200,
    height: 200,
    marginVertical: 10,
  },
});
```

`useCameraPermissions()` returns two values: the current permission object and a function to request the permission. This pattern mirrors how `useState` works. The permission object has a `status` field that is `"undetermined"`, `"denied"`, or `"granted"`.

### Picking from the gallery

Add the `pickImageHandler` function inside the component, above the `return`:

```js
const pickImageHandler = async () => {
  const result = await launchImageLibraryAsync(imageOptions);
  if (!result.canceled) {
    setImage(result.assets[0].uri);
  }
};
```

`launchImageLibraryAsync` opens the system photo picker. When the user selects a photo, `result.canceled` is `false` and `result.assets` contains an array of selected items. You read `assets[0].uri` to get the file path.

### Taking a photo with the camera

iOS requires explicit camera permission before your app can open the camera. Android manages this at the OS level at runtime, so no extra check is needed in the app code.

Add the `checkCameraPermission` helper:

```js
const checkCameraPermission = async () => {
  if (Platform.OS === "android") return true;

  if (cameraPermission.status === "undetermined") {
    const { granted } = await requestCameraPermission();
    return granted;
  }

  if (cameraPermission.status === "denied") {
    Alert.alert(
      "Camera Permissions Denied",
      "Please enable camera permissions in your settings for this app."
    );
    return false;
  }

  return true;
};
```

Then add `takeImageHandler`:

```js
const takeImageHandler = async () => {
  const permissionGranted = await checkCameraPermission();
  if (!permissionGranted) return;
  const result = await launchCameraAsync(imageOptions);
  if (!result.canceled) {
    setImage(result.assets[0].uri);
  }
};
```

> **`launchCameraAsync` vs `launchImageLibraryAsync`:** These are two separate functions with different purposes. `launchImageLibraryAsync` opens the photo library so the user can pick an existing image. `launchCameraAsync` opens the device camera so the user can take a new photo. Both return the same result shape, so the rest of the handler is identical.

### Confirming and passing the image to MyDogsScreen

Add the `confirmImageHandler` function:

```js
const confirmImageHandler = () => {
  navigation.navigate("MyDogs", { dog: image });
};
```

This navigates to the MyDogs tab and passes the image URI as a route parameter. MyDogsScreen will read this parameter in Part 2.

### Updating the JSX

Replace the `return` statement with:

```jsx
return (
  <View style={styles.container}>
    <Text style={styles.instructionText}>
      Choose an existing photo or take a new one.
    </Text>

    <View style={styles.buttonsContainer}>
      <Button onPress={pickImageHandler}>Pick a Photo</Button>
      <Button onPress={takeImageHandler}>Take a Photo</Button>
    </View>

    {!image && (
      <Text style={styles.instructionText}>No photo selected yet.</Text>
    )}

    {image && (
      <>
        <View>
          <Text style={styles.instructionText}>Preview</Text>
          <Image style={styles.previewImage} source={{ uri: image }} />
        </View>
        <View style={styles.buttonsContainer}>
          <Button onPress={confirmImageHandler}>Save</Button>
          <Button onPress={() => setImage(null)}>Clear</Button>
        </View>
      </>
    )}
  </View>
);
```

Test the flow: tap "Pick a Photo", select an image, confirm the preview appears, press "Save". The navigator should switch to My Dogs (the image will not appear there yet because MyDogsScreen is still a shell).

---

## Part 2: Receiving the Photo in MyDogsScreen

Open `screens/MyDogsScreen.js` and replace it with:

```jsx
import { randomUUID } from "expo-crypto";
import { useEffect, useState } from "react";
import { FlatList, Image, StyleSheet, Text, View } from "react-native";

export default function MyDogsScreen({ route }) {
  const [myDogs, setMyDogs] = useState([]);

  useEffect(() => {
    if (route.params?.dog) {
      setMyDogs((prevDogs) => [
        ...prevDogs,
        { id: randomUUID(), url: route.params.dog },
      ]);
    }
  }, [route.params?.dog]);

  return (
    <View style={styles.container}>
      <FlatList
        data={myDogs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Image style={styles.image} source={{ uri: item.url }} />
        )}
        ListEmptyComponent={
          <View style={{ padding: 20, alignItems: "center" }}>
            <Text>No dogs yet.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  image: {
    width: "100%",
    aspectRatio: 1,
  },
});
```

Two things to understand here:

**Watching a specific param.** The `useEffect` dependency is `route.params?.dog`, not `route.params`. If you depend on the whole params object, the effect re-runs whenever any param changes. Depending on a specific field means the effect only runs when a new dog URI arrives.

**Using `aspectRatio`.** Setting `width: "100%"` and `aspectRatio: 1` produces a square image that fills the screen width regardless of the device's dimensions. This is cleaner than computing pixel values from `Dimensions.get("window")`.

Test the complete flow now: Add Dog, pick or snap a photo, Save, and confirm it appears in My Dogs.

> **About image URIs:** The URI you receive from `expo-image-picker` points to a temporary file in the app's cache directory. It is valid for the current session, but the OS may delete it to free space when the app is in the background. In a production app you would upload the image to a server or copy it to the app's documents directory for permanent storage.

---

## Activity 1: Add Infinite Scroll to ExploreScreen

ExploreScreen currently loads a fixed batch of dogs on mount. Update it so more dogs load automatically as the user scrolls to the bottom of the list.

**Task:** Add `onEndReached` and `onEndReachedThreshold` to the FlatList on ExploreScreen so that `getDog` is called again each time the user approaches the end of the list.

**Hints:**

1. `FlatList` has an `onEndReached` prop that accepts a callback and `onEndReachedThreshold` that accepts a number between 0 and 1. A threshold of `0.1` fires the callback when the user is within 10% of the bottom.
2. Guard the handler: only call `getDog` if `!isLoading && dogs.length > 0`. Without the `dogs.length > 0` guard, `onEndReached` fires on the initial empty render before the first fetch completes, causing two simultaneous fetches.
3. You can also remove the vertical scroll indicator for a cleaner look with `showsVerticalScrollIndicator={false}`.

<details>
<summary>Reference solution</summary>

Add the handler function inside `ExploreScreen`:

```js
const handleEndReached = () => {
  if (!isLoading && dogs.length > 0) {
    getDog();
  }
};
```

Add the props to `FlatList`:

```jsx
<FlatList
  data={dogs}
  keyExtractor={(dog) => dog.id}
  renderItem={renderDogItem}
  showsVerticalScrollIndicator={false}
  ListEmptyComponent={<Text>😊 No dogs yet!</Text>}
  onEndReached={handleEndReached}
  onEndReachedThreshold={0.1}
/>
```

</details>

---

## Part 3: Authentication Flow

### Setting up AuthContext

Create `context/AuthContext.js` if it does not already exist:

```jsx
import { createContext, useState } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = async (username, password) => {
    // Call your API here in a real app.
    setIsAuthenticated(true);
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
```

### Creating LoginScreen

Create `screens/LoginScreen.js`:

```jsx
import { useContext, useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { AuthContext } from "../context/AuthContext";
import Button from "../components/Button";
import { Colors } from "../styles/colors";
import AppHeader from "../components/AppHeader";

export default function LoginScreen({ navigation }) {
  const { login } = useContext(AuthContext);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  return (
    <View style={styles.container}>
      <AppHeader />
      <Text style={styles.title}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <View style={styles.buttonsContainer}>
        <Button onPress={() => login(username, password)}>Login</Button>
        <Button onPress={() => navigation.navigate("Register")}>
          Register
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
  },
  title: {
    fontFamily: "Rubik_700Bold",
    color: Colors.PRIMARY,
    fontSize: 24,
    marginBottom: 24,
    fontWeight: 700,
  },
  input: {
    width: "70%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    padding: 8,
    marginBottom: 16,
  },
  buttonsContainer: {
    flexDirection: "row",
    gap: 10,
  },
});
```

### Creating RegisterScreen

Create `screens/RegisterScreen.js`:

```jsx
import { useState } from "react";
import { Alert, StyleSheet, Text, TextInput, View } from "react-native";
import Button from "../components/Button";
import { Colors } from "../styles/colors";

export default function RegisterScreen({ navigation }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = () => {
    Alert.alert(
      "Mock Registration",
      "This is just a mock registration function."
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <View style={styles.buttonsContainer}>
        <Button onPress={handleRegister}>Register</Button>
        <Button onPress={() => navigation.goBack()}>Back to Login</Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  title: {
    fontFamily: "Rubik_700Bold",
    color: Colors.PRIMARY,
    fontSize: 24,
    marginBottom: 24,
    fontWeight: 700,
  },
  input: {
    width: "70%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    padding: 8,
    marginBottom: 16,
  },
  buttonsContainer: {
    flexDirection: "row",
    gap: 10,
  },
});
```

### Setting up AuthStackNavigator

Install the native stack package if not already installed:

```bash
npx expo install @react-navigation/native-stack
```

Create `navigators/AuthStackNavigator.js`:

```jsx
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";

const Stack = createNativeStackNavigator();

export default function AuthStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}
```

### Wiring navigation switching in App.js

Update `App.js` so that `AuthProvider` wraps everything and a `NavigationApp` function reads `isAuthenticated` to decide which navigator to show:

```jsx
import { useContext, useEffect } from "react";
import { ActivityIndicator } from "react-native";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { useFonts, Rubik_400Regular, Rubik_700Bold } from "@expo-google-fonts/rubik";
import { NavigationContainer } from "@react-navigation/native";
import { AuthContext, AuthProvider } from "./context/AuthContext";
import BottomTabNavigator from "./navigators/BottomTabNavigator";
import AuthStackNavigator from "./navigators/AuthStackNavigator";
import { Colors } from "./styles/colors";

SplashScreen.preventAutoHideAsync();

function NavigationApp() {
  const { isAuthenticated } = useContext(AuthContext);
  return isAuthenticated ? <BottomTabNavigator /> : <AuthStackNavigator />;
}

export default function App() {
  const [fontsLoaded] = useFonts({ Rubik_400Regular, Rubik_700Bold });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return <ActivityIndicator size="large" color={Colors.PRIMARY} />;
  }

  return (
    <AuthProvider>
      <NavigationContainer>
        <StatusBar style="dark" />
        <NavigationApp />
      </NavigationContainer>
    </AuthProvider>
  );
}
```

> **Why `NavigationApp` is a separate function:** `useContext(AuthContext)` can only be called inside a component that is a descendant of the provider. If you tried to call it directly inside `App`, the call would run before `AuthProvider` is mounted and the context value would be `undefined`.

Test: launch the app and confirm the Login screen appears. Press Login and confirm the main tabs appear.

---

## Part 4: Persisting Login State

Right now, closing and reopening the app returns the user to the Login screen. You will fix this by storing a token in `AsyncStorage`.

### Installing AsyncStorage

```bash
npx expo install @react-native-async-storage/async-storage
```

### Updating AuthContext

Replace `context/AuthContext.js` with:

```jsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useEffect, useState } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuthentication = async () => {
      const token = await AsyncStorage.getItem("token");
      if (token) setIsAuthenticated(true);
    };
    checkAuthentication();
  }, []);

  const login = async (username, password) => {
    // Call your API here in a real app and store the real token.
    await AsyncStorage.setItem("token", "dummy-token");
    setIsAuthenticated(true);
  };

  const logout = async () => {
    await AsyncStorage.removeItem("token");
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
```

The `useEffect` runs once when `AuthProvider` mounts. It reads the stored token and, if one exists, sets `isAuthenticated` to `true` immediately without requiring the user to log in again.

> **AsyncStorage is not encrypted.** It is a plain key-value store on the device file system. It is suitable for session tokens in a learning context, but a production app that stores sensitive credentials should use `expo-secure-store` instead, which uses the device's secure enclave.

Test: log in, close the app completely (not just background it), reopen it. The app should open directly on the Explore tab without showing the Login screen.

Also wire up the logout button on SettingsScreen:

```jsx
import { useContext } from "react";
import { StyleSheet, Text, View } from "react-native";
import { AuthContext } from "../context/AuthContext";
import Button from "../components/Button";

export default function SettingsScreen() {
  const { logout } = useContext(AuthContext);

  return (
    <View style={styles.container}>
      <Text>Settings</Text>
      <Button onPress={logout}>Logout</Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
});
```

---

## Activity 2: Biometric Login

Add a biometric login option to LoginScreen. On a device with Face ID or a fingerprint reader, the user can authenticate without typing their credentials.

**Task:** Add a biometric login function to `AuthContext` and a fingerprint button to `LoginScreen` that calls it.

**Hints:**

1. Install: `npx expo install expo-local-authentication`
2. `LocalAuthentication.hasHardwareAsync()` returns `true` if the device has biometric hardware.
3. `LocalAuthentication.isEnrolledAsync()` returns `true` if the user has set up biometrics on this device.
4. `LocalAuthentication.authenticateAsync({ promptMessage: "Authenticate with Biometrics" })` shows the system biometric prompt. The return value has a `success` boolean.
5. If both hardware checks pass and `result.success` is `true`, call `setIsAuthenticated(true)` directly inside the context function.
6. Expose `biometricLogin` from `AuthContext.Provider` and call it from a `TouchableOpacity` with an Ionicons `"finger-print"` icon in `LoginScreen`.

<details>
<summary>Reference solution</summary>

In `context/AuthContext.js`, add this import and function:

```js
import * as LocalAuthentication from "expo-local-authentication";

const biometricLogin = async () => {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  const isEnrolled = await LocalAuthentication.isEnrolledAsync();
  if (!hasHardware || !isEnrolled) return false;
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: "Authenticate with Biometrics",
  });
  if (result.success) {
    await AsyncStorage.setItem("token", "dummy-token");
    setIsAuthenticated(true);
    return true;
  }
  return false;
};
```

Add `biometricLogin` to the provider value:

```jsx
<AuthContext.Provider value={{ isAuthenticated, login, logout, biometricLogin }}>
```

In `LoginScreen.js`, destructure `biometricLogin` from context and add a `TouchableOpacity` below the buttons:

```jsx
const { login, biometricLogin } = useContext(AuthContext);

// In JSX, below the buttonsContainer:
<TouchableOpacity
  onPress={biometricLogin}
  style={{ marginTop: 20, justifyContent: "center", alignItems: "center" }}
>
  <Ionicons name="finger-print" size={48} color={Colors.PRIMARY} />
  <Text style={{ marginTop: 10, fontFamily: "Rubik_400Regular" }}>
    Login with Biometric
  </Text>
</TouchableOpacity>
```

</details>

> **Testing on a simulator:** Face ID can be triggered from the simulator menu under Features. Fingerprint is not available on iOS simulators but works on Android emulators. Test on a physical device for the most accurate result.

---

## Bonus Challenges

1. Add a loading state to `AuthContext` (a third piece of state, `isLoading`, initialised to `true`) that prevents `NavigationApp` from rendering until the AsyncStorage check resolves. This eliminates the brief flash of the Login screen on startup when the user is already authenticated.
2. Add a "Dog Detail" screen that opens when the user taps any image in MyDogsScreen. Display the image full-screen with a back button. Register it in the tab navigator with `tabBarButton: () => null` so it does not appear as a visible tab.
3. Replace the dummy token in `login` with a real API call to the course test server. Store the JWT you receive and send it as an `Authorization: Bearer <token>` header on all subsequent requests.
4. Add a delete button to each dog in MyDogsScreen (a long-press handler or a trash icon overlay) with an `Alert` confirmation before the item is removed from state.

---

## Summary

- `expo-image-picker` provides two launchers: `launchImageLibraryAsync` for the photo library and `launchCameraAsync` for the camera. Both return the same result shape. iOS requires explicit permission for the camera via `useCameraPermissions`.
- Image URIs from `expo-image-picker` are temporary cache paths. For permanent storage, upload to a server or copy to the documents directory.
- Route params (`navigation.navigate("Screen", { key: value })`) are the idiomatic way to pass data between screens in React Navigation. The receiving screen reads `route.params`.
- `AsyncStorage` provides simple key-value persistence across app launches. It is not encrypted; use `expo-secure-store` for sensitive data in production.
- `useContext` must be called inside a descendant of the provider. Separating `NavigationApp` from `App` is a clean way to read context after the provider has mounted.
- `expo-local-authentication` checks hardware availability and enrollment before prompting. Always guard with both checks to avoid errors on devices without biometric support.

---

## Additional Resources

- [expo-image-picker - Expo docs](https://docs.expo.dev/versions/latest/sdk/imagepicker/)
- [expo-local-authentication - Expo docs](https://docs.expo.dev/versions/latest/sdk/local-authentication/)
- [AsyncStorage - React Native Community docs](https://react-native-async-storage.github.io/async-storage/)
- [expo-secure-store - Expo docs](https://docs.expo.dev/versions/latest/sdk/securestore/)
- [Passing parameters to routes - React Navigation docs](https://reactnavigation.org/docs/params)
