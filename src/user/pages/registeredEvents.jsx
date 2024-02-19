import { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  getDoc,
  doc,
} from "firebase/firestore";
import { database } from "../../../firebase";
import { useUser } from "@clerk/clerk-react";
import Loading from "../../components/Loading";

const RegisteredEvents = () => {
  const { user } = useUser();
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [loadingRegisteredEvents, setLoadingRegisteredEvents] = useState(true);

  useEffect(() => {
    const fetchRegisteredEvents = async () => {
      try {
        if (!user) {
          console.error("User ID not available.");
          return;
        }
        setLoadingRegisteredEvents(true);

        // Fetch all events
        const allEventsQuery = query(collection(database, "events"));
        const allEventsSnapshot = await getDocs(allEventsQuery);
        const allEvents = allEventsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Fetch registered events for the user
        const userRegisteredEvents = await Promise.all(
          allEvents.map(async (event) => {
            const attendeesQuery = query(
              collection(database, "events", event.id, "attendees"),
              where("userId", "==", user.id)
            );
            const attendeesSnapshot = await getDocs(attendeesQuery);

            if (!attendeesSnapshot.empty) {
              const [attendeeDoc] = attendeesSnapshot.docs;
              const status = attendeeDoc.data().status;
              const paymentStatus = attendeeDoc.data().paymentStatus;

              // Fetch user role and event details concurrently
              const [userRoleSnapshot, eventDetailsSnapshot] =
                await Promise.all([
                  getDocs(
                    query(
                      collection(database, "events", event.id, "attendees"),
                      where("userId", "==", user.id)
                    )
                  ),
                  getDoc(doc(database, "events", event.id)),
                ]);

              const userRole = userRoleSnapshot.docs[0]?.data().role;
              const eventDetails = eventDetailsSnapshot.data();
              console.log("Koca: eventDetails ", eventDetails);

              // Set status to "approved" if the user role is "participant"
              const updatedStatus =
                userRole === "participant" && status === "pending"
                  ? "approved"
                  : status;

              return {
                id: event.id,
                ...eventDetails,
                status: updatedStatus,
                userRole,
                paymentStatus,
              };
            }

            return null;
          })
        );

        // Remove null values (events where the user is not registered)
        const filteredEvents = userRegisteredEvents.filter(
          (event) => event !== null
        );

        setRegisteredEvents(filteredEvents);
        console.log("Koca: filteredEvents ", filteredEvents);
        setLoadingRegisteredEvents(false);
      } catch (error) {
        console.error("Error fetching registered events:", error);
        setLoadingRegisteredEvents(false);
      }
    };

    fetchRegisteredEvents();
  }, [user]); // Ensure useEffect runs when user changes

  if (loadingRegisteredEvents) {
    return <Loading />;
  }

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 text-center">
        Your Registered Events
      </h2>
      {registeredEvents.length === 0 ? (
        <p className="text-gray-500">No registered events found.</p>
      ) : (
        <div className="min-w-full overflow-x-auto">
          <table className="min-w-[70%] mx-auto bg-white border border-gray-300 shadow-md rounded-md overflow-hidden divide-y divide-gray-300 text-left">
            <thead className="bg-gradient-to-r from-teal-500 to-teal-700 text-white">
              <tr>
                <th className="py-3 px-6 text-left">#</th>
                <th className="py-3 px-6 text-left">Event ID</th>
                <th className="py-3 px-6 text-left">Event Title</th>
                <th className="py-3 px-6 text-left">Date</th>
                <th className="py-3 px-6 text-left">User Role</th>
                <th className="py-3 px-6 text-left">Status</th>
                <th className="py-3 px-6 text-left">Payment Status</th>
              </tr>
            </thead>
            <tbody>
              {registeredEvents.map((event, index) => (
                <tr
                  key={event.id}
                  className={index % 2 === 0 ? "bg-gray-100" : ""}
                >
                  <td className="py-4 px-6 text-gray-600">{index + 1}</td>
                  <td className="py-4 px-6 text-gray-600">{event.id}</td>
                  <td className="py-4 px-6">{event.title}</td>
                  <td className="py-4 px-6">{event.date}</td>
                  <td className="py-4 px-6">{event.userRole}</td>
                  <td
                    className={`py-4 px-6 font-bold ${
                      event.status === "approved"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {event.status}
                  </td>
                  <td className={`py-4 px-6 font-bold text-green-600 `}>
                    {event.paymentStatus}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RegisteredEvents;
