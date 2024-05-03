import { useEffect, useState } from "react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { database } from "../../../firebase";
import Loading from "../../components/Loading";
import { useNavigate, useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { useGlobalContext } from "../../context";

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
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [comment, setComment] = useState(""); // State to store the comment
  const { user } = useGlobalContext();
  const { id } = useParams();
  const navigate = useNavigate();

  const handleOpenModal = (user, isEdit = false) => {
    setSelectedUser(user);
    setIsModalOpen(true);
    if (isEdit) {
      // Prefill the comment in case of edit
      setComment(user.reviewerComment);
    } else {
      // Clear the comment field if it's not an edit
      setComment("");
    }
  };

  const handleCloseModal = () => {
    setSelectedUser(null); // Reset selected user
    setIsModalOpen(false);
    setComment(""); // Clear the comment field when closing the modal
  };

  const handleSaveComment = async () => {
    try {
      const userRef = doc(
        database,
        "events",
        id,
        "attendees",
        selectedUser.attendeeId
      );
      await updateDoc(userRef, { reviewerComment: comment }); // Save the comment to Firestore
      toast.success("Comment added successfully!", toastConfig);
      handleCloseModal(); // Close the modal after saving the comment
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Error adding comment. Please try again.");
    }
  };

  const handleGoBack = () => {
    navigate(-1); // Navigate to the previous page
  };

  useEffect(() => {
    const getUsers = async () => {
      try {
        const usersQuery = query(
          collection(database, "events", id, "attendees"),
          where("reviewerId", "==", user.uid)
        );
        const querySnapshot = await getDocs(usersQuery);
        const usersWithAbstract = querySnapshot.docs.map((doc) => ({
          ...doc.data(),
          attendeeId: doc.id,
        }));
        setUsersWithAbstract(usersWithAbstract);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching assigned users:", error);
      }
    };

    getUsers();
  }, [id, user.uid]);

  return (
    <div className="container mx-auto mt-8 capitalize">
      <ToastContainer />
      {loading && <Loading />}
      {!loading && (
        <div>
          {usersWithAbstract.length > 0 ? (
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
                    <th className="py-3 px-6 text-left">Abstract Title</th>
                    <th className="py-3 px-6 text-left">Reviewer Comment</th>
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
                      <td className="py-4 px-6">{user.abstractTitle}</td>
                      <td className="py-4 px-6">
                        {user.reviewerComment ? (
                          <span>{user.reviewerComment}</span>
                        ) : (
                          <span className="text-red-500 font-bold">
                            Not yet reviewed
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center">
                          <td className="py-4 px-6">
                            <div className="flex items-center">
                              {user.reviewerComment ? (
                                <button
                                  type="button"
                                  onClick={() => handleOpenModal(user, true)} // Pass true to indicate it's an edit
                                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 mx-2 rounded-md focus:outline-none focus:ring focus:border-blue-300"
                                >
                                  Edit Comment
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleOpenModal(user)} // Open modal for adding comment
                                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 mx-2 rounded-md focus:outline-none focus:ring focus:border-green-300"
                                >
                                  Add Comment
                                </button>
                              )}
                            </div>
                          </td>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid min-h-full place-items-center bg-white px-6 py-24 sm:py-32 lg:px-8">
              <p className="text-lg text-indigo-600 font-bold mb-4">
                No users with abstracts assigned to you.
              </p>
              <button
                onClick={handleGoBack}
                className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Back
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modal for adding comment */}
      {selectedUser && (
        <div className={`modal ${isModalOpen ? "is-active" : ""}`}>
          <div
            className="modal-background flex justify-center bg-black  "
            onClick={handleCloseModal}
          ></div>
          <div className="modal-content bg-white w-full md:w-[80%] absolute top-[10rem] p-6 rounded-md shadow-md z-50">
            <h2 className="text-2xl font-bold mb-4">
              {comment ? "Edit Comment" : "Add Comment"} for{" "}
              {selectedUser.firstName} {selectedUser.lastName} -{" "}
              {selectedUser.abstractTitle}
            </h2>
            <p className="text-gray-600">ID: {selectedUser.attendeeId}</p>
            <textarea
              className="w-full h-32 px-3 py-2 mb-4 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
              placeholder="Enter your comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            ></textarea>
            <div className="flex justify-end">
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md focus:outline-none focus:ring focus:border-blue-300"
                onClick={handleSaveComment}
              >
                Save
              </button>
              <button
                className="ml-2 bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-md focus:outline-none focus:ring focus:border-blue-300"
                onClick={handleCloseModal}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllUser;
