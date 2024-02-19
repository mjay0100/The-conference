/* eslint-disable react-hooks/rules-of-hooks */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { database } from "../../../firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

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
const createEvent = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    venue: "",
    description: "",
    price: 0,
    totalParticipants: 0,
    theme: "",
    subThemes: "",
    keynoteSpeaker: "",
  });
  const handleGoBack = () => {
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

    // Convert the value to a number using the unary plus operator
    const parsedValue = name === "totalParticipants" ? +value : value;
    const price = name === "price" ? +value : value;
    setFormData({
      ...formData,
      [name]: parsedValue,
      [name]: price,
    });
  };

  const handleSubmit = async (e) => {
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
        price: formData.price,
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
      const newEventRef = await addDoc(eventsCollection, eventData);
      console.log("Event created with ID:", newEventRef);

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

  return (
    <div>
      <div>
        <ToastContainer />

        <form onSubmit={handleSubmit} className="mx-12">
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
                      value={formData.price}
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
              {isSubmitting ? "Creating Event..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default createEvent;
