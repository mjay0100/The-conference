import React, { useEffect, useState } from "react";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { auth, database } from "../../firebase";
import { setDoc, doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";

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

function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signingIn, setSigningIn] = useState(false); // State to track sign-in process
  const navigate = useNavigate();

  useEffect(() => {
    if (auth.currentUser) {
      checkUserRoleAndRedirect(auth.currentUser.uid);
    }
  }, []);

  const checkUserRoleAndRedirect = async (userId) => {
    const userDoc = await getDoc(doc(database, "users", userId));
    if (userDoc.exists()) {
      const { role } = userDoc.data();
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
          navigate("/user-dashboard");
          break;
      }
    }
  };

  const handleEmailSignIn = async (event) => {
    event.preventDefault();
    try {
      setSigningIn(true); // Set signingIn state to true when sign-in process starts
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        toast.error("Please enter a valid email address.", toastConfig);
        setSigningIn(false);
        return; // Stop the function if the email is not valid
      }
      if (password.length < 8) {
        toast.error(
          "Password must be at least 8 characters long.",
          toastConfig
        );
        setSigningIn(false);
        return;
      }

      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      await checkUserRoleAndRedirect(userCredential.user.uid);
    } catch (error) {
      console.error("Error signing in:", error.message);
      // Optionally handle errors, e.g., show error message to user
      if (error.code === "auth/invalid-credential") {
        toast.error(
          "Please make sure email and password are correct.",
          toastConfig
        );
      } else {
        toast.error(`Error signing in: ${error.message}`, toastConfig);
      }
    } finally {
      setSigningIn(false); // Set signingIn state to false when sign-in process ends
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setSigningIn(true); // Set signingIn state to true when sign-in process starts
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      await checkUserRoleAndRedirect(userCredential.user.uid);
    } catch (error) {
      console.error("Error signing in with Google:", error.message);
      // Optionally handle errors, e.g., show error message to user
      if (error.code === "auth/popup-closed-by-user") {
        toast.error("Google Window pop up closed", toastConfig);
      } else {
        toast.error(`Error signing in: ${error.message}`, toastConfig);
      }
    } finally {
      setSigningIn(false);
    }
  };

  return (
    <>
      {/* // tailwind */}
      <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        <ToastContainer />
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <img
            className="mx-auto h-10 w-auto"
            src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600"
            alt="Your Company"
          />
          <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
            Sign in to your account
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <form onSubmit={handleEmailSignIn} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Email address
              </label>
              <div className="mt-2">
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="block w-full rounded-md border-0 p-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Password
                </label>
              </div>
              <div className="mt-2">
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="block w-full rounded-md border-0 p-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={signingIn} // Disable the button when signingIn is true
                className={`flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
                  signingIn ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {signingIn ? "Signing In..." : "Sign in"}
              </button>
            </div>
          </form>
          <div className="flex items-center justify-center  dark:bg-gray-800 mt-5">
            <button
              className="px-4 py-2  flex gap-2 b rounded-lg text-slate-700 dark:text-slate-200 hover:border-slate-400 dark:hover:border-slate-500 hover:text-slate-900 dark:hover:text-slate-300 hover:shadow transition duration-150 w-full justify-center"
              onClick={handleGoogleSignIn}
              disabled={signingIn} // Disable the button when signingIn is true
            >
              <img
                className="w-6 h-6"
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                loading="lazy"
                alt="google logo"
              />
              <span>Sign in with Google</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default SignInPage;
