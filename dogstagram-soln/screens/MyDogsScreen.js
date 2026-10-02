import { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  FlatList,
  ImageBackground,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import * as Crypto from "expo-crypto";
import { LinearGradient } from "expo-linear-gradient";

import { Colors } from "../styles/colors";

const renderDogItem = ({ item }) => (
  <Image source={{ uri: item.url }} style={styles.dogImage} />
);

export default function MyDogsScreen() {
  const route = useRoute();
  const [myDogs, setMyDogs] = useState([]);

  useEffect(() => {
    const dog = route.params?.dog;
    if (dog) {
      setMyDogs((prevMyDogs) => [
        ...prevMyDogs,
        { id: Crypto.randomUUID(), url: dog },
      ]);
    }
  }, [route.params?.dog]);

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
        <FlatList
          data={myDogs}
          showsVerticalScrollIndicator={false}
          keyExtractor={(dog) => dog.id}
          renderItem={renderDogItem}
          contentContainerStyle={{
            justifyContent: myDogs.length === 0 ? "center" : "flex-start",
          }}
          ListEmptyComponent={<Text style={styles.emptyText}>No dogs yet.</Text>}
        />
      </ImageBackground>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  dogImage: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 10,
    marginBottom: 20,
  },
  emptyText: {
    fontFamily: "Rubik_400Regular",
    fontSize: 18,
    color: Colors.PRIMARY,
  },
});
