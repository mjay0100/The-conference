/* eslint-disable react-hooks/rules-of-hooks */
import { useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { useGlobalCreateEvent } from "../context/CreateEventContext";

const createEvent = () => {
  const navigate = useNavigate();
  const {
    formData,
    isSubmitting,
    handleGoBack,
    handleInputChange,
    handleSubmit,
  } = useGlobalCreateEvent();
  return (
    <div>
      <div>
        <ToastContainer />

        <form onSubmit={(e) => handleSubmit(e, navigate)} className="mx-12">
          {/* Same as */}
          <div className="space-y-12">
            <div className="border-b border-gray-900/10 pb-4 mt-5">
              <h2 className=" capitalize text-base font-semibold leading-7 text-gray-900">
                Create An Event
              </h2>
            </div>

            <div className="border-b border-gray-900/10 pb-12">
              <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Title
                  </label>
                  <div className="mt-2">
                    <input
                      required
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      id="title"
                      autoComplete="title"
                      className="form-input"
                    />
                  </div>
                </div>

                {/* new fields */}
                {/* New form fields for theme, sub-themes, and keynote speaker */}

                <div className="sm:col-span-3">
                  <label
                    htmlFor="theme"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Theme
                  </label>
                  <div className="mt-2">
                    <input
                      required
                      type="text"
                      name="theme"
                      value={formData.theme}
                      onChange={handleInputChange}
                      id="theme"
                      autoComplete="theme"
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label
                    htmlFor="subThemes"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Sub-themes
                  </label>
                  <div className="mt-2">
                    <input
                      required
                      type="text"
                      name="subThemes"
                      value={formData.subThemes}
                      onChange={handleInputChange}
                      id="subThemes"
                      autoComplete="subThemes"
                      className="form-input"
                      placeholder="Enter multiple sub-themes separated by commas"
                    />
                    <small className="text-xs text-gray-500">
                      Separate multiple sub-themes with commas
                    </small>
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label
                    htmlFor="keynoteSpeaker"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Keynote Speaker
                  </label>
                  <div className="mt-2">
                    <input
                      required
                      type="text"
                      name="keynoteSpeaker"
                      value={formData.keynoteSpeaker}
                      onChange={handleInputChange}
                      id="keynoteSpeaker"
                      autoComplete="keynoteSpeaker"
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label
                    htmlFor="venue"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    venue
                  </label>
                  <div className="mt-2">
                    <input
                      required
                      type="text"
                      name="venue"
                      value={formData.venue}
                      onChange={handleInputChange}
                      id="venue"
                      autoComplete="venue"
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label
                    htmlFor="date"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Date
                  </label>
                  <div className="mt-2">
                    <input
                      required
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      id="date"
                      autoComplete="date"
                      className="form-input"
                    />
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label
                    htmlFor="totalParticipants"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Number of Participants
                  </label>
                  <div className="mt-2">
                    <input
                      required
                      type="number"
                      name="totalParticipants"
                      value={formData.totalParticipants}
                      onChange={handleInputChange}
                      id="venue"
                      autoComplete="number"
                      className="form-input"
                    />
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label
                    htmlFor="presenterPrice"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Presenter Price (Naira)
                  </label>
                  <div className="mt-2">
                    <input
                      required
                      type="number"
                      name="presenterPrice"
                      value={formData.presenterPrice}
                      onChange={handleInputChange}
                      id="presenterPrice"
                      autoComplete="presenterPrice"
                      className="form-input"
                      placeholder="N"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="participantPrice"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Participant Price (Naira)
                  </label>
                  <div className="mt-2">
                    <input
                      required
                      type="number"
                      name="participantPrice"
                      value={formData.participantPrice}
                      onChange={handleInputChange}
                      id="participantPrice"
                      autoComplete="participantPrice"
                      className="form-input"
                      placeholder="N"
                    />
                  </div>
                </div>

                <div className="sm:col-span-6">
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Description
                  </label>
                  <div className="mt-2">
                    <textarea
                      required
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      autoComplete="description"
                      rows={5}
                      className="form-input"
                    />
                  </div>
                </div>
              </div>
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
              className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating Event..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default createEvent;
