/* eslint-disable react/prop-types */
// UserContext.js

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, database } from "../../firebase";

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in
        // const userDoc = await getUserData(firebaseUser.uid);
        setUser(firebaseUser);
      } else {
        // User is signed out
        setUser(null);
      }
    });
    console.log(user);
    // console.log("user");
    return () => unsubscribe();
  }, []);

  //   const getUserData = async (userId) => {
  //     const userDoc = await database.collection("users").doc(userId).get();
  //     return userDoc.exists() ? userDoc.data() : null;
  //   };

  return (
    <UserContext.Provider value={{ user }}>{children}</UserContext.Provider>
  );
};
