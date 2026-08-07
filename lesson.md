# Lesson 2.19: Building a Sample App II - Dogstagram (cont'd)

## Overview

- **Duration:** ~2 hours (hands-on lab)
- **Prerequisites:** Lesson 2.16 - Building a Sample App I

## Learning Objectives

By the end of this lesson, you will be able to:

1. **Set up** bottom-tab navigation with React Navigation, splitting a single-screen app into multiple screens
2. **Integrate** `expo-image-picker` to let users pick from the photo library or take a new photo, with correct iOS permission handling
3. **Build** a complete authentication flow with login and register screens, and add biometric login using `expo-local-authentication`

## Introduction

In this session you continue the Dogstagram app from Lesson 2.16. At the end of 2.16, Dogstagram was a single screen: a header, a "Get Dog" button that fetched a random dog photo from a public API, and a scrollable gallery of the photos collected so far. Lesson 2.18 built a separate practice app to cover the camera, QR scanning, and location, so Dogstagram itself has not changed since 2.16 and still has no navigation.

Today you turn that single screen into a real multi-screen app. You will install React Navigation and split the existing screen into an ExploreScreen behind a bottom-tab navigator, alongside new MyDogsScreen, AddDogScreen, and SettingsScreen tabs. Then you will wire up the camera and photo library on AddDogScreen, build a real authentication flow with Login and Register screens, and add biometric login as a native shortcut. When you are done, Dogstagram will be a complete, navigable app that uses three native device capabilities.

---

## Starting Point

This lesson continues from the end of Lesson 2.16. Your `dogstagram` project should have:

- `App.js` with a single screen: font loading, a header, a "Get Dog" / "Clear" button pair, and a `FlatList` gallery of fetched dog photos
- `components/Button.js` and `components/LoadingOverlay.js`
- `styles/colors.js` with the app's color tokens

There is no navigation, no additional screens, and no authentication yet. If you did not complete 2.16, ask your instructor for the starter files.

---

## Part 1: From One Screen to a Navigable App

### Installing React Navigation

Install the navigation container, the bottom-tabs navigator, and their native dependencies in one go:

```bash
npx expo install @react-navigation/native @react-navigation/bottom-tabs react-native-screens react-native-safe-area-context @react-native-vector-icons/ionicons
```

`@react-navigation/native` provides `NavigationContainer`, the component that owns the overall navigation state. `@react-navigation/bottom-tabs` provides the tab navigator itself. `react-native-screens` and `react-native-safe-area-context` are native dependencies that React Navigation relies on for performance and safe-area handling; `npx expo install` picks versions compatible with your Expo SDK automatically. `@react-native-vector-icons/ionicons` supplies the icons for the tab bar.

> `@expo/vector-icons` still works but is being phased out in favor of `@react-native-vector-icons`. Use `@react-native-vector-icons/ionicons` for any new icon work going forward.

### Creating the screens folder and migrating to ExploreScreen

Create a `screens/` folder and a `navigation/` folder inside your project:

```
dogstagram/
  navigation/
  screens/
  components/
  styles/
  App.js
```

Create `screens/ExploreScreen.js` and move the entire contents of your current `App.js` into it, renaming the component from `App` to `ExploreScreen`:

