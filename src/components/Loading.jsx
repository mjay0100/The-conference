import DotLoader from "react-spinners/DotLoader";
const override = {
  display: "block",
  margin: "5rem auto",
};
const Loading = () => {
  return (
    <DotLoader
      color="#6495ED"
      cssOverride={override}
      size={150}
      aria-label="Loading Spinner"
    />
  );
};

export default Loading;
