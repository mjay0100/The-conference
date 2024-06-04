import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
} from "firebase/firestore";
import { database, storage } from "../../firebase";
import { deleteObject, ref } from "firebase/storage";
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

const deleteEvent = async (id, navigate, setDeleting) => {
  try {
    // Set deleting state to true
    setDeleting(true);
    const eventDocRef = doc(database, "events", id);

    // Check if the event document exists
    const eventSnapshot = await getDoc(eventDocRef);
    if (!eventSnapshot.exists()) {
      console.log("Event not found");
      return;
    }

    // Delete attendees sub collection
    const attendeesCollectionRef = collection(eventDocRef, "attendees");
    const attendeesQuery = query(attendeesCollectionRef);
    const attendeesSnapshot = await getDocs(attendeesQuery);

    attendeesSnapshot.forEach(async (attendeeDoc) => {
      // Delete files from Storage if they exist
      const fileUrl = attendeeDoc.data().fileUrl;
      if (fileUrl) {
        const storageRef = ref(storage, fileUrl);
        await deleteObject(storageRef);
      }

      // Delete attendee document
      await deleteDoc(attendeeDoc.ref);
    });

    // Delete event document
    await deleteDoc(eventDocRef);

    toast.success("Event deleted successfully!", toastConfig);
    setDeleting(false);
    setTimeout(() => {
      navigate("/admin-dashboard");
    }, 3000);
  } catch (error) {
    toast.error("Error deleting document", toastConfig);

    console.error("Error deleting document:", error);
    setDeleting(false);
  }
};
export default deleteEvent;

function checkUserRole(session) {
  if (
    !session ||
    !session.user ||
    !session.user.organizationMemberships ||
    session.user.organizationMemberships.length === 0
  ) {
    return null; // Return null if the user is not a basic member
  }

  const organizationMemberships = session.user.organizationMemberships;
  // console.log("Koca: organizationMemberships ", organizationMemberships);

  // Loop through all organization memberships
  for (const membership of organizationMemberships) {
    if (membership.role) {
      return membership.role.toLowerCase(); // Return the role in lowercase if it exists
    }
  }

  return null; // Return null if no role is found in the memberships
}

export { checkUserRole };