```jsx
// screens/ExploreScreen.js
import { useState, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  ImageBackground,
  FlatList,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Button from "../components/Button";
import * as Crypto from "expo-crypto";
import { Colors } from "../styles/colors";
import LoadingOverlay from "../components/LoadingOverlay";

const API_URL = "https://dog.ceo/api/breeds/image/random";

const renderDogItem = ({ item }) => (
  <Image source={{ uri: item.url }} style={styles.dogImage} />
);

export default function ExploreScreen() {
  const [dogs, setDogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef(null);

  const getDog = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }
      const data = await response.json();
      setDogs((prevDogs) => [
        ...prevDogs,
        { id: Crypto.randomUUID(), url: data.message },
      ]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToEnd = () => {
    flatListRef.current.scrollToEnd({ animated: true });
  };

  const handleClearDogs = () => {
    if (dogs.length === 0) {
      Alert.alert("Clear Dogs", "There are no dogs to clear.", [
        { text: "Okayyy..." },
      ]);
      return;
    }

    Alert.alert("Clear Dogs", "Are you sure you want to clear all dogs?", [
      { text: "Cancel", style: "cancel" },
      { text: "Clear", style: "destructive", onPress: () => setDogs([]) },
    ]);
  };

  return (
    <LinearGradient
      colors={[Colors.PRIMARY_LIGHT_2, Colors.PRIMARY_LIGHT_1]}
      style={{ flex: 1 }}
    >
      <ImageBackground
        source={require("../assets/images/wallpaper.jpg")}
        style={{ flex: 1 }}
        imageStyle={{ opacity: 0.2 }}
      >
        <View style={styles.container}>
          <Text style={styles.appHeader}>🐶 Dogstagram</Text>
          <Text style={styles.welcomeText}>👋 Welcome! Get a dog!</Text>

          <View style={styles.buttonsContainer}>
            <Button onPress={getDog}>Get Dog</Button>
            <Button onPress={handleClearDogs}>Clear</Button>
          </View>

          <View style={styles.dogsContainer}>
            <FlatList
              showsVerticalScrollIndicator={false}
              onContentSizeChange={scrollToEnd}
              ref={flatListRef}
              data={dogs}
              keyExtractor={(dog) => dog.id}
              renderItem={renderDogItem}
              ListEmptyComponent={<Text>🫤 No dogs yet!</Text>}
            />
            {isLoading && <LoadingOverlay />}
          </View>
        </View>
      </ImageBackground>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  appHeader: {
    fontFamily: "Rubik_700Bold",
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 20,
    textAlign: "center",
    color: Colors.PRIMARY,
  },
  welcomeText: {
    fontFamily: "Rubik_400Regular",
    textAlign: "center",
    marginBottom: 10,
  },
  buttonsContainer: {
    flexDirection: "row",
    gap: 15,
    marginBottom: 20,
    justifyContent: "center",
  },
  dogsContainer: {
    flex: 1,
    alignItems: "center",
  },
  dogImage: {
    width: 300,
    height: 300,
    borderRadius: 10,
    marginBottom: 20,
  },
});
```

Compare this to the original `App.js` and notice what changed along the way:

- **Removed `SafeAreaProvider` and `SafeAreaView` entirely.** `NavigationContainer`, the tab navigator, and its headers already handle safe-area insets for every screen internally. `react-native-safe-area-context` is still installed, since React Navigation depends on it under the hood, but the lesson code no longer imports it directly.
- **Removed font loading (`useFonts` and the `fontsLoaded` check).** Fonts only need to load once, so this stays in `App.js`. A screen should not have to worry about whether the app's fonts have loaded yet.
- **Updated asset paths.** `require("./assets/images/wallpaper.jpg")` becomes `require("../assets/images/wallpaper.jpg")`, since the file now lives one folder deeper, inside `screens/`.

> **`useFonts` moves, `SafeAreaProvider` does not.** Font loading still needs to happen once, so it moves to `App.js` in the next step. `SafeAreaProvider` is not needed anywhere in this app once `NavigationContainer` is in place.

### Adding the stub screens

Create three minimal screens. Each just renders its name for now so you can verify the tabs work before filling in real content.

```jsx
// screens/MyDogsScreen.js
import { StyleSheet, Text, View } from "react-native";

export default function MyDogsScreen() {
  return (
    <View style={styles.container}>
      <Text>My Dogs</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center" },
});
```

Create `screens/AddDogScreen.js` and `screens/SettingsScreen.js` following the same pattern, substituting the component name and label text for each.

### Adding a white color token

The tab navigator needs a white color for its header text, which `styles/colors.js` does not have yet. Add it:

```js
// styles/colors.js
export const Colors = {
  PRIMARY: "#e8590c",
  PRIMARY_LIGHT_1: "#fff4e6",
  PRIMARY_LIGHT_2: "#ffc078",
  WHITE: "#fff",
};
```

### Building the tab navigator

Create `navigation/TabNavigator.js`:

