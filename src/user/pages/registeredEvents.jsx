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
// import { useUser } from "@clerk/clerk-react";
import Loading from "../../components/Loading";
import { useGlobalContext } from "../../context";

const RegisteredEvents = () => {
  // const { user } = useUser();
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [loadingRegisteredEvents, setLoadingRegisteredEvents] = useState(true);
  const { user } = useGlobalContext();

  useEffect(() => {
    const fetchRegisteredEvents = async () => {
      try {
        // if (!user) {
        //   console.error("User ID not available.");
        //   return;
        // }
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
              where("userId", "==", user.uid)
            );
            const attendeesSnapshot = await getDocs(attendeesQuery);

            if (!attendeesSnapshot.empty) {
              const [attendeeDoc] = attendeesSnapshot.docs;
              const status = attendeeDoc.data().abstractStatus;
              const paymentStatus = attendeeDoc.data().paymentStatus;
              const abstractTitle = attendeeDoc.data().abstractTitle;
              console.log("Koca: abstractTitle ", abstractTitle);

              // Fetch user role and event details concurrently
              const [userRoleSnapshot, eventDetailsSnapshot] =
                await Promise.all([
                  getDocs(
                    query(
                      collection(database, "events", event.id, "attendees"),
                      where("userId", "==", user.uid)
                    )
                  ),
                  getDoc(doc(database, "events", event.id)),
                ]);

              const userRole = userRoleSnapshot.docs[0]?.data().role;
              const certId = userRoleSnapshot.docs[0]?.data().certificateId;

              const eventDetails = eventDetailsSnapshot.data();

              // Set status to "approved" if the user role is "participant"
              const updatedStatus =
                userRole === "participant" ? "approved" : status;

              return {
                id: event.id,
                ...eventDetails,
                status: updatedStatus,
                userRole,
                certId,
                paymentStatus,
                abstractTitle,
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
    <div className="mt-8 mx-auto container overflow-x-auto">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 text-center">
        Your Registered Events
      </h2>
      {registeredEvents.length === 0 ? (
        <p className="text-gray-500 text-center">No registered events found.</p>
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
                <th className="py-3 px-6 text-left">Abstract Status</th>
                <th className="py-3 px-6 text-left">Payment Status</th>
                <th className="py-3 px-6 text-left">Certificate Id</th>
                <th className="py-3 px-6 text-left">Abstract Title</th>
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
                  <td className="py-4 px-6 text-left">{event.title}</td>
                  <td className="py-4 px-6 text-left">{event.date}</td>
                  <td className="py-4 px-6 text-left">{event.userRole}</td>
                  <td
                    className={`py-4 px-6 font-bold ${
                      event.userRole === "participant"
                        ? "text-gray-600"
                        : event.status === "approved"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {event.userRole === "participant"
                      ? "No Abstract"
                      : event.status}
                  </td>
                  <td
                    className={`py-4 px-6 text-left font-bold text-green-600 `}
                  >
                    {event.paymentStatus}
                  </td>
                  <td className="py-4 px-6 text-left">{event.certId}</td>
                  <td className="py-4 px-6 text-left">{event.abstractTitle}</td>
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
