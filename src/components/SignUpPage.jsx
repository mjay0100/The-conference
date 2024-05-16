import React, { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { auth, database } from "../../firebase";
import { setDoc, doc, getDoc } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";

function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signingUp, setSigningUp] = useState(false); // State to track sign-up process
  const navigate = useNavigate();

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

  const handleEmailSignUp = async (e) => {
    e.preventDefault();
    try {
      setSigningUp(true); // Set signingUp state to true when sign-up process starts
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        toast.error("Please enter a valid email address.", toastConfig);
        return; // Stop the function if the email is not valid
      }
      if (password.length < 8) {
        toast.error(
          "Password must be at least 8 characters long.",
          toastConfig
        );
        return; // Stop the function if the password is too short
      }

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Save user ID to the users document
      await setDoc(doc(database, "users", userCredential.user.uid), {
        email: email,
        role: "user", // Default role
        userId: userCredential.user.uid, // Save the user ID
      });

      navigate("/user-dashboard");
    } catch (error) {
      console.error("Error signing in:", error.message);
      if (error.code === "auth/email-already-in-use") {
        toast.error(
          "Email already in use. Please use a different email.",
          toastConfig
        );
      } else {
        toast.error(`Error signing in: ${error.message}`, toastConfig);
      }
    } finally {
      setSigningUp(false); // Set signingUp state to false when sign-up process ends
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      setSigningUp(true); // Set signingUp state to true when sign-up process starts
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);

      // Check if the user already exists in Firestore
      const userRef = doc(database, "users", userCredential.user.uid);
      const userSnapshot = await getDoc(userRef);
      if (!userSnapshot.exists()) {
        // If user does not exist, add user to Firestore with default role
        await setDoc(userRef, {
          email: userCredential.user.email,
          role: "user",
          userId: userCredential.user.uid, // Save the user ID
        });
      }

      navigate("/user-dashboard");
    } catch (error) {
      if (error.code === "auth/popup-closed-by-user") {
        toast.error("Google Window pop up closed", toastConfig);
      } else {
        console.log(error);
        toast.error(`Error signing in: ${error.message}`, toastConfig);
      }
    } finally {
      setSigningUp(false); // Set signingUp state to false when sign-up process ends
    }
  };

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <ToastContainer />
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <img
          className="mx-auto h-10 w-auto"
          src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600"
          alt="Your Company"
        />
        <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
          Sign Up
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form onSubmit={handleEmailSignUp} className="space-y-6">
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
              disabled={signingUp} // Disable the button when signingUp is true
              className={`flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
                signingUp ? "opacity-50 cursor-not-allowed" : "" // Apply opacity and cursor style when signingUp is true
              }`}
            >
              {signingUp ? "Signing Up..." : "Sign Up"}{" "}
              {/* Show "Signing Up..." when signingUp is true */}
            </button>
          </div>
        </form>

        <div className="flex items-center justify-center  dark:bg-gray-800 mt-5">
          <button
            className="px-4 py-2  flex gap-2 b rounded-lg text-slate-700 dark:text-slate-200 hover:border-slate-400 dark:hover:border-slate-500 hover:text-slate-900 dark:hover:text-slate-300 hover:shadow transition duration-150 w-full justify-center"
            onClick={handleGoogleSignUp}
            disabled={signingUp} // Disable the button when signingUp is true
          >
            <img
              className="w-6 h-6"
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              loading="lazy"
              alt="google logo"
            />
            <span>Sign up with Google</span>
          </button>
        </div>

        <p className="mt-10 text-center text-sm text-gray-500">
          Already have an account ?
          <span>
            {" "}
            <Link
              to="/sign-in"
              className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500"
            >
              Log in
            </Link>
          </span>
        </p>
      </div>
    </div>
  );
}

export default SignUpPage;
