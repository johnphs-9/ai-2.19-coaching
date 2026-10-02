import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { Colors } from "../styles/colors";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";

const Stack = createNativeStackNavigator();

export default function AuthStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: Colors.WHITE },
        headerTintColor: Colors.PRIMARY,
        headerTitleStyle: {
          fontFamily: "Rubik_700Bold",
          fontWeight: "700",
          color: Colors.PRIMARY,
        },
      }}
    >
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{ title: "Register" }}
      />
    </Stack.Navigator>
  );
}
