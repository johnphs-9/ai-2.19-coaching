import { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  Platform,
  Linking,
  Alert,
  ImageBackground,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";

import Button from "../components/Button";
import { Colors } from "../styles/colors";

const IMAGE_OPTIONS = {
  mediaTypes: "images",
  allowsEditing: true,
  aspect: [1, 1],
  quality: 0.8,
};

export default function AddDogScreen() {
  const navigation = useNavigation();
  const [selectedImage, setSelectedImage] = useState(null);
  const [cameraPermission, requestCameraPermission] = ImagePicker.useCameraPermissions();

  const openAppSettings = () => {
    Linking.openURL("ios-settings:");
  };

  const ensureCameraPermission = async () => {
    if (cameraPermission?.status === "undetermined") {
      const permission = await requestCameraPermission();
      if (!permission.granted) {
        Alert.alert(
          "Camera Access Needed",
          "Please allow camera access to take a photo of your dog.",
          permission.canAskAgain
            ? [{ text: "OK" }]
            : [
                { text: "Cancel" },
                { text: "Open Settings", onPress: openAppSettings },
              ]
        );
        return false;
      }
    } else if (cameraPermission?.status === "denied") {
      Alert.alert(
        "Camera Access Needed",
        "Camera access is blocked. Please enable it in your device settings to take a photo.",
        [
          { text: "Cancel" },
          { text: "Open Settings", onPress: openAppSettings },
        ]
      );
      return false;
    }
    return true;
  };

  const handlePickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync(IMAGE_OPTIONS);
    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0]);
    }
  };

  const handleTakePhoto = async () => {
    if (Platform.OS === "ios") {
      if (!(await ensureCameraPermission())) {
        return;
      }
    }
    const result = await ImagePicker.launchCameraAsync(IMAGE_OPTIONS);
    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0]);
    }
  };

  const handleSave = () => {
    navigation.navigate("MyDogs", { dog: selectedImage.uri });
    setSelectedImage(null);
  };

  const handleClear = () => {
    setSelectedImage(null);
  };

  return (
    <LinearGradient
      colors={[Colors.PRIMARY_LIGHT_2, Colors.PRIMARY_LIGHT_1]}
      style={styles.background}
    >
      <ImageBackground
        source={require("../assets/images/wallpaper.jpg")}
        style={styles.background}
        imageStyle={{ opacity: 0.3 }}
      >
        <View style={styles.container}>
          <Text style={styles.welcomeText}>
            📸 Pick a photo or take one of your dog!
          </Text>

          {selectedImage ? (
            <View style={styles.previewContainer}>
              <Image
                source={{ uri: selectedImage.uri }}
                style={styles.previewImage}
              />
              <View style={styles.buttonsContainer}>
                <Button onPress={handleSave}>Save</Button>
                <Button onPress={handleClear}>Clear</Button>
              </View>
            </View>
          ) : (
            <View style={styles.buttonsContainer}>
              <Button onPress={handlePickPhoto}>Pick a Photo</Button>
              <Button onPress={handleTakePhoto}>Take a Photo</Button>
            </View>
          )}
        </View>
      </ImageBackground>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  welcomeText: {
    fontFamily: "Rubik_400Regular",
    textAlign: "center",
    marginHorizontal: 30,
    marginBottom: 25,
  },
  previewContainer: {
    alignItems: "center",
  },
  previewImage: {
    width: 300,
    height: 300,
    borderRadius: 10,
    marginBottom: 20,
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 15,
  },
});
