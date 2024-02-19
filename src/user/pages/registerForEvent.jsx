import { useUser } from "@clerk/clerk-react";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { database, storage, ref } from "../../../firebase";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getDownloadURL, uploadBytes } from "firebase/storage";
import { PaystackButton } from "react-paystack";

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

const RegisterForEvent = () => {
  const { user } = useUser();
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    streetAddress: "",
    city: "",
    role: "participant", // Default role
    middleName: "", // New field: Middle name
    gender: "", // New field: Gender
    phone: "", // New field: Phone number
    disabilities: "", // New field: Disabilities
    state: "", // New field: State
    country: "", // New field: Country
  });
  const [file, setFile] = useState(null);
  const [fileInputDisabled, setFileInputDisabled] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [eventPrice, setEventPrice] = useState(0);
  const [isPayNowDisabled, setIsPayNowDisabled] = useState(true);

  useEffect(() => {
    const fetchEventPrice = async () => {
      try {
        const eventDocRef = doc(database, "events", id);
        const eventSnapshot = await getDoc(eventDocRef);
        if (eventSnapshot.exists()) {
          const eventData = eventSnapshot.data();
          if (eventData.price) {
            setEventPrice(eventData.price);
          }
        }
      } catch (error) {
        console.error("Error fetching event price:", error);
      }
    };
    fetchEventPrice();
  }, [id]);

  useEffect(() => {
    // Check if all required fields are filled
    const isFormFilled =
      Object.values(formData).every((value) => value !== "") && file !== null;
    setIsPayNowDisabled(!isFormFilled);
  }, [formData, file]);

  const handleFileInputChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const newValue =
      name === "disabilities" && value.trim() === "" ? "None" : value;
    setFormData({
      ...formData,
      [name]: newValue,
    });
    if (name === "role") {
      setFileInputDisabled(value === "participant");
    }
  };

  const handlePaymentSuccess = async (reference) => {
    console.log(reference);
  };

  const handlePaymentClose = () => {
    toast.warning("Payment cancelled.", toastConfig);
    setIsSubmitting(false);
  };

  const paymentProps = {
    publicKey: import.meta.env.VITE_PATSTACK_KEY, // Replace with your Paystack public key
    email: formData.email,
    amount: eventPrice * 100,
    text: "Pay Now",
    onSuccess: (reference) => handlePaymentSuccess(reference),
    onClose: handlePaymentClose,
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const attendeesCollectionRef = collection(
        database,
        "events",
        id,
        "attendees"
      );
      const q = query(attendeesCollectionRef, where("userId", "==", user.id));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        toast.error("You are already registered for this event.", toastConfig);
        setTimeout(() => {
          navigate("/user-dashboard");
        }, 3000);
        return;
      }

      const eventDocRef = doc(database, "events", id);
      const eventSnapshot = await getDoc(eventDocRef);

      if (eventSnapshot.exists()) {
        const attendeesCollectionRef = collection(eventDocRef, "attendees");
        let fileUrl = null;
        if (file) {
          const storageRef = ref(storage, `abstractFile/${file.name}`);
          const fileSnapshot = await uploadBytes(storageRef, file);
          fileUrl = await getDownloadURL(fileSnapshot.ref);
        }

        const attendeeData = {
          ...formData,
          fileUrl,
          paymentStatus: "successful",
          userId: user.id,
        };
        const isValidEmail = /\S+@\S+\.\S+/.test(formData.email);
        if (!isValidEmail) {
          toast.error("Please enter a valid email address.", toastConfig);
          return;
        }
        await addDoc(attendeesCollectionRef, attendeeData);
        console.log("Koca: attendeeData ", attendeeData);

        toast.success("Attendee registered successfully!", toastConfig);

        if (formData.role === "participant") {
          const userRef = doc(database, "users", user.id);
          await updateDoc(userRef, { status: "approved" });
        }

        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          streetAddress: "",
          city: "",
          middleName: "",
          gender: "",
          phone: "",
          disabilities: "",
          state: "",
          country: "",
        });

        setTimeout(() => {
          navigate("/user-dashboard");
        }, 3000);
      } else {
        console.log("Event not found");
      }
    } catch (error) {
      console.error("Error adding attendee:", error);
      toast.error("Error adding attendee. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <ToastContainer />

      <form onSubmit={handleSubmit} className="mx-12">
        {/* Same as */}
        <div className="space-y-12">
          <div className="border-b border-gray-900/10 pb-4">
            <h2 className=" capitalize text-base font-semibold leading-7 text-gray-900">
              register for the event
            </h2>
          </div>

          <div className="border-b border-gray-900/10 pb-12">
            <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
              <div className=" sm:col-span-3 ">
                <label
                  htmlFor="first-name"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  First name
                </label>
                <div className="mt-2">
                  <input
                    required
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    id="first-name"
                    autoComplete="given-name"
                    className="px-4 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

              {/* new inputs */}
              <div className=" sm:col-span-3 ">
                <label
                  htmlFor="middle-name"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Middle name
                </label>
                <div className="mt-2">
                  <input
                    type="text"
                    name="middleName"
                    value={formData.middleName}
                    onChange={handleInputChange}
                    id="middle-name"
                    autoComplete="additional-name"
                    className="px-4 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

              {/* Last name input */}
              <div className=" sm:col-span-3 ">
                <label
                  htmlFor="last-name"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Last name
                </label>
                <div className="mt-2">
                  <input
                    required
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    id="last-name"
                    autoComplete="family-name"
                    className="px-4 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

              {/* Gender input */}
              <div className=" sm:col-span-3 ">
                <label
                  htmlFor="gender"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Gender
                </label>
                <div className="mt-2">
                  <select
                    required
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="px-4 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  >
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>

              {/* Phone number input */}
              <div className=" sm:col-span-3 ">
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Phone number
                </label>
                <div className="mt-2">
                  <input
                    required
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    id="phone"
                    autoComplete="tel"
                    className="px-4 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

              {/* Disabilities input */}
              <div className=" sm:col-span-3 ">
                <label
                  htmlFor="disabilities"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Disabilities
                </label>
                <div className="mt-2">
                  <input
                    type="text"
                    name="disabilities"
                    value={formData.disabilities}
                    onChange={handleInputChange}
                    id="disabilities"
                    autoComplete="none"
                    className="px-4 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    placeholder="If any"
                  />
                </div>
              </div>

              {/* State input */}
              <div className=" sm:col-span-3 ">
                <label
                  htmlFor="state"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  State
                </label>
                <div className="mt-2">
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    id="state"
                    autoComplete="address-level1"
                    className="px-4 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

              {/* Country input */}
              <div className=" sm:col-span-3 ">
                <label
                  htmlFor="country"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Country
                </label>
                <div className="mt-2">
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    id="country"
                    autoComplete="country"
                    className="px-4 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

              {/* Email address input */}
              <div className=" sm:col-span-3 ">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Email address
                </label>
                <div className="mt-2">
                  <input
                    required
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    id="email"
                    autoComplete="email"
                    className="px-4 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

              {/* price */}
              <div className=" sm:col-span-3">
                <label
                  htmlFor="event-price"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Event Price
                </label>
                <div className="mt-2">
                  <input
                    type="text"
                    id="event-price"
                    value={eventPrice}
                    disabled
                    className="px-4 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

              <div className=" sm:col-span-3 ">
                <label
                  htmlFor="city"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  City
                </label>
                <div className="mt-2">
                  <input
                    required
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    id="city"
                    autoComplete="address-level2"
                    className="px-4 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>
              <div className=" sm:col-span-6">
                <label
                  htmlFor="street-address"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Street address
                </label>
                <div className="mt-2">
                  <input
                    required
                    type="text"
                    name="streetAddress"
                    value={formData.streetAddress}
                    onChange={handleInputChange}
                    id="street-address"
                    autoComplete="street-address"
                    className="px-4 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>
              {/* select */}
              {/* New role select field */}
              <div className=" sm:col-span-3 ">
                <label
                  htmlFor="role"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Role
                </label>
                <div className="mt-2">
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="px-4 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  >
                    <option value="participant">Participant</option>
                    <option value="presenter">Presenter</option>
                  </select>
                </div>
              </div>

              {/* File input field */}
              <div className=" sm:col-span-3 ">
                <label
                  htmlFor="file"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Abstract
                </label>
                <div className="mt-2">
                  <input
                    type="file"
                    id="file"
                    onChange={handleFileInputChange}
                    disabled={fileInputDisabled}
                    className="px-4 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>
              {/* end */}
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-x-6">
          <button
            onClick={handleGoBack}
            type="button"
            className="text-sm font-semibold leading-6 text-gray-900"
          >
            back
          </button>
          <PaystackButton
            {...paymentProps}
            disabled={isPayNowDisabled}
            className={`px-6 py-2 bg-blue-500 text-white font-semibold rounded-md shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-100`}
          />
        </div>
      </form>
    </div>
  );
};

export default RegisterForEvent;
