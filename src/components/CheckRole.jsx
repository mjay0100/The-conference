import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth, database } from "../../firebase"; // Ensure this path matches where your Firebase auth instance is initialized
import Loading from "../components/Loading";
import { Outlet } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";

const CheckRole = () => {
  const [authReady, setAuthReady] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      // console.log("Koca: user ", user);
      if (user) {
        // User is signed in
        // Fetch user role from Firestore
        const userDoc = await getDoc(doc(database, "users", user.uid));

        if (userDoc.exists()) {
          const { role } = userDoc.data();
          console.log("Koca: role ", role);
          // console.log("Koca: role ", role);

          setUserRole(role);
          setAuthReady(true); // Set authReady to true when auth state is determined
          // Redirect based on user role
          switch (role) {
            case "admin":
              navigate("/admin-dashboard");
              break;
            case "reviewer":
              navigate("/reviewer-dashboard");
              break;
            case "user":
              navigate("/user-dashboard");
              break;
            default:
              // Handle unknown roles
              console.error("Unknown role:", role);
              break;
          }
        } else {
          console.error("User document not found");
          // Handle case where user document doesn't exist
        }
      } else {
        // User is not signed in
        setAuthReady(true); // Set authReady to true when auth state is determined
        navigate("/"); // Redirect to home page
      }
    });

    return () => unsubscribe(); // Cleanup function to unsubscribe from the auth state listener
  }, []);

  // Render loading indicator until auth state is determined
  if (!authReady) {
    return <Loading />;
  }

  // Once auth state is determined, render the child routes
  return (
    <div>
      <Outlet />
    </div>
  );
};

export default CheckRole;
