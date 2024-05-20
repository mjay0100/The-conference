import { createContext, useContext, useState } from "react";
import { database } from "../../../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

import { toast } from "react-toastify";

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
const CreateEventContext = createContext();

const CreateEventProvider = ({ children }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    venue: "",
    description: "",
    presenterPrice: "",
    participantPrice: "",
    totalParticipants: "",
    theme: "",
    subThemes: "",
    keynoteSpeaker: "",
  });
  const handleGoBack = (navigate) => {
    // Navigate to the previous page
    navigate(-1);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Prevent the user from entering a past date for the "date" field
    if (name === "date" && new Date(value) < new Date()) {
      toast.error("Cannot select a past date!", toastConfig);
      return;
    }

    // Parse values to numbers where necessary
    const parsedValue = [
      "totalParticipants",
      "presenterPrice",
      "participantPrice",
    ].includes(name)
      ? +value
      : value;

    setFormData({
      ...formData,
      [name]: parsedValue,
    });
  };

  const handleSubmit = async (e, navigate) => {
    e.preventDefault();
    if (isSubmitting) {
      return;
    }
    if (formData.totalParticipants <= 0) {
      toast.error(
        "Number of participants must be greater than zero!",
        toastConfig
      );
      return;
    }
    try {
      setIsSubmitting(true);
      // Reference to the 'events' collection
      const eventsCollection = collection(database, "events");

      // Data for the new event
      const eventData = {
        title: formData.title,
        venue: formData.venue,
        description: formData.description,
        date: formData.date,
        presenterPrice: formData.presenterPrice,
        participantPrice: formData.participantPrice,
        totalParticipants: formData.totalParticipants,
        theme: formData.theme, // Add theme field
        subThemes: formData.subThemes
          .split(",")
          .map((subTheme) => subTheme.trim()), // Split subThemes by commas and trim whitespace
        keynoteSpeaker: formData.keynoteSpeaker, // Add keynoteSpeaker field
        createdAt: serverTimestamp(),
        // attendees: [], // Initialize attendees as an empty array
      };

      // Add the new event to the 'events' collection
      await addDoc(eventsCollection, eventData);
      console.log("Koca: eventData ", eventData);

      // Show a success toast
      toast.success("Event created successfully!", toastConfig);
      setTimeout(() => {
        navigate("/admin-dashboard");
        setFormData({
          title: "",
          venue: "",
          description: "",
          date: "",
          totalParticipants: 0,
          theme: "",
          subThemes: "",
          keynoteSpeaker: "",
        });
      }, 3000);
    } catch (error) {
      console.error("Error creating event:", error);
      // Show an error toast
      toast.error("Error creating event. Please try again.", toastConfig);
    } finally {
      setIsSubmitting(false);
    }
  };
  const value = {
    isSubmitting,
    formData,
    handleGoBack,
    handleInputChange,
    handleSubmit,
  };

  return (
    <CreateEventContext.Provider value={value}>
      {children}
    </CreateEventContext.Provider>
  );
};

export const useGlobalCreateEvent = () => {
  return useContext(CreateEventContext);
};

export { CreateEventContext, CreateEventProvider };
