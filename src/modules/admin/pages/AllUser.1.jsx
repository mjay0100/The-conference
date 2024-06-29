import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
  updateDoc,
  addDoc,
  deleteDoc,
} from "firebase/firestore";
import { database } from "../../../firebase";
import Loading from "../../components/Loading";
import { useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { useGlobalContext } from "../../context";
import emailjs from "@emailjs/browser";
import { toastConfig } from "./allUser";

export const AllUser = () => {
  const [usersWithAbstract, setUsersWithAbstract] = useState([]);
  const [usersWithoutAbstract, setUsersWithoutAbstract] = useState([]);
  const [reviewers, setReviewers] = useState([]);
  const [reviewerAssignments, setReviewerAssignments] = useState({});
  const [loading, setLoading] = useState(true);
  const { user } = useGlobalContext();
  const { id } = useParams();
  const [assigning, setAssigning] = useState({});
  const [showParticipants, setShowParticipants] = useState(true);
  const [showPresenters, setShowPresenters] = useState(false);
  const [showAcceptedAbstracts, setShowAcceptedAbstracts] = useState(false);
  const [showRejectedAbstracts, setShowRejectedAbstracts] = useState(false);
  const [approving, setApproving] = useState({});
  const [denying, setDenying] = useState({});
  const [acceptedAbstracts, setAcceptedAbstracts] = useState([]);
  const [rejectedAbstracts, setRejectedAbstracts] = useState([]);

  const fetchReviewers = async () => {
    const reviewerQuery = query(
      collection(database, "users"),
      where("role", "==", "reviewer")
    );
    const querySnapshot = await getDocs(reviewerQuery);
    const fetchedReviewers = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      name: `${doc.data().email}`,
    }));
    setReviewers(fetchedReviewers);
  };

  const getUsers = async () => {
    setLoading(true);
    try {
      const attendeesCollection = collection(
        database,
        "events",
        id,
        "attendees"
      );
      const attendeesSnapshot = await getDocs(attendeesCollection);
      const usersData = attendeesSnapshot.docs.map((doc) => ({
        ...doc.data(),
        attendeeId: doc.id,
      }));

      const usersWithAbstract = usersData.filter(
        (user) => user.role === "presenter" && user.fileUrl
      );
      const usersWithoutAbstract = usersData.filter(
        (user) => user.role === "participant" && !user.fileUrl
      );

      setUsersWithAbstract(usersWithAbstract);
      setUsersWithoutAbstract(usersWithoutAbstract);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching users:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    getUsers();
    fetchReviewers();
  }, [
    showParticipants,
    showPresenters,
    showAcceptedAbstracts,
    showRejectedAbstracts,
  ]);

  const handleAssignReviewer = async (userId) => {
    if (!reviewerAssignments[userId]) {
      toast.error("Please select a reviewer before assigning!", toastConfig);
      return;
    }
    try {
      setAssigning((prev) => ({ ...prev, [userId]: true })); // Set assigning to true for this user
      const userRef = doc(database, "events", id, "attendees", userId);
      await updateDoc(userRef, { reviewerId: reviewerAssignments[userId] });
      toast.success("Reviewer assigned successfully!", toastConfig);
      setAssigning((prev) => ({ ...prev, [userId]: false })); // Reset assigning to false after successful operation
    } catch (error) {
      console.error("Error assigning reviewer:", error);
      toast.error("Error assigning reviewer. Please try again.", toastConfig);
      setAssigning((prev) => ({ ...prev, [userId]: false })); // Reset assigning even if there's an error
    }
  };

  const handleReviewerChange = (userId, reviewerId) => {
    setReviewerAssignments((prev) => ({ ...prev, [userId]: reviewerId }));
  };

  const handleApproval = async (attendeeId) => {
    try {
      setApproving((prev) => ({ ...prev, [attendeeId]: true }));
      const userRef = doc(database, "events", id, "attendees", attendeeId);
      const userDoc = await getDoc(userRef);
      const userData = userDoc.data();
      userData.abstractStatus = "accepted";

      const acceptedAttendeesCollection = collection(
        database,
        "events",
        id, // Reference to the specific attendee document
        "acceptedAbstracts" // Name of the subcollection
      );
      // Move the abstract status to the new subcollection
      await addDoc(acceptedAttendeesCollection, { ...userData });
      // Remove user from the attendees collection
      await deleteDoc(userRef);
      // await updateDoc(userRef, { abstractStatus: "approved" });
      toast.success("User approved successfully!", toastConfig);
    } catch (error) {
      toast.error("Error approving user. Please try again.");
      console.log(error);
    } finally {
      setApproving((prev) => ({ ...prev, [attendeeId]: false }));
    }
  };

  const handleDenial = async (attendeeId) => {
    try {
      setDenying((prev) => ({ ...prev, [attendeeId]: true }));

      const eventRef = doc(database, "events", id);
      const eventDoc = await getDoc(eventRef);
      const eventData = eventDoc.data(); // Fetching event data
      console.log("Event Data:", eventData); // Log the fetched event data
      const userRef = doc(database, "events", id, "attendees", attendeeId);
      const userDoc = await getDoc(userRef);
      const userData = userDoc.data();
      console.log("Koca: userData ", userData);
      userData.abstractStatus = "rejected";
      // Create a subcollection within the attendees subcollection
      const deniedAttendeesCollection = collection(
        database,
        "events",
        id, // Reference to the specific attendee document
        "rejectedAbstracts" // Name of the subcollection
      );
      // Move the abstract status to the new subcollection
      await addDoc(deniedAttendeesCollection, { ...userData });
      const templateParams = {
        from_name: user.displayName,
        from_email: user.email,
        to_name: `${userData.firstName} ${userData.lastName}`,
        event_name: eventData.title,
        event_id: id,
        message: userData.reviewerComment,
      };
      await emailjs.send(
        "service_xms3eag",
        "template_4du1elr",
        templateParams,
        {
          publicKey: "bvFJrLeF0g3uygNky",
        }
      );

      console.log("SUCCESS!");

      // Remove user from the attendees collection
      // await deleteDoc(userRef);
      toast.error("User denied successfully!", toastConfig);
    } catch (error) {
      console.error("Error denying user:", error);
      toast.error("Error denying user. Please try again.", toastConfig);
    } finally {
      setDenying((prev) => ({ ...prev, [attendeeId]: false }));
    }
  };

  const handleShowAcceptedAbstracts = async () => {
    setShowParticipants(false);
    setShowPresenters(false);
    setShowAcceptedAbstracts(true);
    setShowRejectedAbstracts(false);
    const acceptedAbstractsCollection = collection(
      database,
      "events",
      id,
      "acceptedAbstracts"
    );
    const acceptedAbstractsSnapshot = await getDocs(
      acceptedAbstractsCollection
    );
    const acceptedAbstractsData = acceptedAbstractsSnapshot.docs.map((doc) => ({
      ...doc.data(),
      attendeeId: doc.id,
    }));
    setAcceptedAbstracts(acceptedAbstractsData);
  };

  const handleShowRejectedAbstracts = async () => {
    setShowParticipants(false);
    setShowPresenters(false);
    setShowAcceptedAbstracts(false);
    setShowRejectedAbstracts(true);
    const rejectedAbstractsCollection = collection(
      database,
      "events",
      id,
      "rejectedAbstracts"
    );
    const rejectedAbstractsSnapshot = await getDocs(
      rejectedAbstractsCollection
    );
    const rejectedAbstractsData = rejectedAbstractsSnapshot.docs.map((doc) => ({
      ...doc.data(),
      attendeeId: doc.id,
    }));
    setRejectedAbstracts(rejectedAbstractsData);
    console.log("Koca: rejectedAbstractsData ", rejectedAbstractsData);
  };

  return (
    <div className="container mx-auto mt-8 capitalize">
      <ToastContainer />
      <div className="flex justify-center space-x-4">
        <button
          onClick={() => {
            setShowParticipants(false);
            setShowPresenters(true);
            setShowAcceptedAbstracts(false);
            setShowRejectedAbstracts(false);
          }}
          className={`py-2 px-4 rounded ${
            showPresenters ? "bg-blue-500 text-white" : "bg-gray-300"
          }`}
        >
          Presenters
        </button>
        <button
          onClick={() => {
            setShowParticipants(true);
            setShowPresenters(false);
            setShowAcceptedAbstracts(false);
            setShowRejectedAbstracts(false);
          }}
          className={`py-2 px-4 rounded ${
            showParticipants ? "bg-blue-500 text-white" : "bg-gray-300"
          }`}
        >
          Participants
        </button>
        <button
          onClick={() => {
            handleShowAcceptedAbstracts();
          }}
          className={`py-2 px-4 rounded ${
            showAcceptedAbstracts ? "bg-green-500 text-white" : "bg-gray-300"
          }`}
        >
          Accepted Abstracts
        </button>
        <button
          onClick={() => {
            handleShowRejectedAbstracts();
          }}
          className={`py-2 px-4 rounded ${
            showRejectedAbstracts ? "bg-red-500 text-white" : "bg-gray-300"
          }`}
        >
          Rejected Abstracts
        </button>
      </div>
      {loading && <Loading />}
      {!loading && (
        <div>
          {showPresenters && usersWithAbstract.length > 0 && (
            <div className="overflow-x-auto">
              <h2 className="text-2xl font-bold mb-4">Users with Abstracts</h2>
              <table className="min-w-full text-sm">
                <thead className="bg-gray-700 text-white">
                  <tr>
                    <th className="py-3 px-6 text-left">#</th>
                    <th className="py-3 px-6 text-left">Name</th>
                    <th className="py-3 px-6 text-left">Abstract Title</th>
                    <th className="py-3 px-6 text-left">Abstract Status</th>
                    <th className="py-3 px-6 text-left">Assigned Reviewer</th>
                    <th className="py-3 px-6 text-left">Reviewer Comment</th>
                    <th className="py-3 px-6 text-left">Select Reviewer</th>
                    <th className="py-3 px-6 text-left">Assign</th>
                    <th className="py-3 px-6 text-left">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {usersWithAbstract.map((user, index) => (
                    <tr key={user.attendeeId} className="bg-white border-b">
                      <td className="py-4 px-6">{`${index + 1}`}</td>
                      <td className="py-4 px-6">{`${user.firstName} ${user.lastName}`}</td>
                      <td className="py-4 px-6">{user.abstractTitle}</td>
                      <td className="py-4 px-6">
                        {user.abstractStatus || "Not set"}
                      </td>
                      <td className="py-4 px-6">
                        {user.reviewerId ? (
                          <span>
                            {reviewers.find((r) => r.id === user.reviewerId)
                              ?.name || "N/A"}
                          </span>
                        ) : (
                          <span>N/A</span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        {user.reviewerComment ? user.reviewerComment : "None"}
                      </td>
                      <td className="py-4 px-6">
                        <select
                          className="border border-gray-300 rounded px-2 py-1"
                          value={reviewerAssignments[user.attendeeId] || ""}
                          onChange={(e) =>
                            handleReviewerChange(
                              user.attendeeId,
                              e.target.value
                            )
                          }
                        >
                          <option value="">Select Reviewer</option>
                          {reviewers.map((reviewer) => (
                            <option key={reviewer.id} value={reviewer.id}>
                              {reviewer.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-4 px-6">
                        <button
                          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-blue-300"
                          onClick={() => handleAssignReviewer(user.attendeeId)}
                          disabled={assigning[user.attendeeId]} // Disable the button if currently assigning
                        >
                          {assigning[user.attendeeId]
                            ? "Assigning..."
                            : "Assign"}
                        </button>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center">
                          <button
                            onClick={() => handleApproval(user.attendeeId)}
                            disabled={approving[user.attendeeId]}
                            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 mx-2 rounded-md disabled:bg-green-500 focus:outline-none focus:ring focus:border-blue-300"
                          >
                            {approving[user.attendeeId]
                              ? "Approving"
                              : "Approve"}
                          </button>
                          <button
                            onClick={() => handleDenial(user.attendeeId)}
                            disabled={denying[user.attendeeId]}
                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 mx-2 rounded-md disabled:bg-red-500 focus:outline-none focus:ring focus:border-blue-300"
                          >
                            {denying[user.attendeeId] ? "Denying" : "Deny"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="container mt-5">
            {showParticipants && (
              <div>
                {usersWithoutAbstract.length > 0 ? (
                  <div>
                    <h2 className="text-2xl font-bold mb-4">
                      Users without Abstracts
                    </h2>
                    <table className="min-w-full table-fixed text-sm">
                      <thead className="bg-gray-700 text-white">
                        <tr>
                          <th className="py-3 px-6 text-left">Name</th>
                          <th className="py-3 px-6 text-left">Role</th>
                          <th className="py-3 px-6 text-left">Email</th>
                          <th className="py-3 px-6 text-left">Phone No</th>
                        </tr>
                      </thead>
                      <tbody>
                        {usersWithoutAbstract.map((user) => (
                          <tr
                            key={user.attendeeId}
                            className="bg-white border-b"
                          >
                            <td className="py-4 px-6">{`${user.firstName} ${user.lastName}`}</td>
                            <td className="py-4 px-6">{user.role}</td>
                            <td className="py-4 px-6">{user.email}</td>
                            <td className="py-4 px-6">{user.phone}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center text-gray-600">
                    <p>No participants</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {showAcceptedAbstracts && (
            <div>
              {acceptedAbstracts.length > 0 ? (
                <div>
                  <h2 className="text-2xl font-bold mb-4">
                    Accepted Abstracts
                  </h2>
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-700 text-white">
                      <tr>
                        <th className="py-3 px-6 text-left">#</th>
                        <th className="py-3 px-6 text-left">Name</th>
                        <th className="py-3 px-6 text-left">Abstract Title</th>
                        <th className="py-3 px-6 text-left">Abstract Status</th>
                        <th className="py-3 px-6 text-left">Reviewer ID</th>
                        <th className="py-3 px-6 text-left">
                          Reviewer Comment
                        </th>
                        {/* Add more table headers as needed */}
                      </tr>
                    </thead>
                    <tbody>
                      {acceptedAbstracts.map((abstract, index) => (
                        <tr
                          key={abstract.attendeeId}
                          className="bg-white border-b"
                        >
                          <td className="py-4 px-6">{index + 1}</td>
                          <td className="py-4 px-6">{`${abstract.firstName} ${abstract.lastName}`}</td>
                          <td className="py-4 px-6">
                            {abstract.abstractTitle}
                          </td>
                          <td className="py-4 px-6">
                            {abstract.abstractStatus}
                          </td>
                          <td className="py-4 px-6">{abstract.reviewerId}</td>
                          <td className="py-4 px-6">
                            {abstract.reviewerComment}
                          </td>
                          {/* Add more table cells for additional fields */}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center text-gray-600">
                  <p>No accepted abstracts</p>
                </div>
              )}
            </div>
          )}

          {showRejectedAbstracts && (
            <div>
              {rejectedAbstracts.length > 0 ? (
                <div>
                  <h2 className="text-2xl font-bold mb-4">
                    Rejected Abstracts
                  </h2>
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-700 text-white">
                      <tr>
                        <th className="py-3 px-6 text-left">#</th>
                        <th className="py-3 px-6 text-left">Name</th>
                        <th className="py-3 px-6 text-left">Abstract Title</th>
                        <th className="py-3 px-6 text-left">Abstract Status</th>
                        <th className="py-3 px-6 text-left">Reviewer ID</th>
                        <th className="py-3 px-6 text-left">
                          Reviewer Comment
                        </th>
                        {/* Add more table headers as needed */}
                      </tr>
                    </thead>
                    <tbody>
                      {rejectedAbstracts.map((abstract, index) => (
                        <tr
                          key={abstract.attendeeId}
                          className="bg-white border-b"
                        >
                          <td className="py-4 px-6">{index + 1}</td>
                          <td className="py-4 px-6">{`${abstract.firstName} ${abstract.lastName}`}</td>
                          <td className="py-4 px-6">
                            {abstract.abstractTitle}
                          </td>
                          <td className="py-4 px-6">
                            {abstract.abstractStatus}
                          </td>
                          <td className="py-4 px-6">{abstract.reviewerId}</td>
                          <td className="py-4 px-6">
                            {abstract.reviewerComment}
                          </td>
                          {/* Add more table cells for additional fields */}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center text-gray-600">
                  <p>No rejected abstracts</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
