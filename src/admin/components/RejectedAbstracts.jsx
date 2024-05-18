import { useGlobalAllUser } from "../context/AllUserContext";

const RejectedAbstracts = () => {
  const { rejectedAbstracts } = useGlobalAllUser();
  return (
    <div>
      <p className="text-center capitalize my-5">
        Total number of Rejected Abstracts: {rejectedAbstracts.length}
      </p>
      {rejectedAbstracts.length > 0 && (
        <div>
          {/* <h2 className="text-2xl font-bold mb-4">Rejected Abstracts</h2> */}
          <table className="min-w-full text-sm">
            <thead className="bg-gray-700 text-white">
              <tr>
                <th className="py-3 px-6 text-left">#</th>
                <th className="py-3 px-6 text-left">Name</th>
                <th className="py-3 px-6 text-left">Abstract Title</th>
                <th className="py-3 px-6 text-left">Abstract Status</th>
                <th className="py-3 px-6 text-left">Reviewer ID</th>
                <th className="py-3 px-6 text-left">Reviewer Comment</th>
                {/* Add more table headers as needed */}
              </tr>
            </thead>
            <tbody>
              {rejectedAbstracts.map((abstract, index) => (
                <tr key={abstract.attendeeId} className="bg-white border-b">
                  <td className="py-4 px-6">{index + 1}</td>
                  <td className="py-4 px-6">{`${abstract.firstName} ${abstract.lastName}`}</td>
                  <td className="py-4 px-6">{abstract.abstractTitle}</td>
                  <td className="py-4 px-6">{abstract.abstractStatus}</td>
                  <td className="py-4 px-6">{abstract.reviewerId}</td>
                  <td className="py-4 px-6">{abstract.reviewerComment}</td>
                  {/* Add more table cells for additional fields */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RejectedAbstracts;
