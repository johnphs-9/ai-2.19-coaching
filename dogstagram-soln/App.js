import { useContext } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Rubik_400Regular, Rubik_700Bold } from "@expo-google-fonts/rubik";

import TabNavigator from "./navigation/TabNavigator";
import AuthStackNavigator from "./navigation/AuthStackNavigator";
import { AuthContext, AuthProvider } from "./contexts/AuthContext";
import LoadingOverlay from "./components/LoadingOverlay";

function NavigationApp() {
  const { isAuthenticated } = useContext(AuthContext);

  return (
    <NavigationContainer>
      {isAuthenticated ? <TabNavigator /> : <AuthStackNavigator />}
    </NavigationContainer>
  );
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
      <NavigationApp />
    </AuthProvider>
  );
}
