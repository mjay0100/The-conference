import { signOut } from "firebase/auth";
import { useGlobalContext } from "../context";
import { auth } from "../../firebase";
import { useNavigate } from "react-router-dom";

const UserProfile = () => {
  const { user } = useGlobalContext();
  console.log("Koca: user ", user.photoURL);
  const navigate = useNavigate();
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("userRole");
      console.log("User signed out successfully");
      // Redirect to login or home page after sign out
      // navigate("/login"); // Uncomment this line if you use useNavigate for redirection
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };
  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-semibold text-gray-800 mb-4">
        User Profile
      </h1>
      {user ? (
        <div>
          <div className="flex items-center mb-4">
            <img
              src={user.photoURL}
              alt="User Profile"
              className="w-12 h-12 rounded-full mr-4"
            />
            <div>
              <p className="text-lg font-semibold">{user.displayName}</p>
              <p className="text-gray-600">{user.email}</p>
            </div>
          </div>
          {/* Display other user profile information as needed */}
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
  );
};

export default UserProfile;
