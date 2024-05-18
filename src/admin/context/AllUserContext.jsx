import { createContext, useContext, useState } from "react";
import { database } from "../../../firebase";
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
  onSnapshot,
} from "firebase/firestore";

import { toast } from "react-toastify";
import { useGlobalContext } from "../../context";
import emailjs from "@emailjs/browser";

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
const AllUserContext = createContext();

const AllUserProvider = ({ children }) => {
  const { user } = useGlobalContext();
  const [loading, setLoading] = useState(false);
  const [usersWithAbstract, setUsersWithAbstract] = useState([]);
  const [usersWithoutAbstract, setUsersWithoutAbstract] = useState([]);
  const [reviewers, setReviewers] = useState([]);
  const [reviewerAssignments, setReviewerAssignments] = useState({});
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
    setLoading(true);
    try {
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
      setLoading(false);
    } catch (error) {
      console.error("Error fetching reviewers:", error);
      setLoading(false);
    }
  };

  const getUsers = (id) => {
    setLoading(true);
    try {
      const attendeesCollection = collection(
        database,
        "events",
        id,
        "attendees"
      );

      onSnapshot(attendeesCollection, (snapshot) => {
        const usersData = snapshot.docs.map((doc) => ({
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
      });
    } catch (error) {
      console.error("Error fetching users:", error);
      setLoading(false);
    }
  };

  const handleAssignReviewer = async (userId, id) => {
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

  const handleApproval = async (attendeeId, id) => {
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

  const handleDenial = async (attendeeId, id) => {
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

      const deniedAttendeesCollection = collection(
        database,
        "events",
        id,
        "rejectedAbstracts"
      );
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
        import.meta.env.VITE_SERVICE_ID,
        import.meta.env.VITE_TEMPLATE_ID,
        templateParams,
        {
          publicKey: import.meta.env.VITE_EMAIL_PUBLIc_KEY,
        }
      );

      console.log("SUCCESS!");

      // await deleteDoc(userRef);
      toast.error("User denied successfully!", toastConfig);
    } catch (error) {
      console.error("Error denying user:", error);
      toast.error("Error denying user. Please try again.", toastConfig);
    } finally {
      setDenying((prev) => ({ ...prev, [attendeeId]: false }));
    }
  };

  const handleShowAcceptedAbstracts = async (id) => {
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

  const handleShowRejectedAbstracts = async (id) => {
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
  };

  const value = {
    loading,
    usersWithAbstract,
    usersWithoutAbstract,
    reviewers,
    reviewerAssignments,
    assigning,
    showParticipants,
    showPresenters,
    showAcceptedAbstracts,
    showRejectedAbstracts,
    approving,
    denying,
    acceptedAbstracts,
    rejectedAbstracts,
    fetchReviewers,
    getUsers,
    handleAssignReviewer,
    handleReviewerChange,
    handleApproval,
    handleDenial,
    handleShowAcceptedAbstracts,
    handleShowRejectedAbstracts,
    setShowParticipants,
    setShowPresenters,
    setShowAcceptedAbstracts,
    setShowRejectedAbstracts,
  };

  return (
    <AllUserContext.Provider value={value}>{children}</AllUserContext.Provider>
  );
};

export const useGlobalAllUser = () => {
  return useContext(AllUserContext);
};

export { AllUserContext, AllUserProvider };
