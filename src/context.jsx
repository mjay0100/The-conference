/* eslint-disable react/prop-types */
// UserContext.js

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const AppContext = createContext();

// export const useUser = () => useContext(UserContext);

const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // const handleSignOut = async () => {
  //   try {
  //     await signOut(auth);
  //     console.log("User signed out successfully");
  //     // Redirect to login or home page after sign out
  //     // navigate("/login"); // Uncomment this line if you use useNavigate for redirection
  //     history("/");
  //   } catch (error) {
  //     console.error("Error signing out:", error);
  //   }
  // };

  return (
    <AppContext.Provider value={{ user }}>
      {!loading && children}
    </AppContext.Provider>
  );
};
// make sure use
export const useGlobalContext = () => {
  return useContext(AppContext);
};

export { AppContext, AppProvider };
