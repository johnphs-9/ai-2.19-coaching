import { Text, Pressable, StyleSheet } from "react-native";
import { Colors } from "../styles/colors";

function Button({ children, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.buttonContainer,
        pressed && styles.buttonPressed,
      ]}
    >
      <Text style={styles.buttonText}>{children}</Text>
    </Pressable>
  );
}

export default Button;

const styles = StyleSheet.create({
  buttonContainer: {
    backgroundColor: Colors.PRIMARY,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",

    // Shadow for Android - higher value means a bigger shadow
    elevation: 8,

    // Shadow for iOS
    shadowColor: "#000",
    // width: horizontal offset, height: vertical offset
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    // 1 = sharp shadow, 10 = soft blurry shadow
    shadowRadius: 2,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontFamily: "Rubik_700Bold",
    textTransform: "uppercase",
  },
  buttonPressed: {
    opacity: 0.6,
  },
});
