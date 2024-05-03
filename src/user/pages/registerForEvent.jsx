// import { useUser } from "@clerk/clerk-react";
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
import randomNumber from "random-number";
import { useGlobalContext } from "../../context";

function generateRandomNumber() {
  // Generate a random 10-digit number
  const options = {
    min: 1000000000,
    max: 9999999999,
    integer: true,
  };

  return randomNumber(options);
}

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
  // const { user } = useUser();
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
    abstractTitle: "",
    authorType: "", // New field: Author type (main or co)
    coAuthors: [{ name: "" }], // New field: Co-authors array with initial empty object
  });
  const [file, setFile] = useState(null);
  const [fileInputDisabled, setFileInputDisabled] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [eventPrice, setEventPrice] = useState(0);
  const [isPayNowDisabled, setIsPayNowDisabled] = useState(false);
  const { user } = useGlobalContext();
  // State for co-authors

  const addCoAuthorField = () => {
    setFormData({
      ...formData,
      coAuthors: [...formData.coAuthors, { name: "" }],
    });
  };

  const removeCoAuthorField = (index) => {
    const updatedCoAuthors = [...formData.coAuthors];
    updatedCoAuthors.splice(index, 1);
    setFormData({
      ...formData,
      coAuthors: updatedCoAuthors,
    });
  };

  const handleCoAuthorChange = (index, e) => {
    const { name, value } = e.target;
    const updatedCoAuthors = [...formData.coAuthors];
    updatedCoAuthors[index] = { ...updatedCoAuthors[index], [name]: value };
    setFormData({
      ...formData,
      coAuthors: updatedCoAuthors,
    });
  };

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
      formData.firstName !== "" &&
      formData.lastName !== "" &&
      formData.email !== "" &&
      formData.streetAddress !== "" &&
      formData.city !== "" &&
      formData.gender !== "" &&
      formData.phone !== "" &&
      formData.role !== "" &&
      formData.state !== "" &&
      formData.country !== "" &&
      formData.abstractTitle !== "" &&
      formData.authorType !== "" &&
      file !== null;
    // Additional check for presenter role

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

  const handleSubmit = async (e) => {
    // console.log(reference);
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const attendeesCollectionRef = collection(
        database,
        "events",
        id,
        "attendees"
      );
      const q = query(attendeesCollectionRef, where("userId", "==", user.uid));
      // const querySnapshot = await getDocs(q);
      // if (!querySnapshot.empty) {
      //   toast.error("You are already registered for this event.", toastConfig);
      //   setIsSubmitting(false);
      //   setTimeout(() => {
      //     navigate("/user-dashboard");
      //   }, 3000);
      //   setIsPayNowDisabled(false);
      //   return;
      // }

      const eventDocRef = doc(database, "events", id);
      const eventSnapshot = await getDoc(eventDocRef);

      if (eventSnapshot.exists()) {
        const attendeesCollectionRef = collection(eventDocRef, "attendees");
        let fileUrl = null;
        if (formData.role === "presenter" && file) {
          const storageRef = ref(storage, `abstractFile/${file.name}`);
          const fileSnapshot = await uploadBytes(storageRef, file);
          fileUrl = await getDownloadURL(fileSnapshot.ref);
        }

        const attendeeData = {
          ...formData,
          paymentStatus: "successful",
          userId: user.uid,
          certificateId: generateRandomNumber(),
        };

        // Check if the user is a participant
        if (formData.role === "participant") {
          // Remove unnecessary fields for participants
          delete attendeeData.abstractTitle;
          delete attendeeData.authorType;
          delete attendeeData.coAuthors;
          delete attendeeData.abstractStatus; // In case abstractStatus was set in previous logic
        } else {
          // Include abstractStatus for non-participants
          attendeeData.abstractStatus = "pending";
          attendeeData.fileUrl = fileUrl;
        }
        const isValidEmail = /\S+@\S+\.\S+/.test(formData.email);
        if (!isValidEmail) {
          toast.error("Please enter a valid email address.", toastConfig);
          return;
        }
        await addDoc(attendeesCollectionRef, attendeeData);
        // console.log("Koca: attendeeData ", attendeeData);

        toast.success("Attendee registered successfully!", toastConfig);

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
    }
  };

  const handlePaymentClose = () => {
    return new Promise((resolve, reject) => {
      const attendeesCollectionRef = collection(
        database,
        "events",
        id,
        "attendees"
      );
      const q = query(attendeesCollectionRef, where("userId", "==", user.id));
      getDocs(q)
        .then((querySnapshot) => {
          if (!querySnapshot.empty) {
            toast.error(
              "You are already registered for this event.",
              toastConfig
            );
            setIsSubmitting(false);
            setTimeout(() => {
              navigate("/user-dashboard");
            }, 3000);
            setIsPayNowDisabled(false);
            reject("Already registered for the event");
          } else {
            toast.warning("Payment cancelled.", toastConfig);
            resolve("Payment cancelled");
          }
        })
        .catch((error) => {
          reject(error);
        });
    });
  };

  const paymentProps = {
    publicKey: import.meta.env.VITE_PATSTACK_KEY, // Replace with your Paystack public key
    email: formData.email,
    amount: eventPrice * 100,
    text: "Pay Now",
    // onSuccess: (reference) => handlePaymentSuccess(reference),
    onClose: handlePaymentClose,
  };

  // function handleSubmit(e) {
  //   e.preventDefault();
  // }

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
              <div className=" sm:col-span-2 ">
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
              <div className=" sm:col-span-2 ">
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
              <div className=" sm:col-span-2 ">
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
              <div className=" sm:col-span-2 ">
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
              <div className=" sm:col-span-2 ">
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
              <div className=" sm:col-span-2 ">
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
              <div className=" sm:col-span-2 ">
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
              <div className=" sm:col-span-2 ">
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
              <div className=" sm:col-span-2 ">
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
              <div className=" sm:col-span-2">
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
              <div className=" sm:col-span-2 ">
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
              <div className=" sm:col-span-2">
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
              <div className=" sm:col-span-2 ">
                <label
                  htmlFor="role"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Role
                </label>
                <div className="mt-2">
                  <select
                    required
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
              {formData.role === "presenter" && (
                <div className=" sm:col-span-2 ">
                  <label
                    htmlFor="file"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Abstract (doc file)
                  </label>
                  <div className="mt-2">
                    <input
                      required
                      type="file"
                      id="file"
                      onChange={handleFileInputChange}
                      disabled={fileInputDisabled}
                      className="px-4 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                  </div>
                </div>
              )}
              {/* abstarct title */}
              {formData.role === "presenter" && (
                <div
                  className={`${
                    formData.role === "presenter" ? "" : "opacity-0"
                  } transition-opacity duration-500 sm:col-span-2 `}
                >
                  <label
                    htmlFor="abstract-title"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Abstract Title
                  </label>
                  <div className="mt-2">
                    <input
                      required
                      type="text"
                      name="abstractTitle"
                      value={formData.abstractTitle}
                      onChange={handleInputChange}
                      id="abstract-title"
                      autoComplete="off"
                      className="px-4 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                  </div>
                </div>
              )}
              {/* author */}
              {/* Co-author section */}
              {/* Co-author fields */}
              {formData.role === "presenter" && (
                <div className="col-span-3">
                  <label className="block text-sm font-medium leading-6 text-gray-900">
                    Are you the main author?
                  </label>
                  <div className="mt-2">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        className="form-radio text-indigo-600"
                        name="authorType"
                        value="main"
                        checked={formData.authorType === "main"}
                        onChange={handleInputChange}
                      />
                      <span className="ml-2">Main Author</span>
                    </label>
                    <label className="inline-flex items-center ml-6">
                      <input
                        type="radio"
                        className="form-radio text-indigo-600"
                        name="authorType"
                        value="co-author"
                        checked={formData.authorType === "co-author"}
                        onChange={handleInputChange}
                      />
                      <span className="ml-2">Co-Author</span>
                    </label>
                  </div>

                  <div className="mt-4">
                    {formData.coAuthors.map((coAuthor, index) => (
                      <div key={index} className="mt-2 grid grid-cols-2">
                        <input
                          type="text"
                          name="name"
                          value={coAuthor.name}
                          onChange={(e) => handleCoAuthorChange(index, e)}
                          placeholder="Co-Author Name"
                          className="px-4 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        />
                        <button
                          type="button"
                          onClick={() => removeCoAuthorField(index)}
                          className="ml-2 py-1 px-2 bg-red-500 text-white font-semibold rounded-md shadow-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-100"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addCoAuthorField}
                      className="mt-2 py-1 px-2 bg-green-500 text-white font-semibold rounded-md shadow-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-100"
                    >
                      Add Co-Author
                    </button>
                  </div>
                </div>
              )}
              {/* End of Co-author fields */}
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
          {/* <PaystackButton
            {...paymentProps}
            disabled={isPayNowDisabled}
            className={`px-6 py-2 bg-blue-500 text-white font-semibold rounded-md shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-100`}
          /> */}
          <button
            type="submit"
            className={`px-6 py-2 bg-blue-500 text-white font-semibold rounded-md shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-100`}
          >
            submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegisterForEvent;
