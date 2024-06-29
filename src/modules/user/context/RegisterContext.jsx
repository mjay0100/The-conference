import { useState, useContext, createContext } from "react";
import { database, storage, ref } from "../../../firebase";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getDownloadURL, uploadBytes } from "firebase/storage";
import randomNumber from "random-number";
import { useGlobalContext } from "../../context";

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
const RegisterContext = createContext();

const RegisterProvider = ({ children }) => {
  function generateRandomNumber() {
    // Generate a random 10-digit number
    const options = {
      min: 1000000000,
      max: 9999999999,
      integer: true,
    };

    return randomNumber(options);
  }
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    streetAddress: "",
    city: "",
    role: "",
    middleName: "",
    gender: "",
    phone: "",
    disabilities: "",
    state: "",
    country: "",
    abstractTitle: "",
    authorType: "",
    mainAuthor: "",
    coAuthors: [{ name: "" }],
  });

  const [file, setFile] = useState(null);
  const [fileInputDisabled, setFileInputDisabled] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [eventPrices, setEventPrices] = useState({
    presenterPrice: 0,
    participantPrice: 0,
  });
  const { user } = useGlobalContext();

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

  const fetchEventPrice = async (id) => {
    try {
      const eventDocRef = doc(database, "events", id);
      const eventSnapshot = await getDoc(eventDocRef);
      if (eventSnapshot.exists()) {
        const eventData = eventSnapshot.data();
        setEventPrices({
          presenterPrice: eventData.presenterPrice || 0,
          participantPrice: eventData.participantPrice || 0,
        });
      }
    } catch (error) {
      console.error("Error fetching event prices:", error);
    }
  };

  const handleFileInputChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
  };

  const handleGoBack = (navigate) => {
    navigate(-1);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
    if (name === "role") {
      setFileInputDisabled(value === "participant");
    }
  };

  const handleSubmit = async (e, id, navigate) => {
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
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        toast.error("You are already registered for this event.", toastConfig);
        setIsSubmitting(false);
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
        if (formData.role === "presenter" && file) {
          // Validate file type
          const validFileTypes = [
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          ];
          if (!validFileTypes.includes(file.type)) {
            toast.error("Please upload a DOC or PDF file.", toastConfig);
            setIsSubmitting(false);
            return;
          }
          const storageRef = ref(storage, `abstractFile/${file.name}`);
          const metadata = {
            customMetadata: {
              userId: user.uid,
              email: user.email,
            },
          };
          const fileSnapshot = await uploadBytes(storageRef, file, metadata);

          fileUrl = await getDownloadURL(fileSnapshot.ref);
        }

        const attendeeData = {
          ...formData,
          paymentStatus: "Pending",
          userId: user.uid,
          certificateId: generateRandomNumber(),
        };
        //  coAuthors is none if no co-authors are provided
        if (
          formData.coAuthors &&
          formData.coAuthors.every((coAuthor) => coAuthor.name.trim() === "")
        ) {
          attendeeData.coAuthors = "none";
        }

        // Ensure disabilities is 'none' if it contains the default value or is empty
        if (
          formData.disabilities.trim() === "None" ||
          formData.disabilities.trim() === ""
        ) {
          attendeeData.disabilities = "none";
        }
        if (formData.authorType === "main") {
          attendeeData.mainAuthor = user.displayName;
        }

        // Check if the user is a participant
        if (formData.role === "participant") {
          // Remove unnecessary fields for participants
          delete attendeeData.abstractTitle;
          delete attendeeData.authorType;
          delete attendeeData.coAuthors;
          delete attendeeData.abstractStatus;
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
        console.log("Koca: attendeeData ", attendeeData);
        await addDoc(attendeesCollectionRef, attendeeData);
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
          mainAuthor: "",
          role: "",
        });
        setIsSubmitting(false);
        setTimeout(() => {
          navigate("/user-dashboard");
        }, 3000);
      } else {
        console.log("Event not found");
      }
    } catch (error) {
      console.error("Error adding attendee:", error);
      toast.error("Error adding attendee. Please try again.");
      setIsSubmitting(false);
    }
  };

  const value = {
    formData,
    handleSubmit,
    setFormData,
    file,
    setFile,
    fileInputDisabled,
    setFileInputDisabled,
    isSubmitting,
    setIsSubmitting,
    eventPrices,
    handleInputChange,
    handleFileInputChange,
    handleCoAuthorChange,
    removeCoAuthorField,
    addCoAuthorField,
    fetchEventPrice,
    handleGoBack,
  };
  return (
    <RegisterContext.Provider value={value}>
      {children}
    </RegisterContext.Provider>
  );
};

export const useRegisterContext = () => {
  return useContext(RegisterContext);
};

export { RegisterContext, RegisterProvider };
