import { signOut } from "firebase/auth";
import { useGlobalContext } from "../context";
import { auth } from "../../firebase";
import { useNavigate } from "react-router-dom";

import { useState, useEffect } from "react";
import {
  doc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  getDoc,
} from "firebase/firestore";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { database } from "../../firebase"; // Adjust this import to your Firebase configuration file
import Loading from "./Loading";

const toastConfig = {
  position: "bottom-center",
  autoClose: 2000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: false,
  draggable: false,
  progress: undefined,
  theme: "light",
};
const UserProfile = () => {
  const { user } = useGlobalContext();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [newRole, setNewRole] = useState("user"); // Default role is 'user'
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(null);
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      console.log("User signed out successfully");
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const fetchUserProfile = async () => {
    setLoading(true);
    try {
      if (user) {
        const userRef = doc(database, "users", user.uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          setProfile(userDoc.data());
        } else {
          console.error("No user found with the provided UID.");
        }
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, [user]);

  const handleUpdateRole = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Reference to the users collection
      const usersRef = collection(database, "users");

      // Create a query against the collection
      const q = query(usersRef, where("email", "==", email));

      // Execute the query
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        toast.error("No user found with this email.", toastConfig);
        setLoading(false);
        return;
      }

      // Get the first user document from the query results
      const userDoc = querySnapshot.docs[0];

      // Update the user's role
      await updateDoc(doc(database, "users", userDoc.id), {
        role: newRole,
      });

      toast.success("User role updated successfully.", toastConfig);
    } catch (error) {
      console.error("Error updating user role:", error);
      toast.error("Error updating user role. Please try again.", toastConfig);
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg">
          <h1 className="text-2xl font-semibold text-gray-800 mb-4">
            User Profile
          </h1>
          {profile ? (
            <div>
              <div className="flex items-center mb-4">
                <img
                  src={profile.photoURL}
                  alt="User Profile"
                  className="w-12 h-12 rounded-full mr-4"
                />
                <div>
                  <p className="text-lg font-semibold">{`${profile.firstName} ${profile.lastName}`}</p>
                  <p className="text-gray-600">{profile.email}</p>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="bg-red-500 hover:bg-red-600 transition-all duration-200 text-white font-bold py-2 px-4 rounded"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <p className="text-gray-600">User not logged in</p>
          )}
        </div>
      )}

      {profile?.role == "admin" && (
        <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
          <ToastContainer />
          <div className="sm:mx-auto sm:w-full sm:max-w-sm">
            <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
              Update User Role
            </h2>
          </div>

          <div className="mt-10 mx-auto w-4/5 my-4">
            <form onSubmit={handleUpdateRole} className="my-6">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  User Email
                </label>
                <div className="mt-2">
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    name="email"
                    required
                    autoComplete="email"
                    className="form-input"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label
                  htmlFor="role"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  New Role
                </label>
                <div className="mt-2">
                  <select
                    id="role"
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    name="role"
                    required
                    className="form-input"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                    <option value="reviewer">Reviewer</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`flex justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 mt-5 w-full ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {loading ? "Updating..." : "Update Role"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default UserProfile;
