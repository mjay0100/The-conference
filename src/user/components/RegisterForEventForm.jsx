import { useEffect, useState } from "react";
import { useRegisterContext } from "../context/RegisterContext";

const RegisterForEventForm = () => {
  const {
    formData,
    fileInputDisabled,
    handleInputChange,
    handleFileInputChange,
    handleCoAuthorChange,
    removeCoAuthorField,
    addCoAuthorField,
    eventPrices,
  } = useRegisterContext();

  const [dynamicEventPrice, setDynamicEventPrice] = useState(0);

  useEffect(() => {
    if (formData.role === "participant") {
      setDynamicEventPrice(eventPrices.participantPrice);
    } else if (formData.role === "presenter") {
      setDynamicEventPrice(eventPrices.presenterPrice);
    } else {
      setDynamicEventPrice(0);
    }
  }, [formData.role, eventPrices]);

  return (
    <div>
      <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
        <div className=" sm:col-span-2 ">
          <label
            htmlFor="first-name"
            className="block text-sm font-medium leading-6 text-gray-900"
          >
            First name
          </label>
          <div className="mt-2">
            <input
              required
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              id="first-name"
              autoComplete="given-name"
              className="form-input"
            />
          </div>
        </div>
        {/* new inputs */}
        <div className=" sm:col-span-2 ">
          <label
            htmlFor="middle-name"
            className="block text-sm font-medium leading-6 text-gray-900"
          >
            Middle name
          </label>
          <div className="mt-2">
            <input
              type="text"
              name="middleName"
              value={formData.middleName}
              onChange={handleInputChange}
              id="middle-name"
              autoComplete="additional-name"
              className="form-input"
            />
          </div>
        </div>
        {/* Last name input */}
        <div className=" sm:col-span-2 ">
          <label
            htmlFor="last-name"
            className="block text-sm font-medium leading-6 text-gray-900"
          >
            Last name
          </label>
          <div className="mt-2">
            <input
              required
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              id="last-name"
              autoComplete="family-name"
              className="form-input"
            />
          </div>
        </div>
        {/* Gender input */}
        <div className=" sm:col-span-2 ">
          <label
            htmlFor="gender"
            className="block text-sm font-medium leading-6 text-gray-900"
          >
            Gender
          </label>
          <div className="mt-2">
            <select
              required
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              className="form-input"
            >
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
        </div>
        {/* Phone number input */}
        <div className=" sm:col-span-2 ">
          <label
            htmlFor="phone"
            className="block text-sm font-medium leading-6 text-gray-900"
          >
            Phone number
          </label>
          <div className="mt-2">
            <input
              required
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              id="phone"
              autoComplete="tel"
              className="form-input"
            />
          </div>
        </div>
        {/* Disabilities input */}
        <div className=" sm:col-span-2 ">
          <label
            htmlFor="disabilities"
            className="block text-sm font-medium leading-6 text-gray-900"
          >
            Disabilities
          </label>
          <div className="mt-2">
            <input
              type="text"
              name="disabilities"
              value={formData.disabilities}
              onChange={handleInputChange}
              id="disabilities"
              autoComplete="none"
              className="form-input"
              placeholder="If any"
            />
          </div>
        </div>
        {/* State input */}
        <div className=" sm:col-span-2 ">
          <label
            htmlFor="state"
            className="block text-sm font-medium leading-6 text-gray-900"
          >
            State
          </label>
          <div className="mt-2">
            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleInputChange}
              id="state"
              autoComplete="address-level1"
              className="form-input"
            />
          </div>
        </div>
        {/* Country input */}
        <div className=" sm:col-span-2 ">
          <label
            htmlFor="country"
            className="block text-sm font-medium leading-6 text-gray-900"
          >
            Country
          </label>
          <div className="mt-2">
            <input
              type="text"
              name="country"
              value={formData.country}
              onChange={handleInputChange}
              id="country"
              autoComplete="country"
              className="form-input"
            />
          </div>
        </div>
        {/* Email address input */}
        <div className=" sm:col-span-2 ">
          <label
            htmlFor="email"
            className="block text-sm font-medium leading-6 text-gray-900"
          >
            Email address
          </label>
          <div className="mt-2">
            <input
              required
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              id="email"
              autoComplete="email"
              className="form-input"
            />
          </div>
        </div>
        {/* price */}
        <div className=" sm:col-span-2">
          <label
            htmlFor="event-price"
            className="block text-sm font-medium leading-6 text-gray-900"
          >
            Event Price
          </label>
          <div className="mt-2">
            <input
              type="text"
              id="event-price"
              value={`N${dynamicEventPrice}`}
              disabled
              className="form-input"
            />
          </div>
        </div>
        <div className=" sm:col-span-2 ">
          <label
            htmlFor="city"
            className="block text-sm font-medium leading-6 text-gray-900"
          >
            City
          </label>
          <div className="mt-2">
            <input
              required
              type="text"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              id="city"
              autoComplete="address-level2"
              className="form-input"
            />
          </div>
        </div>
        <div className=" sm:col-span-2">
          <label
            htmlFor="street-address"
            className="block text-sm font-medium leading-6 text-gray-900"
          >
            Street address
          </label>
          <div className="mt-2">
            <input
              required
              type="text"
              name="streetAddress"
              value={formData.streetAddress}
              onChange={handleInputChange}
              id="street-address"
              autoComplete="street-address"
              className="form-input"
            />
          </div>
        </div>
        {/* select */}
        {/* New role select field */}
        <div className=" sm:col-span-2 ">
          <label
            htmlFor="role"
            className="block text-sm font-medium leading-6 text-gray-900"
          >
            Role
          </label>
          <div className="mt-2">
            <select
              required
              id="role"
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className="form-input"
            >
              <option value="participant">Participant</option>
              <option value="presenter">Presenter</option>
            </select>
          </div>
        </div>
        {/* File input field */}
        {formData.role === "presenter" && (
          <div className=" sm:col-span-2 ">
            <label
              htmlFor="file"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              Abstract (docx file)
            </label>
            <div className="mt-2">
              <input
                required
                type="file"
                id="file"
                onChange={handleFileInputChange}
                disabled={fileInputDisabled}
                className="form-input"
              />
            </div>
          </div>
        )}
        {/* abstarct title */}
        {formData.role === "presenter" && (
          <div
            className={`${
              formData.role === "presenter" ? "" : "opacity-0"
            } transition-opacity duration-500 sm:col-span-2 `}
          >
            <label
              htmlFor="abstract-title"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              Abstract Title
            </label>
            <div className="mt-2">
              <input
                required
                type="text"
                name="abstractTitle"
                value={formData.abstractTitle}
                onChange={handleInputChange}
                id="abstract-title"
                autoComplete="off"
                className="form-input"
              />
            </div>
          </div>
        )}
        {/* author */}

        {formData.role === "presenter" && (
          <div className="col-span-3">
            <label className="block text-sm font-medium leading-6 text-gray-900">
              Are you the main author?
            </label>
            <div className="mt-2">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio text-indigo-600"
                  name="authorType"
                  value="main"
                  checked={formData.authorType === "main"}
                  onChange={handleInputChange}
                />
                <span className="ml-2">Main Author</span>
              </label>
              <label className="inline-flex items-center ml-6">
                <input
                  type="radio"
                  className="form-radio text-indigo-600"
                  name="authorType"
                  value="co-author"
                  checked={formData.authorType === "co-author"}
                  onChange={handleInputChange}
                />
                <span className="ml-2">Co-Author</span>
              </label>
            </div>

            <div className="mt-4">
              {formData.coAuthors?.map((coAuthor, index) => (
                <div key={index} className="mt-2 grid grid-cols-2">
                  <input
                    type="text"
                    name="name"
                    value={coAuthor.name}
                    onChange={(e) => handleCoAuthorChange(index, e)}
                    placeholder="Co-Author Name"
                    className="form-input"
                  />
                  <button
                    type="button"
                    onClick={() => removeCoAuthorField(index)}
                    className="ml-2 py-1 px-2 bg-red-500 text-white font-semibold rounded-md shadow-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-100"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addCoAuthorField}
                className="mt-2 py-1 px-2 bg-green-500 text-white font-semibold rounded-md shadow-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-100"
              >
                Add Co-Author
              </button>
            </div>
          </div>
        )}
        {/* End of Co-author fields */}
        {/* end */}
      </div>
    </div>
  );
};

export default RegisterForEventForm;
