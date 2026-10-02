import { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ImageBackground,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";

import Button from "../components/Button";
import { Colors } from "../styles/colors";

export default function RegisterScreen() {
  const navigation = useNavigation();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = () => {
    if (!username.trim() || !email.trim() || !password.trim()) {
      Alert.alert(
        "Register",
        "Please fill in all the fields to create an account."
      );
      return;
    }

    Alert.alert("Register", "Registration successful! You can now log in.");
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
          <Text style={styles.appHeader}>Create an account</Text>

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
              placeholder="Email"
              placeholderTextColor={Colors.PRIMARY_LIGHT_2}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
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
            <Button onPress={handleRegister}>Register</Button>
          </View>

          <Text style={styles.footerText}>
            Already have an account?{" "}
            <Text
              style={styles.linkText}
              onPress={() => navigation.navigate("Login")}
            >
              Login
            </Text>
          </Text>
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
});