```jsx
// navigation/TabNavigator.js
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "@react-native-vector-icons/ionicons";
import { Colors } from "../styles/colors";
import ExploreScreen from "../screens/ExploreScreen";
import MyDogsScreen from "../screens/MyDogsScreen";
import AddDogScreen from "../screens/AddDogScreen";
import SettingsScreen from "../screens/SettingsScreen";

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: Colors.PRIMARY },
        headerTintColor: Colors.WHITE,
        headerTitleStyle: { fontFamily: "Rubik_700Bold" },
        tabBarActiveTintColor: Colors.PRIMARY,
        tabBarLabelStyle: { fontFamily: "Rubik_400Regular" },
      }}
    >
      <Tab.Screen
        name="Explore"
        component={ExploreScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="compass" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="MyDogs"
        component={MyDogsScreen}
        options={{
          title: "My Dogs",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="paw" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="AddDog"
        component={AddDogScreen}
        options={{
          title: "Add Dog",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="add-circle" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
```

The route `name` values (`"Explore"`, `"MyDogs"`, `"AddDog"`, `"Settings"`) are what you pass to `navigation.navigate(...)` later in the lesson, so keep them in mind. `options.title` overrides the header and tab label when the route name itself would look wrong to a user, for example `"MyDogs"` displaying as "My Dogs".

> **Referencing `"Rubik_700Bold"` by name is safe here.** `TabNavigator` only ever renders after `App.js` confirms `fontsLoaded` is `true`, so the font is guaranteed to be registered before this component mounts.

### Wiring up App.js

Replace `App.js` with a slim entry point that owns font loading and the navigation container:

```jsx
// App.js
import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { Rubik_400Regular, Rubik_700Bold } from "@expo-google-fonts/rubik";
import { useFonts } from "expo-font";

import TabNavigator from "./navigation/TabNavigator";
import LoadingOverlay from "./components/LoadingOverlay";

export default function App() {
  const [fontsLoaded] = useFonts({
    Rubik_400Regular,
    Rubik_700Bold,
  });

  if (!fontsLoaded) {
    return <LoadingOverlay />;
  }
  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <TabNavigator />
    </NavigationContainer>
  );
}
```

**Device check:** four tabs appear at the bottom (Explore, My Dogs, Add Dog, Settings), each with an icon. The Explore tab reproduces the original single-screen app exactly: pressing "Get Dog" fetches and displays a photo, "Clear" empties the list. The other three tabs show placeholder text.

> **Common mistake:** forgetting to update the `require("./assets/images/wallpaper.jpg")` path when moving code into `screens/ExploreScreen.js`. Any relative path that worked from the project root needs an extra `../` once the file moves one level into `screens/`.

---

## Part 2: Image Picker on AddDogScreen

AddDogScreen uses two functions from `expo-image-picker`: `launchImageLibraryAsync`, which opens the photo library exactly as it did on HomeScreen in Lesson 2.18, and `launchCameraAsync`, which lets the user take a new photo.

`launchCameraAsync` is not the same thing as the `expo-camera` package used for CameraScreen in 2.18. `expo-camera` embeds a live viewfinder (`CameraView`) directly inside your own screen, giving you full control over the UI: a custom shutter button, a flip-camera toggle, QR scanning on the live feed, and so on. `launchCameraAsync` instead hands off to the device's native camera app UI, the same screen you would see if you opened the Camera app directly, and returns control to your app once the user takes a photo or cancels. AddDogScreen just needs a single photo with no custom camera UI, so the lighter-weight `launchCameraAsync` is the better fit here; a live in-app viewfinder like 2.18's would be overkill.

### Installing the library

```bash
npx expo install expo-image-picker
```

### Configuring build-time permissions

As in Lesson 2.18, `expo-image-picker` needs its permission strings declared in `app.json` before the app is built, not just requested at runtime. This time AddDogScreen calls both `launchImageLibraryAsync` and `launchCameraAsync`, so both `photosPermission` and `cameraPermission` need to be declared, unlike 2.18's HomeScreen, which only used the library picker and needed `photosPermission` alone.

Open `app.json` and add the plugin entry to the existing `plugins` array:

```json
// app.json
{
  "expo": {
    "plugins": [
      "expo-font",
      "@react-native-vector-icons/ionicons",
      [
        "expo-image-picker",
        {
          "photosPermission": "Allow $(PRODUCT_NAME) to access your photos.",
          "cameraPermission": "Allow $(PRODUCT_NAME) to access your camera."
        }
      ]
    ]
  }
}
```

> **Expo Go ignores this.** As noted in 2.18, `app.json` plugin config has no effect while testing in Expo Go, since Expo Go is already a compiled app with its own generic permission strings. The runtime permission check in the next section is still what matters during the lab. The `app.json` entry only takes effect in a real build, including the EAS build near the end of this lesson.

