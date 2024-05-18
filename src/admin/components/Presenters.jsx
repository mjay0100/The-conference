import { useGlobalAllUser } from "../context/AllUserContext";

const Presenters = ({ id }) => {
  const {
    usersWithAbstract,
    reviewers,
    reviewerAssignments,
    assigning,
    handleReviewerChange,
    handleAssignReviewer,
    handleApproval,
    handleDenial,
    approving,
    denying,
  } = useGlobalAllUser();

  return (
    <div>
      <p className="text-center capitalize my-5">
        Total number of presenters: {usersWithAbstract.length}
      </p>
      {usersWithAbstract.length > 0 && (
        <div className="overflow-x-auto">
          {/* <h2 className="text-2xl font-bold mb-4">Users with Abstracts</h2> */}
          <table className="min-w-full text-sm">
            <thead className="bg-gray-700 text-white">
              <tr>
                <th className="py-3 px-6 text-left">#</th>
                <th className="py-3 px-6 text-left">Name</th>
                <th className="py-3 px-6 text-left">Abstract Title</th>
                <th className="py-3 px-6 text-left">Abstract Status</th>
                <th className="py-3 px-6 text-left">Assigned Reviewer</th>
                <th className="py-3 px-6 text-left">Reviewer Comment</th>
                <th className="py-3 px-6 text-left">Select Reviewer</th>
                <th className="py-3 px-6 text-left">Assign</th>
                <th className="py-3 px-6 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {usersWithAbstract.map((user, index) => (
                <tr key={user.attendeeId} className="bg-white border-b">
                  <td className="py-4 px-6">{`${index + 1}`}</td>
                  <td className="py-4 px-6">{`${user.firstName} ${user.lastName}`}</td>
                  <td className="py-4 px-6">{user.abstractTitle}</td>
                  <td className="py-4 px-6">
                    {user.abstractStatus || "Not set"}
                  </td>
                  <td className="py-4 px-6">
                    {user.reviewerId ? (
                      <span>
                        {reviewers.find((r) => r.id === user.reviewerId)
                          ?.name || "N/A"}
                      </span>
                    ) : (
                      <span>N/A</span>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    {user.reviewerComment ? user.reviewerComment : "None"}
                  </td>
                  <td className="py-4 px-6">
                    <select
                      className="border border-gray-300 rounded px-2 py-1"
                      value={reviewerAssignments[user.attendeeId] || ""}
                      onChange={(e) =>
                        handleReviewerChange(user.attendeeId, e.target.value)
                      }
                    >
                      <option value="">Select Reviewer</option>
                      {reviewers.map((reviewer) => (
                        <option key={reviewer.id} value={reviewer.id}>
                          {reviewer.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-4 px-6">
                    <button
                      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-blue-300"
                      onClick={() => handleAssignReviewer(user.attendeeId, id)}
                      disabled={assigning[user.attendeeId]} // Disable the button if currently assigning
                    >
                      {assigning[user.attendeeId] ? "Assigning..." : "Assign"}
                    </button>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center">
                      <button
                        onClick={() => handleApproval(user.attendeeId, id)}
                        disabled={approving[user.attendeeId]}
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 mx-2 rounded-md disabled:bg-green-500 focus:outline-none focus:ring focus:border-blue-300"
                      >
                        {approving[user.attendeeId] ? "Approving" : "Approve"}
                      </button>
                      <button
                        onClick={() => handleDenial(user.attendeeId, id)}
                        disabled={denying[user.attendeeId]}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 mx-2 rounded-md disabled:bg-red-500 focus:outline-none focus:ring focus:border-blue-300"
                      >
                        {denying[user.attendeeId] ? "Denying" : "Deny"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Presenters;
