import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile,
} from "firebase/auth";
import { auth, database } from "../../firebase";
import { setDoc, doc, getDoc } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";

function SignUpPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    profileImage: null,
  });
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
      if (!emailRegex.test(formData.email)) {
        toast.error("Please enter a valid email address.", toastConfig);
        setSigningUp(false);
        return;
      }
      if (formData.password.length < 8) {
        toast.error(
          "Password must be at least 8 characters long.",
          toastConfig
        );
        setSigningUp(false);
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const storage = getStorage();
      const storageRef = ref(
        storage,
        `profileImages/${userCredential.user.uid}`
      );
      await uploadBytes(storageRef, formData.profileImage);
      const profileImageUrl = await getDownloadURL(storageRef);
      // Update user profile with first and last name
      await updateProfile(userCredential.user, {
        displayName: `${formData.firstName} ${formData.lastName}`,
        photoURL: profileImageUrl,
      });

      // Save user ID to the users document
      await setDoc(doc(database, "users", userCredential.user.uid), {
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: "user", // Default role
        userId: userCredential.user.uid,
        photoURL: profileImageUrl,
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
      setSigningUp(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      setSigningUp(true);
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);

      // Check if the user already exists in Firestore
      const userRef = doc(database, "users", userCredential.user.uid);
      const userSnapshot = await getDoc(userRef);
      if (!userSnapshot.exists()) {
        await setDoc(userRef, {
          email: userCredential.user.email,
          firstName: userCredential.user.displayName?.split(" ")[0] || "",
          lastName:
            userCredential.user.displayName?.split(" ").slice(1).join(" ") ||
            "",
          role: "user",
          photoURL: userCredential.user.photoURL,
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
      setSigningUp(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "profileImage" && files.length > 0) {
      setFormData((prevData) => ({
        ...prevData,
        profileImage: files[0],
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
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

      <div className="mt-10 mx-auto w-4/5 my-4">
        <form onSubmit={handleEmailSignUp} className="my-6 ">
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label
                htmlFor="firstName"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                First Name
              </label>
              <div className="mt-2">
                <input
                  type="text"
                  id="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  name="firstName"
                  required
                  className="form-input"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="lastName"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Last Name
              </label>
              <div className="mt-2">
                <input
                  type="text"
                  id="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  name="lastName"
                  required
                  className="form-input"
                />
              </div>
            </div>
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
                  value={formData.email}
                  onChange={handleChange}
                  name="email"
                  required
                  className="form-input"
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
                  value={formData.password}
                  onChange={handleChange}
                  name="password"
                  required
                  className="form-input"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="profileImage"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Profile Image
              </label>
              <div className="mt-2">
                <input
                  type="file"
                  id="profileImage"
                  onChange={handleChange}
                  // required
                  className="form-input"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={signingUp} // Disable the button when signingUp is true
            className={`flex justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 mt-5 w-full md:w-2/5 mx-auto ${
              signingUp ? "opacity-50 cursor-not-allowed" : "" // Apply opacity and cursor style when signingUp is true
            }`}
          >
            {signingUp ? "Signing Up..." : "Sign Up"}{" "}
            {/* Show "Signing Up..." when signingUp is true */}
          </button>
          <div className="flex items-center justify-center  dark:bg-gray-800 mt-5">
            <button
              className="px-4 py-2  flex gap-2 b rounded-lg text-slate-700 dark:text-slate-200 hover:border-slate-400 dark:hover:border-slate-500 hover:text-slate-900 dark:hover:text-slate-300 hover:shadow transition duration-150  justify-center   w-full md:w-2/5 mx-auto"
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
        </form>

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