### Setting up state and options

Open `screens/AddDogScreen.js` and replace it with the following shell. Read through it before continuing.

```jsx
// screens/AddDogScreen.js
import {
  launchCameraAsync,
  launchImageLibraryAsync,
  useCameraPermissions,
} from "expo-image-picker";
import { useState } from "react";
import { Alert, Image, Platform, StyleSheet, Text, View } from "react-native";
import { Colors } from "../styles/colors";
import Button from "../components/Button";

const imageOptions = {
  mediaTypes: ["images"],
  allowsEditing: true,
  aspect: [1, 1],
  quality: 0.8,
};

export default function AddDogScreen({ navigation }) {
  const [image, setImage] = useState(null);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();

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
// screens/AddDogScreen.js
const pickImageHandler = async () => {
  const result = await launchImageLibraryAsync(imageOptions);
  if (!result.canceled) {
    setImage(result.assets[0].uri);
  }
};
```

`launchImageLibraryAsync` opens the system photo picker. When the user selects a photo, `result.canceled` is `false` and `result.assets` contains an array of selected items. You read `assets[0].uri` to get the file path.

Notice there is no permission check before this call, unlike the camera handler below. `launchImageLibraryAsync` triggers the system permission dialog automatically the first time it is called, the same behaviour as HomeScreen's gallery picker in Lesson 2.18. The `photosPermission` string declared in `app.json` is what that automatic dialog shows; there is nothing further to check in your own code.

### Taking a photo with the camera

iOS requires explicit camera permission before your app can open the camera. Android manages this at the OS level at runtime, so no extra check is needed in the app code.

Add the `checkCameraPermission` helper:

```js
// screens/AddDogScreen.js
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
// screens/AddDogScreen.js
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
// screens/AddDogScreen.js
const confirmImageHandler = () => {
  navigation.navigate("MyDogs", { dog: image });
};
```

This navigates to the MyDogs tab and passes the image URI as a route parameter. MyDogsScreen will read this parameter in Part 3.

### Updating the JSX

Replace the `return` statement with:

```jsx
// screens/AddDogScreen.js
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

## Part 3: Receiving the Photo in MyDogsScreen

With a real backend, saving a dog photo would mean uploading the image from AddDogScreen to a server, then MyDogsScreen would fetch the saved list of photos from that server, the same way ExploreScreen fetches photos from the public dog API. There is no backend for Dogstagram yet, so this lesson simulates that behaviour instead: the image URI is passed directly from AddDogScreen to MyDogsScreen via route params, and MyDogsScreen keeps it in local `myDogs` state rather than in a server response.

Open `screens/MyDogsScreen.js` and replace it with:

```jsx
// screens/MyDogsScreen.js
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
3. Look closely at `onContentSizeChange={scrollToEnd}` on the current `FlatList`. It force-scrolls to the bottom every time the list's content size changes, including every dog added by infinite scroll. That fights the user's own scroll position and can trigger `onEndReached` again immediately. It needs to move somewhere more targeted than "any content size change."
4. You can also remove the vertical scroll indicator for a cleaner look with `showsVerticalScrollIndicator={false}`.

<details>
<summary>Reference solution</summary>

`scrollToEnd` should only fire for the button-triggered fetch, where jumping to the newly added photo is the whole point, not for infinite scroll, where the user is already scrolling on their own. Move it out of `onContentSizeChange` and into the button's handler instead:

```js
// screens/ExploreScreen.js
const handleGetDogPress = async () => {
  await getDog();
  scrollToEnd();
};

const handleEndReached = () => {
  if (!isLoading && dogs.length > 0) {
    getDog();
  }
};
```

`getDog` is `async` and updates `dogs` internally before it resolves, so `await getDog()` guarantees the new photo has already been added to state by the time `scrollToEnd()` runs.

Update the "Get Dog" button and the `FlatList`:

```jsx
// screens/ExploreScreen.js
<Button onPress={handleGetDogPress}>Get Dog</Button>
```

