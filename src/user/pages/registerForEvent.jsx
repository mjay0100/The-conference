// import { useUser } from "@clerk/clerk-react";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRegisterContext } from "../context/RegisterContext";
import RegisterForEventForm from "../components/RegisterForEventForm";

const RegisterForEvent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isSubmitting, fetchEventPrice, handleSubmit, handleGoBack } =
    useRegisterContext();

  useEffect(() => {
    fetchEventPrice(id);
  }, []);

  return (
    <div>
      <ToastContainer />

      <form onSubmit={(e) => handleSubmit(e, id, navigate)} className="mx-12">
        {/* Same as */}
        <div className="space-y-12">
          <div className="border-b border-gray-900/10 pb-4">
            <h2 className=" capitalize text-base font-semibold leading-7 text-gray-900">
              register for the event
            </h2>
          </div>

          <div className="border-b border-gray-900/10 pb-12">
            <RegisterForEventForm />
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-x-6">
          <button
            onClick={() => handleGoBack(navigate)}
            type="button"
            className="text-sm font-semibold leading-6 text-gray-900"
          >
            back
          </button>

          <button
            type="submit"
            className={
              " px-6 py-2 bg-blue-500 text-white font-semibold rounded-md shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-100"
            }
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit"}{" "}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegisterForEvent;
