import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Loading from "../components/Loading";
import {
  collection,
  getDocs,
  orderBy,
  query,
  onSnapshot,
} from "firebase/firestore";
import { database } from "../../firebase";

// eslint-disable-next-line react/prop-types
export default function DashboardPage({ userType }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const eventsPerPage = 3; // Change this value to adjust the number of events per page

  useEffect(() => {
    const eventCollection = collection(database, "events");
    let unsubscribeEvents = onSnapshot(
      query(eventCollection, orderBy("createdAt", "desc")),
      async (snapshot) => {
        const eventsData = await Promise.all(
          snapshot.docs.map(async (doc) => {
            const data = doc.data();
            data.totalParticipants = +data.totalParticipants;
            const attendeesSnapshot = await getDocs(
              collection(database, "events", doc.id, "attendees")
            );
            data.attendeesCount = attendeesSnapshot.size;
            data.id = doc.id;
            return data;
          })
        );
        setEvents(eventsData);
        // console.log("Koca: eventsData ", eventsData);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching events:", error);
        setLoading(false);
      }
    );

    return () => {
      if (unsubscribeEvents) {
        unsubscribeEvents();
      }
    };
  }, []);

  // Logic to calculate pagination
  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = events.slice(indexOfFirstEvent, indexOfLastEvent);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <>
      <header className="bg-gradient-to-r from-teal-500 to-teal-700 shadow-md text-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-lg text-gray-300">
            {userType !== "user " && <>Explore and manage all events.</>}
          </p>
        </div>
      </header>

      <div className="w-4/6 mx-auto mt-8">
        {loading && <Loading />}

        <div className="grid grid-cols-1 md:grid-cols-2 text-center gap-8">
          {currentEvents.map((event) => (
            <div
              key={event.id}
              className="w-full bg-white rounded-md shadow-md overflow-hidden capitalize"
            >
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-4">{event.title}</h2>
                <p className="text-gray-700">
                  <span className="font-bold">Date:</span> {event.date}
                </p>
                {/* <p className="text-gray-700">
                  <span className="font-bold">Number of Participants:</span>{" "}
                  {event.totalParticipants}
                </p> */}
                <p className="text-gray-700">
                  <span className="font-bold">Attendees:</span>{" "}
                  {event.attendeesCount}
                </p>
              </div>
              <div className="bg-gradient-to-r from-purple-500 to-teal-500 py-4">
                <Link
                  to={`/${
                    userType === "admin"
                      ? "admin"
                      : userType === "reviewer"
                      ? "reviewer"
                      : "user"
                  }-dashboard/${event.id}`}
                >
                  <button className="block w-full text-center text-white font-bold py-2 px-4 bg-gradient-to-r from-purple-500 to-teal-500 hover:bg-teal-600 focus:outline-none focus:shadow-outline-teal focus:border-teal-300">
                    Learn More
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="pagination mt-8 flex justify-center">
          <ul className="flex">
            {Array.from(
              { length: Math.ceil(events.length / eventsPerPage) },
              (_, i) => (
                <li key={i}>
                  <button
                    onClick={() => paginate(i + 1)}
                    className={`mx-1 px-4 py-2 rounded-lg bg-gray-500 text-white hover:bg-teal-500 hover:text-white focus:outline-none transition-colors duration-200 ${
                      currentPage === i + 1 ? "bg-teal-500" : ""
                    }`}
                  >
                    {i + 1}
                  </button>
                </li>
              )
            )}
          </ul>
        </div>
      </div>
    </>
  );
}
