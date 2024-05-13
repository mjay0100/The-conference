import { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  getDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { database } from "../../../firebase";
// import { useUser } from "@clerk/clerk-react";
import Loading from "../../components/Loading";
import { useGlobalContext } from "../../context";
import { PaystackButton } from "react-paystack";
import { toast, ToastContainer } from "react-toastify";

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

const RegisteredEvents = () => {
  // const { user } = useUser();
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [loadingRegisteredEvents, setLoadingRegisteredEvents] = useState(true);
  const { user } = useGlobalContext();

  useEffect(() => {
    const fetchRegisteredEvents = async () => {
      try {
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
              const reviewerComment = attendeeDoc.data().reviewerComment;
              console.log("Koca: reviewerComment ", reviewerComment);
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
              console.log("Koca: eventDetails ", eventDetails);

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
                reviewerComment,
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
  const handlePaymentClose = () => {
    console.log("closed");
    toast.error("Payment was cancelled", toastConfig);
  };

  const handlePaymentSuccess = async (reference, event) => {
    console.log("Payment reference:", reference);
    toast.success("Payment was successful", toastConfig);

    // Reference to the attendees collection under the specific event
    const attendeesRef = collection(database, "events", event.id, "attendees");

    // Create a query to find the attendee document by user UID
    const queryRef = query(attendeesRef, where("userId", "==", user.uid));

    try {
      const querySnapshot = await getDocs(queryRef);

      // Check if we have found the attendee document
      if (querySnapshot.empty) {
        console.error("No attendee document found for user:", user.uid);
        toast.error("No attendee found to update", toastConfig);
        return;
      }

      // Assuming there's only one matching document for each user per event
      const attendeeDoc = querySnapshot.docs[0];
      const attendeeDocRef = attendeeDoc.ref;

      // Update the Firestore document for the user's registration event
      await updateDoc(attendeeDocRef, {
        paymentStatus: "Paid",
      });
      console.log("Payment status updated in Firestore");

      // Optionally, update local state to reflect payment status change
      const updatedEvents = registeredEvents.map((e) => {
        if (e.id === event.id) {
          return { ...e, paymentStatus: "Paid" };
        }
        return e;
      });
      setRegisteredEvents(updatedEvents);
    } catch (error) {
      console.error("Error updating payment status:", error);
      toast.error("Error updating payment status", toastConfig);
    }
  };

  return (
    <div className="mt-8 mx-auto container overflow-x-auto">
      <ToastContainer />
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
                <th className="py-3 px-6 text-left">Pay Now</th>
                <th className="py-3 px-6 text-left">Reviewer Comment</th>
                <th className="py-3 px-6 text-left">Event Price</th>
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
                    <span
                      className={
                        event.paymentStatus === "Pending"
                          ? "text-red-600"
                          : "text-green-600"
                      }
                    >
                      {event.paymentStatus}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-left">{event.certId}</td>
                  <td className="py-4 px-6 text-left">{event.abstractTitle}</td>
                  <td className="py-4 px-6 text-left">
                    {event.paymentStatus === "Paid" ? (
                      <span className="text-green-600 font-semibold">
                        Event Paid For
                      </span>
                    ) : (event.userRole === "presenter" &&
                        event.abstractStatus === "Approved") ||
                      event.userRole === "participant" ? (
                      <PaystackButton
                        publicKey={import.meta.env.VITE_PAYSTACK_KEY} // Corrected the variable name
                        email={user.email}
                        amount={event.price * 100} // Assuming price is in Naira
                        text="Pay Now"
                        onSuccess={(reference) =>
                          handlePaymentSuccess(reference, event)
                        }
                        onClose={handlePaymentClose}
                        className="px-6 py-2 bg-blue-500 text-white font-semibold rounded-md shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-100"
                      />
                    ) : (
                      <span className="text-red-600">
                        Paper not yet reviewed
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-left">
                    {event.reviewerComment
                      ? event.reviewerComment
                      : "No Comment"}
                  </td>
                  <td className="py-4 px-6 text-left">{event.price}</td>
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