```jsx
// screens/ExploreScreen.js
<FlatList
  showsVerticalScrollIndicator={false}
  ref={flatListRef}
  data={dogs}
  keyExtractor={(dog) => dog.id}
  renderItem={renderDogItem}
  ListEmptyComponent={<Text>😊 No dogs yet!</Text>}
  onEndReached={handleEndReached}
  onEndReachedThreshold={0.1}
/>
```

`onContentSizeChange` is removed entirely; `flatListRef` stays, since `scrollToEnd` still needs it.

</details>

> **Why this matters:** `onContentSizeChange` reacts to any change in the list's size, with no way to tell why it changed. Once a list can grow from more than one source, button tap or infinite scroll, "scroll to bottom on every resize" stops being safe, and the scroll behaviour needs to be triggered from the specific action that should cause it.

---

## Part 4: Authentication Flow

### Setting up AuthContext

Create `contexts/AuthContext.js` if it does not already exist:

```jsx
// contexts/AuthContext.js
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
// screens/LoginScreen.js
import { useContext, useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Ionicons from "@react-native-vector-icons/ionicons";
import { AuthContext } from "../contexts/AuthContext";
import Button from "../components/Button";
import { Colors } from "../styles/colors";

export default function LoginScreen({ navigation }) {
  const { login } = useContext(AuthContext);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  return (
    <View style={styles.container}>
      <Text style={styles.appHeader}>🐶 Dogstagram</Text>
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
  appHeader: {
    fontFamily: "Rubik_700Bold",
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 20,
    textAlign: "center",
    color: Colors.PRIMARY,
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
// screens/RegisterScreen.js
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

Create `navigation/AuthStackNavigator.js`:

```jsx
// navigation/AuthStackNavigator.js
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
// App.js
import { useContext } from "react";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { Rubik_400Regular, Rubik_700Bold } from "@expo-google-fonts/rubik";
import { useFonts } from "expo-font";

import { AuthContext, AuthProvider } from "./contexts/AuthContext";
import TabNavigator from "./navigation/TabNavigator";
import AuthStackNavigator from "./navigation/AuthStackNavigator";
import LoadingOverlay from "./components/LoadingOverlay";

function NavigationApp() {
  const { isAuthenticated } = useContext(AuthContext);
  return isAuthenticated ? <TabNavigator /> : <AuthStackNavigator />;
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Rubik_400Regular,
    Rubik_700Bold,
  });

  if (!fontsLoaded) {
    return <LoadingOverlay />;
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

### Wiring up the logout button

Wire up the logout button on SettingsScreen:

```jsx
// screens/SettingsScreen.js
import { useContext } from "react";
import { StyleSheet, Text, View } from "react-native";
import { AuthContext } from "../contexts/AuthContext";
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

Test: press Login to enter the main app, then use the Logout button on Settings to confirm it returns to the Login screen.

> **Auth state is session-only, on purpose.** `isAuthenticated` lives in memory via `useState`, so closing and reopening the app returns to the Login screen every time. Persisting a session normally means storing a token on the device between launches, but a plain key-value store like `AsyncStorage` is not encrypted, which makes it a poor fit for anything auth-related. The safer option, `expo-secure-store`, backed by the device's Keychain or Keystore, is worth knowing about if you build this further, but is out of scope for this lesson.

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

In `contexts/AuthContext.js`, add this import and function:

```js
// contexts/AuthContext.js
import * as LocalAuthentication from "expo-local-authentication";

const biometricLogin = async () => {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  const isEnrolled = await LocalAuthentication.isEnrolledAsync();
  if (!hasHardware || !isEnrolled) return false;
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: "Authenticate with Biometrics",
  });
  if (result.success) {
    setIsAuthenticated(true);
    return true;
  }
  return false;
};
```

Add `biometricLogin` to the provider value:

```jsx
// contexts/AuthContext.js
<AuthContext.Provider value={{ isAuthenticated, login, logout, biometricLogin }}>
```

In `LoginScreen.js`, destructure `biometricLogin` from context and add a `TouchableOpacity` below the buttons:

```jsx
// screens/LoginScreen.js
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

---

## Part 5: Building an Android APK with EAS

So far you have only run Dogstagram inside Expo Go, which requires a laptop and a live development server. EAS (Expo Application Services) builds a standalone binary that installs directly on a device, without Expo Go or a development server running.

This section produces an Android APK, a file format any Android device can install directly. Producing an installable iOS build works differently: it requires a paid Apple Developer account and, ultimately, distribution through the App Store or TestFlight. That is out of scope for this lesson.

