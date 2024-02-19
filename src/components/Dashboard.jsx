/* eslint-disable react/prop-types */
import { Link } from "react-router-dom";
import Loading from "../components/Loading";
import { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  orderBy,
  query,
  onSnapshot,
} from "firebase/firestore";
import { database } from "../../firebase";

export default function DashboardPage({ userType }) {
  console.log("Koca: userType ", userType);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

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
  return (
    <>
      <header className="bg-gradient-to-r from-teal-500 to-teal-700 shadow-md text-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-lg text-gray-300">
            {userType !== "user " && <p>Explore and manage all events.</p>}
          </p>
        </div>
      </header>

      <div className="container mx-auto mt-8">
        {loading && <Loading />}

        <div className="grid grid-cols-1 md:grid-cols-2 text-center gap-8">
          {events.map((event) => (
            <div
              key={event.id}
              className="w-full bg-white rounded-md shadow-md overflow-hidden capitalize"
            >
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-4">{event.title}</h2>
                <p className="text-gray-700">
                  <span className="font-bold">Date:</span> {event.date}
                </p>
                <p className="text-gray-700">
                  <span className="font-bold">Number of Participants:</span>{" "}
                  {event.totalParticipants}
                </p>
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
      </div>
    </>
  );
}
