import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "@react-native-vector-icons/ionicons";

import { Colors } from "../styles/colors";
import ExploreScreen from "../screens/ExploreScreen";
import MyDogsScreen from "../screens/MyDogsScreen";
import AddDogScreen from "../screens/AddDogScreen";
import SettingsScreen from "../screens/SettingsScreen";

const Tab = createBottomTabNavigator();

function TabIcon({ name, color, size = 26 }) {
  return <Ionicons name={name} size={size} color={color} />;
}

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: Colors.PRIMARY,
        tabBarInactiveTintColor: Colors.PRIMARY_LIGHT_2,
        headerStyle: { backgroundColor: Colors.WHITE },
        headerTintColor: Colors.PRIMARY,
        headerTitleStyle: {
          fontFamily: "Rubik_700Bold",
          fontWeight: "700",
          color: Colors.PRIMARY,
        },
      }}
    >
      <Tab.Screen
        name="Explore"
        component={ExploreScreen}
        options={{
          tabBarIcon: ({ color }) => <TabIcon name="compass" color={color} />,
        }}
      />
      <Tab.Screen
        name="MyDogs"
        component={MyDogsScreen}
        options={{
          title: "My Dogs",
          tabBarLabel: "My Dogs",
          tabBarIcon: ({ color }) => <TabIcon name="paw" color={color} />,
        }}
      />
      <Tab.Screen
        name="AddDog"
        component={AddDogScreen}
        options={{
          title: "Add Dog",
          tabBarLabel: "Add Dog",
          tabBarIcon: ({ color }) => (
            <TabIcon name="add-circle" color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ color }) => <TabIcon name="settings" color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}
