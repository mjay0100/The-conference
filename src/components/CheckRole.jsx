import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth, database } from "../../firebase";
import Loading from "../components/Loading";
import { Outlet } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { useGlobalContext } from "../context";

const CheckRole = () => {
  const [authReady, setAuthReady] = useState(false);
  // const [userRole, setUserRole] = useState(localStorage.getItem("userRole"));
  const navigate = useNavigate();
  const { user } = useGlobalContext();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(database, "users", user.uid));
        if (userDoc.exists()) {
          const { role } = userDoc.data();
          // setUserRole(role);
          // localStorage.setItem("userRole", role);
          setAuthReady(true);
          authorizeUser(role);
        } else {
          console.error("User document not found");
        }
      } else {
        setAuthReady(true);
      }
    });

    return () => unsubscribe();
  }, []);

  const authorizeUser = (role) => {
    if (window.location.pathname.includes("dashboard")) {
      switch (role) {
        case "admin":
          if (!window.location.pathname.includes("admin-dashboard")) {
            navigate("/admin-dashboard");
          }
          break;
        case "reviewer":
          if (!window.location.pathname.includes("reviewer-dashboard")) {
            navigate("/reviewer-dashboard");
          }
          break;
        case "user":
          if (!window.location.pathname.includes("user-dashboard")) {
            navigate("/user-dashboard");
          }
          break;
        default:
          console.error("Unknown role:", role);
          navigate("/"); // Redirect to home page for unknown roles
          break;
      }
    }
  };

  if (!authReady) {
    return <Loading />;
  }

  return (
    <div>
      <Outlet />
    </div>
  );
};

export default CheckRole;

// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { onAuthStateChanged } from "firebase/auth";
// import { auth, database } from "../../firebase"; // Ensure this path matches where your Firebase auth instance is initialized
// import Loading from "../components/Loading";
// import { Outlet } from "react-router-dom";
// import { doc, getDoc } from "firebase/firestore";
// import { useGlobalContext } from "../context";

// const CheckRole = () => {
//   const [authReady, setAuthReady] = useState(false);
//   const [userRole, setUserRole] = useState(null);
//   const navigate = useNavigate();
//   const { user } = useGlobalContext();

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, async (user) => {
//       if (user) {
//         // User is signed in
//         // Fetch user role from Firestore
//         const userDoc = await getDoc(doc(database, "users", user.uid));

//         if (userDoc.exists()) {
//           const { role } = userDoc.data();
//           // Store user role in localStorage
//           localStorage.setItem("userRole", role);
//           setUserRole(role);
//         } else {
//           console.error("User document not found");
//           // Handle case where user document doesn't exist
//         }
//       } else {
//         // User is not signed in
//         localStorage.removeItem("userRole"); // Remove user role from localStorage if user is not signed in
//       }
//       setAuthReady(true); // Set authReady to true when auth state is determined
//     });

//     return () => unsubscribe(); // Cleanup function to unsubscribe from the auth state listener
//   }, []);

//   useEffect(() => {
//     // Check if user role is stored in localStorage
//     const storedUserRole = localStorage.getItem("userRole");
//     if (storedUserRole) {
//       setUserRole(storedUserRole);
//     }
//   }, [userRole]);

//   // Render loading indicator until auth state is determined
//   if (!authReady) {
//     return <Loading />;
//   }

//   // If user role is present in localStorage, do not redirect
//   if (userRole) {
//     return <Outlet />;
//   }

//   // If user role is not present in localStorage, redirect to appropriate dashboard
//   switch (userRole) {
//     case "admin":
//       navigate("/admin-dashboard");
//       break;
//     case "reviewer":
//       navigate("/reviewer-dashboard");
//       break;
//     case "user":
//       navigate("/user-dashboard");
//       break;
//     default:
//       // Handle unknown roles
//       console.error("Unknown role:", userRole);
//       break;
//   }

//   return null; // Return null to prevent rendering anything if not redirected
// };

// export default CheckRole;
