/* eslint-disable react-hooks/rules-of-hooks */
import { useEffect, useState } from "react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { database } from "../../../firebase";
import Loading from "../../components/Loading";
import { useParams } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { ToastContainer, toast } from "react-toastify";
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
const AllUser = () => {
  const [usersWithAbstract, setUsersWithAbstract] = useState([]);
  const [usersWithoutAbstract, setUsersWithoutAbstract] = useState([]);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const { user } = useUser();

  async function getUsers() {
    try {
      const attendeesCollection = collection(
        database,
        "events",
        id,
        "attendees"
      );
      const attendeesSnapshot = await getDocs(attendeesCollection);
      const usersData = attendeesSnapshot.docs.map((doc) => {
        const userData = doc.data();
        userData.attendeeId = doc.id; // Set userId based on the user id
        userData.imageUrl = user.imageUrl; // Replace with actual path in your user object

        return userData;
      });

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
    }
  }

  useEffect(() => {
    getUsers();
  }, []);

  const handleApproval = async (attendeeId) => {
    console.log("Koca: attendeeId ", attendeeId);
    try {
      const userRef = doc(database, "events", id, "attendees", attendeeId);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        console.error("Document does not exist:", attendeeId);
        return;
      }

      await updateDoc(userRef, { status: "approved" });

      toast.success("User approved successfully!", toastConfig);

      getUsers();
    } catch (error) {
      console.error("Error approving user:", error);
      toast.error("Error approving user. Please try again.");
    }
  };

  const handleDenial = async (attendeeId) => {
    console.log("Koca: attendeeId ", attendeeId);
    try {
      const userRef = doc(database, "events", id, "attendees", attendeeId);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        console.error("Document does not exist:", attendeeId);
        return;
      }

      await updateDoc(userRef, { status: "denied" });

      toast.error("User denied successfully!", toastConfig);

      getUsers();
    } catch (error) {
      console.error("Error denying user:", error);
      toast.error("Error denying user. Please try again.");
    }
  };

  return (
    <div className="container mx-auto mt-8 capitalize">
      <ToastContainer />
      {loading && <Loading />}
      {!loading && (
        <div>
          {usersWithAbstract.length > 0 && (
            <div className="min-w-full overflow-x-auto">
              <h2 className="text-2xl font-bold mb-4">Users with Abstracts</h2>
              <table className="min-w-[70%] mx-auto bg-white border border-gray-300 shadow-md rounded-md overflow-hidden divide-y divide-gray-300">
                <thead className="bg-gradient-to-r from-teal-500 to-teal-700 text-white">
                  <tr>
                    <th className="py-3 px-6 text-left">#</th>
                    <th className="py-3 px-6 text-left">Name</th>
                    <th className="py-3 px-6 text-left">Role</th>
                    <th className="py-3 px-6 text-left">City</th>
                    <th className="py-3 px-6 text-left">Abstract</th>
                    <th className="py-3 px-6 text-left">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {usersWithAbstract.map((user, index) => (
                    <tr
                      key={index}
                      className={index % 2 === 0 ? "bg-gray-100" : ""}
                    >
                      <td className="py-4 px-6 text-gray-600">{index + 1}</td>
                      <td className="py-4 px-6">{`${user.firstName} ${user.lastName}`}</td>
                      <td className="py-4 px-6">{user.role}</td>
                      <td className="py-4 px-6">{user.city}</td>
                      <td className="py-4 px-6">
                        <a
                          href={user.fileUrl}
                          className="text-blue-500 hover:underline"
                        >
                          Download Abstract
                        </a>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center">
                          <button
                            onClick={() => handleApproval(user.attendeeId)}
                            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 mx-2 rounded-md focus:outline-none focus:ring focus:border-blue-300"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleDenial(user.attendeeId)}
                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 mx-2 rounded-md focus:outline-none focus:ring focus:border-blue-300"
                          >
                            Deny
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {usersWithoutAbstract.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-4">
                Users without Abstracts
              </h2>
              <table className="min-w-full overflow-x-auto bg-white border border-gray-300 shadow-md rounded-md divide-y divide-gray-300">
                <thead className="bg-gradient-to-r from-teal-500 to-teal-700 text-white">
                  <tr>
                    <th className="py-3 px-6 text-left">#</th>
                    <th className="py-3 px-6 text-left">Name</th>
                    <th className="py-3 px-6 text-left">Role</th>
                    <th className="py-3 px-6 text-left">City</th>
                    <th className="py-3 px-6 text-left">Abstract</th>
                    <th className="py-3 px-6 text-left">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {usersWithoutAbstract.map((user, index) => (
                    <tr
                      key={index}
                      className={index % 2 === 0 ? "bg-gray-100" : ""}
                    >
                      <td className="py-4 px-6 text-gray-600">{index + 1}</td>
                      <td className="py-4 px-6">{`${user.firstName} ${user.lastName}`}</td>
                      <td className="py-4 px-6">{user.role}</td>
                      <td className="py-4 px-6">{user.city}</td>
                      <td className="py-4 px-6">
                        <span className="text-gray-500">none</span>
                      </td>
                      <td className="py-4 px-6">No action available</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AllUser;
