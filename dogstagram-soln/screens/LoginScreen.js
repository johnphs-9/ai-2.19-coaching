import { useContext, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ImageBackground,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import Ionicons from "@react-native-vector-icons/ionicons";

import Button from "../components/Button";
import { AuthContext } from "../contexts/AuthContext";
import { Colors } from "../styles/colors";

export default function LoginScreen() {
  const navigation = useNavigation();
  const { login, biometricLogin } = useContext(AuthContext);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert("Login", "Please enter both a username and a password.");
      return;
    }

    setIsLoading(true);
    await login(username.trim(), password);
  };

  const handleBiometricLogin = async () => {
    const success = await biometricLogin();
    if (!success) {
      Alert.alert(
        "Biometric Login",
        "Biometric authentication is not available or did not succeed."
      );
    }
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
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <Text style={styles.appHeader}>🐶 Dogstagram</Text>

          <View style={styles.formContainer}>
            <TextInput
              style={styles.input}
              placeholder="Username"
              placeholderTextColor={Colors.PRIMARY_LIGHT_2}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={Colors.PRIMARY_LIGHT_2}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <Button onPress={handleLogin}>
              {isLoading ? "Logging In..." : "Login"}
            </Button>
          </View>

          <Text style={styles.footerText}>
            Don't have an account?{" "}
            <Text
              style={styles.linkText}
              onPress={() => navigation.navigate("Register")}
            >
              Register
            </Text>
          </Text>

          <Pressable
            onPress={handleBiometricLogin}
            style={({ pressed }) => [
              styles.biometricButton,
              pressed && styles.biometricButtonPressed,
            ]}
          >
            <Ionicons name="finger-print" size={28} color={Colors.PRIMARY} />
          </Pressable>
        </KeyboardAvoidingView>
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
    padding: 30,
  },
  appHeader: {
    fontSize: 24,
    fontWeight: "700",
    fontFamily: "Rubik_700Bold",
    marginBottom: 20,
    textAlign: "center",
    color: Colors.PRIMARY,
  },
  formContainer: {
    gap: 15,
  },
  input: {
    backgroundColor: Colors.WHITE,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.PRIMARY,
  },
  footerText: {
    fontFamily: "Rubik_400Regular",
    textAlign: "center",
    marginTop: 25,
  },
  linkText: {
    fontFamily: "Rubik_700Bold",
    color: Colors.PRIMARY,
  },
  biometricButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.WHITE,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 20,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
  },
  biometricButtonPressed: {
    opacity: 0.6,
  },
});
