import { View, ActivityIndicator, StyleSheet } from "react-native";
import { Colors } from "../styles/colors";

export default function LoadingOverlay() {
  return (
    <View style={styles.loadingOverlay}>
      <ActivityIndicator size="large" color={Colors.PRIMARY} />
    </View>
  );
}

const styles = StyleSheet.create({
  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: "center",
    alignItems: "center",
  },
});
