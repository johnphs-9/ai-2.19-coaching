import { createContext, useState } from "react";
import * as LocalAuthentication from "expo-local-authentication";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = (username, password) => {
    setIsAuthenticated(true);
  };

  const biometricLogin = async () => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    if (!hasHardware) {
      return false;
    }

    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    if (!isEnrolled) {
      return false;
    }

    const { success } = await LocalAuthentication.authenticateAsync({
      promptMessage: "Authenticate to log in to Dogstagram",
      promptCancel: "Cancel",
    });

    if (!success) {
      return false;
    }

    setIsAuthenticated(true);
    return true;
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, login, biometricLogin, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}
