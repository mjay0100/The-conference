/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable no-unused-vars */
// import { useUser } from "@clerk/clerk-react";
import { useState, useEffect } from "react";
import { useNavigate, useNavigation, useParams } from "react-router-dom";
import { database, storage, ref } from "../../../firebase";
import {
  doc,
  getDoc,
  updateDoc,
  getDocs,
  collection,
} from "firebase/firestore";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
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
const editEvent = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    venue: "",
    description: "",
    date: "",
    totalParticipants: 0,
    theme: "",
    subThemes: "", // Split subThemes by commas and trim whitespace
    keynoteSpeaker: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [eventPrice, setEventPrice] = useState(0);

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

  const handleGoBack = () => {
    // Navigate to the previous page
    navigate(-1);
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  useEffect(() => {
    const fetchEventData = async () => {
      try {
        const eventDoc = doc(database, "events", id);
        const eventSnapshot = await getDoc(eventDoc);

        if (eventSnapshot.exists()) {
          const eventData = eventSnapshot.data();
          setFormData({
            title: eventData.title,
            venue: eventData.venue,
            description: eventData.description,
            totalParticipants: eventData.totalParticipants,
            date: eventData.date,
            theme: eventData.theme,
            subThemes: eventData.subThemes, // Split subThemes by commas and trim whitespace
            keynoteSpeaker: eventData.keynoteSpeaker,
          });
        } else {
          console.error("Event not found");
          // Redirect to a not found page or handle accordingly
          navigate("/not-found");
        }
      } catch (error) {
        console.error("Error fetching event data:", error);
      }
    };

    fetchEventData();
  }, [id]);

  const handleUpdateEvent = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const eventDocRef = doc(database, "events", id);
      // Fetch the attendees subcollection and get its count
      const attendeesCollection = collection(
        database,
        "events",
        id,
        "attendees"
      );
      const attendeesSnapshot = await getDocs(attendeesCollection);
      const attendeesCount = attendeesSnapshot.size;

      // Check if the new total participants is less than the current number of attendees
      if (formData.totalParticipants < attendeesCount) {
        toast.error(
          "Number of participants cannot be less than the number of attendees!",
          toastConfig
        );
        return;
      }

      // Ensure subThemes is always a string
      let subThemesArray = formData.subThemes;
      if (typeof formData.subThemes === "string") {
        // Split subThemes by commas and trim whitespace
        subThemesArray = formData.subThemes
          .split(",")
          .map((subTheme) => subTheme.trim());
      }
      // Update the event data in Firestore
      await updateDoc(eventDocRef, {
        title: formData.title,
        venue: formData.venue,
        description: formData.description,
        date: formData.date,
        totalParticipants: formData.totalParticipants,
        theme: formData.theme, // Add theme field
        subThemes: subThemesArray,
        keynoteSpeaker: formData.keynoteSpeaker,
        // Add other fields as needed
      });

      toast.success("Event updated successfully!", toastConfig);
      setTimeout(() => {
        navigate(`/admin-dashboard/${id}`);
      }, 3000);
    } catch (error) {
      console.error("Error updating event:", error);
      toast.error("Error updating event. Please try again.", toastConfig);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div>
        <ToastContainer />

        <form onSubmit={handleUpdateEvent} className="mx-12">
          {/* Same as */}
          <div className="space-y-12">
            <div className="border-b border-gray-900/10 pb-4">
              <h2 className=" capitalize text-base font-semibold leading-7 text-gray-900">
                Create An Event
              </h2>
            </div>

            <div className="border-b border-gray-900/10 pb-12">
              <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Title
                  </label>
                  <div className="mt-2">
                    <input
                      required
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      id="title"
                      autoComplete="title"
                      className="px-4 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                  </div>
                </div>

                {/* new fields */}
                {/* New form fields for theme, sub-themes, and keynote speaker */}

                <div className="sm:col-span-3">
                  <label
                    htmlFor="theme"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Theme
                  </label>
                  <div className="mt-2">
                    <input
                      required
                      type="text"
                      name="theme"
                      value={formData.theme}
                      onChange={handleInputChange}
                      id="theme"
                      autoComplete="theme"
                      className="px-4 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label
                    htmlFor="subThemes"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Sub-themes
                  </label>
                  <div className="mt-2">
                    <input
                      required
                      type="text"
                      name="subThemes"
                      value={formData.subThemes}
                      onChange={handleInputChange}
                      id="subThemes"
                      autoComplete="subThemes"
                      className="px-4 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      placeholder="Enter multiple sub-themes separated by commas"
                    />
                    <small className="text-xs text-gray-500">
                      Separate multiple sub-themes with commas
                    </small>
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label
                    htmlFor="keynoteSpeaker"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Keynote Speaker
                  </label>
                  <div className="mt-2">
                    <input
                      required
                      type="text"
                      name="keynoteSpeaker"
                      value={formData.keynoteSpeaker}
                      onChange={handleInputChange}
                      id="keynoteSpeaker"
                      autoComplete="keynoteSpeaker"
                      className="px-4 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label
                    htmlFor="venue"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    venue
                  </label>
                  <div className="mt-2">
                    <input
                      required
                      type="text"
                      name="venue"
                      value={formData.venue}
                      onChange={handleInputChange}
                      id="venue"
                      autoComplete="venue"
                      className="px-4 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label
                    htmlFor="date"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Date
                  </label>
                  <div className="mt-2">
                    <input
                      required
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      id="date"
                      autoComplete="date"
                      className="px-4 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                  </div>
                </div>
                <div className="sm:col-span-3">
                  <label
                    htmlFor="totalParticipants"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Total Number of Participants
                  </label>
                  <div className="mt-2">
                    <input
                      required
                      type="number"
                      name="totalParticipants"
                      value={formData.totalParticipants}
                      onChange={handleInputChange}
                      id="venue"
                      autoComplete="number"
                      className="px-4 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                  </div>
                </div>
                <div className="sm:col-span-3">
                  <label
                    htmlFor="price"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Price
                  </label>
                  <div className="mt-2">
                    <input
                      required
                      type="number"
                      name="price"
                      value={eventPrice}
                      onChange={handleInputChange}
                      id="price"
                      autoComplete="price"
                      className="px-4 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                  </div>
                </div>

                <div className="sm:col-span-6">
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Description
                  </label>
                  <div className="mt-2">
                    <textarea
                      required
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      autoComplete="description"
                      rows={5}
                      className="px-4 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                  </div>
                </div>
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
            <button
              type="submit"
              className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Editing Event..." : "Edit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default editEvent;
