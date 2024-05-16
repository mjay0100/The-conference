import { useEffect } from "react";
import Loading from "../../components/Loading";
import { ToastContainer } from "react-toastify";
import { useParams } from "react-router-dom";
import { useGlobalAllUser } from "../context/AllUserContext";
import Presenters from "../components/Presenters";
import ShowParticipants from "../components/ShowParticipants";
import AcceptedAbstracts from "../components/AcceptedAbstracts";
import RejectedAbstracts from "../components/RejectedAbstracts";

const AllUser = () => {
  const {
    loading,
    showParticipants,
    showPresenters,
    showAcceptedAbstracts,
    showRejectedAbstracts,
    fetchReviewers,
    getUsers,
    handleShowAcceptedAbstracts,
    handleShowRejectedAbstracts,
    setShowParticipants,
    setShowPresenters,
    setShowAcceptedAbstracts,
    setShowRejectedAbstracts,
  } = useGlobalAllUser();

  const { id } = useParams();

  useEffect(() => {
    getUsers(id);
    fetchReviewers();
    handleShowAcceptedAbstracts(id);
    handleShowRejectedAbstracts(id);
    // Initialize default tab view
    setShowParticipants(true);
    setShowPresenters(false);
    setShowAcceptedAbstracts(false);
    setShowRejectedAbstracts(false);
  }, [id]);

  return (
    <div className="container w-5/6 mx-auto mt-8 capitalize">
      <ToastContainer />
      <div className=" grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 justify-center space-4">
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
            handleShowAcceptedAbstracts(id);
          }}
          className={`py-2 px-4 rounded ${
            showAcceptedAbstracts ? "bg-green-500 text-white" : "bg-gray-300"
          }`}
        >
          Accepted Abstracts
        </button>
        <button
          onClick={() => {
            handleShowRejectedAbstracts(id);
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
        <div className="mt-6">
          {showPresenters && <Presenters id={id} />}
          {showParticipants && <ShowParticipants />}
          {showAcceptedAbstracts && <AcceptedAbstracts />}
          {showRejectedAbstracts && <RejectedAbstracts />}
        </div>
      )}
    </div>
  );
};

export default AllUser;
