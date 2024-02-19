/* eslint-disable no-unused-vars */
import { useEffect } from "react";
import { useAuth, useOrganizationList, useSession } from "@clerk/clerk-react";
import { Outlet, useNavigate } from "react-router-dom";
import Loading from "../components/Loading";
import { checkUserRole } from "../utils/deleteEventFunction";
import { useCallback } from "react";

const CheckRole = () => {
  const { session } = useSession();
  const { isLoaded, userMemberships } = useOrganizationList({
    userMemberships: {
      infinite: true,
    },
  });
  // console.log("Koca: userMemberships ", userMemberships.data[0].role);
  const userRole = checkUserRole(session);
  // console.log("Koca: userRole ", userRole);

  const { userId } = useAuth();
  const navigate = useNavigate();
  const checkAdminStatus = useCallback(
    (role) => {
      if (isLoaded) {
        // Check if the user's role is admin
        if (role === "org:admin") {
          navigate("/admin-dashboard");
        } else if (role === "org:reviewer") {
          navigate("/reviewer-dashboard");
        } else {
          navigate("/user-dashboard");
        }
      }
    },
    [userRole]
  );

  useEffect(() => {
    if (userMemberships.data && userMemberships.data.length > 0) {
      checkAdminStatus(userRole);
    }
  }, [userRole, checkAdminStatus]); // Ensure useEffect runs when userMemberships.data changes

  // Ensure that checkAdminStatus is called when isLoaded changes
  useEffect(() => {
    checkAdminStatus(userRole);
  }, [checkAdminStatus]);

  useEffect(() => {
    // Check if authentication information is loaded
    if (isLoaded) {
      // Check if the user is not authenticated
      if (!userId) {
        navigate("/sign-in");
      }
    }
    // Add userId and isLoaded to the dependency array if necessary
  }, [userId, isLoaded, navigate]);
  if (!isLoaded) return <Loading />;

  return (
    <div>
      <Outlet />
    </div>
  );
};

export default CheckRole;
