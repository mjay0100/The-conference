/* eslint-disable react-hooks/rules-of-hooks */
import { doc, getDoc, collection, query, getDocs } from "firebase/firestore";
import { Link, useNavigate, useParams } from "react-router-dom";
import { database } from "../../firebase";
import { useEffect, useState } from "react";
import Loading from "../components/Loading";
import { ToastContainer } from "react-toastify";
import deleteEvent from "../utils/deleteEventFunction";

export default function singleEvent({ userType }) {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [event, setEvent] = useState({});
  const [deleting, setDeleting] = useState(false);
  useEffect(() => {
    async function getEvents() {
      try {
        const eventDocRef = doc(database, "events", id);
        // Fetch event data
        const eventSnapShot = await getDoc(eventDocRef);
        if (eventSnapShot.exists()) {
          const eventData = eventSnapShot.data();
          eventData.id = id;
          eventData.totalParticipants = +eventData.totalParticipants;
          // Fetch attendees sub collection
          const attendeesCollectionRef = collection(eventDocRef, "attendees");
          const attendeesQuery = query(attendeesCollectionRef);
          const attendeesSnapshot = await getDocs(attendeesQuery);
          // Calculate attendees count
          eventData.attendeesCount = attendeesSnapshot.size;
          setEvent(eventData);
          setLoading(false);
        } else {
          console.error("Document does not exist.");
        }
      } catch (error) {
        console.error("Error fetching document:", error);
      }
    }

    getEvents();
  }, [id]);

  const renderAdminButtons = () => {
    if (userType === "admin") {
      return (
        <>
          <Link to={`/admin-dashboard/${id}/edit`}>
            <button className="text-white bg-yellow-500 hover:bg-yellow-600 px-4 py-2 rounded-md">
              Edit
            </button>
          </Link>

          <button
            onClick={() => deleteEvent(id, navigate, setDeleting)}
            className="text-white bg-red-500 hover:bg-red-600 px-4 py-2 rounded-md"
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </>
      );
    }

    return null;
  };
  const renderReviewerButtons = () => {
    if (userType === "admin" || userType === "reviewer") {
      return (
        <Link to={`/${userType}-dashboard/${id}/users`}>
          <button className="text-white bg-green-500 hover:bg-green-600 px-4 py-2 rounded-md">
            View Users
          </button>
        </Link>
      );
    }

    return null;
  };

  const renderUserRegisterButton = () => {
    if (
      userType === "user" &&
      event.totalParticipants !== event.attendeesCount
    ) {
      return (
        <Link to={`/user-dashboard/${id}/register`}>
          <button className="text-white bg-indigo-500 hover:bg-indigo-600 px-4 py-2 rounded-md">
            Register
          </button>
        </Link>
      );
    }
    return null;
  };

  return (
    <>
      <ToastContainer />

      {loading ? (
        <Loading />
      ) : (
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-3xl font-bold mb-4 text-gray-800 capitalize text-center">
            {event.title}
          </h2>
          <div className="mb-6">
            <p className="text-gray-700 font-semibold mb-2">Theme:</p>
            <p className="text-2xl font-bold capitalize text-indigo-600 mb-2">
              {event.theme}
            </p>
            <div className="flex items-center mb-4 text-indigo-600">
              <p className=" font-semibold capitalize">
                Key Note Speaker: {event.keynoteSpeaker}
              </p>
            </div>
          </div>
          <div className="mb-6">
            <p className="text-gray-700 font-semibold mb-2">Sub themes:</p>
            <ul className="list-disc ml-6">
              {event.subThemes.map((subTheme, index) => (
                <li key={index} className="text-gray-700">
                  {subTheme}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex items-center mb-4">
            <p className="text-gray-700 font-semibold">Venue: {event.venue}</p>
          </div>
          <div className="flex items-center mb-4">
            <p className="text-gray-700 font-semibold">Date: {event.date}</p>
          </div>
          <div className="flex items-center mb-4">
            <p className="text-gray-700 font-semibold">Event ID: {event.id}</p>
          </div>
          <p className="text-gray-700 mb-8 font-semibold">
            {event.description}
          </p>
          <div className="space-x-4">
            {/* Render admin-specific buttons */}
            {renderAdminButtons()}

            {/* Render user-specific register button */}
            {renderUserRegisterButton()}
            {/* Render reviewer-specific register button */}
            {renderReviewerButtons()}

            <Link to={`/${userType}-dashboard`}>
              <button className="mt-4 text-white bg-indigo-600 hover:bg-indigo-700 px-6 py-2 rounded-md">
                Back
              </button>
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
