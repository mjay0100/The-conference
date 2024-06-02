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
    if (!user) {
      navigate("/sign-in");
    }
  }, [user]);

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
