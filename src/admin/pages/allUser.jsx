import Loading from "../../components/Loading";
import { useEffect } from "react";
import { ToastContainer } from "react-toastify";
import { useParams } from "react-router-dom";
import { useGlobalEventContext } from "../context/EventContext";
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
  } = useGlobalEventContext();
  const { id } = useParams();

  useEffect(() => {
    getUsers(id);
    fetchReviewers();
    handleShowAcceptedAbstracts(id);
    handleShowRejectedAbstracts(id);
  }, [id]);

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
        <div>
          <div>
            {/* presenters */}
            {showPresenters && <Presenters id={id} />}
          </div>
          <div className="container mt-5">
            {/* participants */}
            {showParticipants && <ShowParticipants />}
          </div>

          <div>
            {/* accepted abstracts */}
            {showAcceptedAbstracts && <AcceptedAbstracts />}
          </div>

          <div>
            {/* rejected abstracts */}
            {showRejectedAbstracts && <RejectedAbstracts />}
          </div>
        </div>
      )}
    </div>
  );
};

export default AllUser;
