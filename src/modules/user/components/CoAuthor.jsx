import { useRegisterContext } from "../context/RegisterContext";

const CoAuthor = () => {
  const {
    formData,
    handleCoAuthorChange,
    addCoAuthorField,
    removeCoAuthorField,
  } = useRegisterContext();
  return (
    <div>
      {formData?.coAuthors.map((coAuthor, index) => (
        <div key={index} className="mt-2 grid grid-cols-2">
          <input
            type="text"
            id={`coAuthor${index + 1}`}
            name="name"
            value={coAuthor.name}
            onChange={(e) => handleCoAuthorChange(index, e)}
            className="form-input"
            placeholder="Co-Author Name"
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
  );
};

export default CoAuthor;