### Setting the app icon

`assets/icon.png` and `assets/adaptive-icon.png` are still the generic placeholder images `create-expo-app` scaffolded the project with. Expo Go never showed them, since Expo Go uses its own icon, but a standalone build uses these files as the actual home screen icon, so this is the point where a generic icon becomes visible.

Replace both files with a real Dogstagram icon before continuing:

- `assets/icon.png`: a 1024x1024 PNG, used as the app icon on iOS and as a fallback on Android.
- `assets/adaptive-icon.png`: a 1024x1024 PNG, used as the foreground layer of the Android adaptive icon. Keep the artwork inside the center of the image; Android's launcher crops the outer portion into a circle, squircle, or other shape depending on the device, so anything near the edges may not be visible. Save this one with a transparent background rather than a solid color, so the `backgroundColor` set below shows through instead of being covered by whatever color the image happened to be exported with.

`app.json` already points `icon` and `android.adaptiveIcon.foregroundImage` at these two paths. Update `android.adaptiveIcon.backgroundColor` to match the app's brand color instead of the default white, so the icon looks consistent with `icon.png`'s cream background:

```json
// app.json
{
  "expo": {
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#fff4e6"
      }
    }
  }
}
```

### Installing the EAS CLI and logging in

```bash
npm install --global eas-cli
eas login
```

`eas login` requires a free Expo account. If you do not have one, create one at the prompt.

Verify you are logged in as the correct account:

```bash
eas whoami
```

### Initializing git

EAS Build packages your project by archiving what git is tracking, not by copying the folder directly, so the project must be inside a git repository before running `eas build:configure` or `eas build`. If one does not exist yet, initialize it and commit everything from the `dogstagram` project root:

```bash
git init
git add .
git commit -m "Initial commit"
```

> **Uncommitted or untracked files are silently left out of the build.** Because EAS Build archives the git-tracked tree, any file you have not run `git add` on, including a screen or asset you created earlier in this lesson, will not be part of what gets uploaded. If a build behaves as though a recent change never happened, check `git status` first.

### Configuring the project

From the `dogstagram` project root:

```bash
eas build:configure
```

This prompts you with a couple of questions:

```
Would you like to automatically create an EAS project for @your-username/dogstagram?
Which platforms would you like to configure for EAS Build? › Android
```

Answer yes to creating the EAS project, this links the local project to a project on Expo's servers, and select only **Android**, since this lesson does not cover an iOS build.

This creates an `eas.json` file and links the project to your Expo account. Open `eas.json` and edit the `preview` profile so it produces an APK instead of the default AAB format. An AAB is the format the Google Play Store expects, but it cannot be installed directly on a device the way an APK can.

```json
// eas.json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {}
  }
}
```

### Running the build

```bash
eas build --platform android --profile preview
```

The first time you build, EAS prompts for two more things:

```
? What would you like your Android application id to be? › com.yourname.dogstagram
? Generate a new Android Keystore? › (Y/n)
```

The application id (also called the package name) uniquely identifies your app on a device and, later, on the Play Store; `com.yourname.dogstagram` following reverse-domain style is fine for this lesson. EAS saves your answer into `app.json` under `android.package`, so you are only asked once.

The keystore is the private key used to cryptographically sign the APK. Answer yes to let EAS generate and manage one for you; it is stored on Expo's servers and reused automatically for every future build of this project, so you do not need to keep track of it yourself.

EAS then compresses and uploads your project, computes a fingerprint of it, and queues the build:

```
Compressing project files and uploading to EAS Build.
✔ Uploaded to EAS
✔ Computed project fingerprint

See logs: https://expo.dev/accounts/yourname/projects/dogstagram/builds/...

Waiting for build to complete. You can press Ctrl+C to exit.
⠙ Build in progress...
```

This uploads your project to Expo's build servers and compiles it there, so no local Android SDK installation is required. On a free Expo account, expect the build to take around 8 to 10 minutes; the "See logs" link opens the Expo dashboard, where you can watch the build progress live if you do not want to wait in the terminal.

When the build finishes, EAS prints a QR code and a link to the build page:

