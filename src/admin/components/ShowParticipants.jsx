import { useGlobalEventContext } from "../context/EventContext";

const ShowParticipants = () => {
  const { usersWithoutAbstract } = useGlobalEventContext();
  return (
    <div>
      {
        <div>
          {usersWithoutAbstract.length > 0 ? (
            <div>
              <h2 className="text-2xl font-bold mb-4">
                Users without Abstracts
              </h2>
              <table className="min-w-full table-fixed text-sm">
                <thead className="bg-gray-700 text-white">
                  <tr>
                    <th className="py-3 px-6 text-left">Name</th>
                    <th className="py-3 px-6 text-left">Role</th>
                    <th className="py-3 px-6 text-left">Email</th>
                    <th className="py-3 px-6 text-left">Phone No</th>
                  </tr>
                </thead>
                <tbody>
                  {usersWithoutAbstract.map((user) => (
                    <tr key={user.attendeeId} className="bg-white border-b">
                      <td className="py-4 px-6">{`${user.firstName} ${user.lastName}`}</td>
                      <td className="py-4 px-6">{user.role}</td>
                      <td className="py-4 px-6">{user.email}</td>
                      <td className="py-4 px-6">{user.phone}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center text-gray-600">
              <p>No participants</p>
            </div>
          )}
        </div>
      }
    </div>
  );
};

export default ShowParticipants;
