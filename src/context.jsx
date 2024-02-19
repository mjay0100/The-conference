// /* eslint-disable react/prop-types */
// /* eslint-disable react-hooks/exhaustive-deps */
// import React, { useState, useContext, useEffect } from "react";
// import {
//   collection,
//   getDocs,
//   orderBy,
//   query,
//   onSnapshot,
// } from "firebase/firestore";
// import { database } from "../firebase";

// const AppContext = React.createContext();

// const AppProvider = ({ children }) => {
//   const [events, setEvents] = useState([]);
//   const [loading, setLoading] = useState(true);

//   //? display all events?
//   useEffect(() => {
//     const eventCollection = collection(database, "events");
//     let unsubscribeEvents = onSnapshot(
//       query(eventCollection, orderBy("createdAt", "desc")),
//       async (snapshot) => {
//         const eventsData = await Promise.all(
//           snapshot.docs.map(async (doc) => {
//             const data = doc.data();
//             data.totalParticipants = +data.totalParticipants;
//             const attendeesSnapshot = await getDocs(
//               collection(database, "events", doc.id, "attendees")
//             );
//             data.attendeesCount = attendeesSnapshot.size;
//             data.id = doc.id;
//             return data;
//           })
//         );
//         setEvents(eventsData);
//         setLoading(false);
//       },
//       (error) => {
//         console.error("Error fetching events:", error);
//         setLoading(false);
//       }
//     );

//     return () => {
//       if (unsubscribeEvents) {
//         unsubscribeEvents();
//       }
//     };
//   }, []);

//   return (
//     <AppContext.Provider value={{ events, loading }}>
//       {children}
//     </AppContext.Provider>
//   );
// };
// // make sure use
// export const useGlobalContext = () => {
//   return useContext(AppContext);
// };

// export { AppContext, AppProvider };