```
✔ Build finished

  [QR code]

🤖 Open this link on your Android devices (or scan the QR code) to install the app:
https://expo.dev/accounts/yourname/projects/dogstagram/builds/...

? Install and run the Android build on an emulator? › (Y/n)
```

Answer `n` if you are installing on a physical device via the QR code, which is the typical case; only answer `y` if you have an Android emulator running locally and want EAS to install the build there directly.

> **Distributing the APK.** Anyone with the download link can install the APK, provided their device allows installing apps from outside the Google Play Store ("unknown sources"). This is the fastest way to get a build onto a learner's or reviewer's device without publishing to the Play Store.

**Device check:** scan the QR code or download the APK on an Android device, install it, and confirm the app opens and behaves the same as it did in Expo Go.

> **Going further: publishing to an app store.** An APK shared directly is fine for testing, but the Play Store and App Store both expect a different submission process, an AAB for Android and a signed `.ipa` for iOS, submitted through their respective developer consoles. `eas submit` automates uploading a build to either store. This is out of scope for this lesson, but see [Creating your build](https://docs.expo.dev/deploy/build-project/) in the Expo docs if you want to take a project further after the course.

---

## Bonus Challenges

1. Add haptic feedback to the Save button on AddDogScreen using `expo-haptics`, the same package from Lesson 2.18. Install it, import it with `import * as Haptics from "expo-haptics"`, and call `Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)` inside `confirmImageHandler`. No `app.json` plugin or permission request is needed.
2. Persist the login session with `expo-secure-store` instead of leaving it in memory. Store a token on login, read it back with a mount-time `useEffect` in `AuthProvider`, and clear it on logout. Unlike `AsyncStorage`, `expo-secure-store` is backed by the device's Keychain (iOS) or Keystore (Android), which makes it appropriate for a real token.
3. Add a "Dog Detail" screen that opens when the user taps any image in MyDogsScreen. Display the image full-screen with a back button. Register it in the tab navigator with `tabBarButton: () => null` so it does not appear as a visible tab.
4. Add a delete button to each dog in MyDogsScreen (a long-press handler or a trash icon overlay) with an `Alert` confirmation before the item is removed from state.

---

## Summary

- Moving from a single screen to a navigable app means extracting the existing screen's JSX into its own file under `screens/`, then wiring a `Tab.Navigator` in `NavigationContainer` around it and any new screens.
- `expo-image-picker` provides two launchers: `launchImageLibraryAsync` for the photo library and `launchCameraAsync` for the camera. Both return the same result shape. iOS requires explicit permission for the camera via `useCameraPermissions`.
- Image URIs from `expo-image-picker` are temporary cache paths. For permanent storage, upload to a server or copy to the documents directory.
- Route params (`navigation.navigate("Screen", { key: value })`) are the idiomatic way to pass data between screens in React Navigation. The receiving screen reads `route.params`.
- `isAuthenticated` in this lesson lives only in memory, so it resets on every app restart. Persisting a real session means storing a token on the device; `expo-secure-store`, not `AsyncStorage`, is the appropriate place for that, since `AsyncStorage` is unencrypted.
- `useContext` must be called inside a descendant of the provider. Separating `NavigationApp` from `App` is a clean way to read context after the provider has mounted.
- `expo-local-authentication` checks hardware availability and enrollment before prompting. Always guard with both checks to avoid errors on devices without biometric support.
- EAS Build compiles a standalone binary on Expo's servers. Setting `android.buildType` to `"apk"` in an `eas.json` profile produces a file installable directly on any Android device, without Expo Go or the Play Store. A comparable standalone iOS build requires a paid Apple Developer account and is out of scope here.

---

## Additional Resources

- [expo-image-picker - Expo docs](https://docs.expo.dev/versions/latest/sdk/imagepicker/)
- [expo-local-authentication - Expo docs](https://docs.expo.dev/versions/latest/sdk/local-authentication/)
- [expo-secure-store - Expo docs](https://docs.expo.dev/versions/latest/sdk/securestore/)
- [Passing parameters to routes - React Navigation docs](https://reactnavigation.org/docs/params)
- [React Navigation - Bottom Tabs](https://reactnavigation.org/docs/bottom-tab-navigator/)
- [EAS Build - Expo docs](https://docs.expo.dev/build/introduction/)
- [Building an APK for internal distribution - Expo docs](https://docs.expo.dev/build-reference/apk/)
