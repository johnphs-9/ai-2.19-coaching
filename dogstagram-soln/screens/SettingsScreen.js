import { useContext } from "react";
import { StyleSheet, Text, View, ImageBackground } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import Button from "../components/Button";
import { AuthContext } from "../contexts/AuthContext";
import { Colors } from "../styles/colors";

export default function SettingsScreen() {
  const { logout } = useContext(AuthContext);

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
          <Text style={styles.title}>Settings</Text>
          <Button onPress={logout}>Log Out</Button>
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
  title: {
    fontFamily: "Rubik_700Bold",
    fontSize: 24,
    color: Colors.PRIMARY,
    marginBottom: 20,
  },
});
