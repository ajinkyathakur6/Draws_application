// import { useEffect, useState } from "react";
// import api from "../api/api";
// import Navbar from "../components/Navbar";
// import { useNavigate } from "react-router-dom";

// export default function AdminDashboard() {
//   const [events, setEvents] = useState([]);
//   const [sport, setSport] = useState("");
//   const [category, setCategory] = useState("");
//   const [type, setType] = useState("");
//   const role = localStorage.getItem("role");
//   const [selectedEvent, setSelectedEvent] = useState(null);
//   const [rollNo, setRollNo] = useState("");
//   const [student, setStudent] = useState(null);
//   const [error, setError] = useState("");
//   const [players, setPlayers] = useState([]);
//   const navigate = useNavigate();


//   /* ---------------- LOADERS ---------------- */

//   const loadEvents = async () => {
//     const res = await api.get("/events");
//     setEvents(res.data);
//   };

//   const loadPlayers = async (eventId) => {
//     const res = await api.get("/participation/" + eventId);
//     setPlayers(res.data);
//   };

//   useEffect(() => {
//     loadEvents();
//   }, []);

//   /* ---------------- EVENTS ---------------- */

//   const createEvent = async () => {
//     await api.post("/events", { sport, category, type });
//     setSport("");
//     setCategory("");
//     setType("");
//     loadEvents();
//   };

//   /* ---------------- STUDENT CHECK ---------------- */

//   const checkStudent = async (value) => {
//     setRollNo(value);
//     setStudent(null);
//     setError("");

//     if (!value || value.length < 3) return;

//     try {
//       const res = await api.get("/students/search/" + value);
//       if (res.data) {
//         setStudent(res.data);
//       } else {
//         setError("Student not found");
//       }
//     } catch {
//       setError("Student not found");
//     }
//   };

//   /* ---------------- ADD PLAYER ---------------- */

//   const addPlayer = async () => {
//     if (!student) {
//       alert("Invalid roll number");
//       return;
//     }

//     await api.post("/participation", {
//       eventId: selectedEvent._id,
//       rollNo,
//     });

//     setRollNo("");
//     setStudent(null);
//     loadPlayers(selectedEvent._id);
//   };

//   /* ================== UI ================== */

//   return (
//     <><Navbar role={role} />
//     <div className="p-6">
//       <h1 className="text-2xl font-bold">Admin Dashboard</h1>

//       {/* ================= CREATE EVENT ================= */}
//       <div className="mt-4 p-4 border rounded">
//         <h2 className="font-bold mb-2">Create Event</h2>

//         <input
//           className="border p-2 mr-2"
//           placeholder="Sport"
//           value={sport}
//           onChange={(e) => setSport(e.target.value)}
//         />
//         <input
//           className="border p-2 mr-2"
//           placeholder="Category"
//           value={category}
//           onChange={(e) => setCategory(e.target.value)}
//         />
//         <input
//           className="border p-2 mr-2"
//           placeholder="Type"
//           value={type}
//           onChange={(e) => setType(e.target.value)}
//         />

//         <button
//           className="bg-green-500 text-white px-4 py-2"
//           onClick={createEvent}
//         >
//           Create
//         </button>
//       </div>

//       {/* ================= EVENTS LIST ================= */}
//       <h2 className="mt-6 font-bold">Events</h2>
// <ul>
//   {events.map((e) => (
//     <li
//       key={e._id}
//       className={`border p-3 mt-2 flex justify-between items-center cursor-pointer ${
//         selectedEvent?._id === e._id ? "bg-blue-100" : ""
//       }`}
//       onClick={() => {
//         setSelectedEvent(e);
//         loadPlayers(e._id);
//       }}
//     >
//       <span>
//         {e.sport} - {e.category} - {e.type} ({e.status})
//       </span>

//       <button
//         className="text-blue-600 underline text-sm"
//         onClick={(ev) => {
//           ev.stopPropagation(); // IMPORTANT
//           navigate("/bracket/" + e._id);
//         }}
//       >
//         View Bracket
//       </button>
//     </li>
//   ))}
// </ul>


//       {/* ================= PLAYERS PANEL ================= */}
//       {selectedEvent && (
//         <div className="mt-6 p-4 border rounded">
//           <h3 className="font-bold mb-2">
//             Players for {selectedEvent.sport} – {selectedEvent.category} –{" "}
//             {selectedEvent.type}
//           </h3>

//           {/* Add Player */}
//           <div className="mt-2">
//             <input
//               className="border p-2"
//               placeholder="Roll No"
//               value={rollNo}
//               onChange={(e) => checkStudent(e.target.value)}
//             />

//             <button
//               className="bg-blue-500 text-white px-4 py-2 ml-2"
//               onClick={addPlayer}
//             >
//               Add
//             </button>

//             {student && (
//               <div className="text-green-600 text-sm mt-1">
//                 {student.name} ({student.department})
//               </div>
//             )}

//             {error && (
//               <div className="text-red-600 text-sm mt-1">{error}</div>
//             )}
//           </div>

//           {/* Player List */}
//           <ul className="mt-4">
//             {players.map((p) => (
//               <li
//                 key={p._id}
//                 className="border p-2 flex items-center mb-2"
//               >
//                 <span className="flex-1">
//                   {p.rollNo} {p.studentName && `- ${p.studentName}`}
//                 </span>

//                 <span className="mr-2">Seed:</span>
//                 <input
//                   className="border w-16"
//                   value={p.seed}
//                   onChange={async (e) => {
//                     await api.put("/participation/" + p._id + "/seed", {
//                       seed: e.target.value,
//                     });
//                     loadPlayers(selectedEvent._id);
//                   }}
//                 />
//               </li>
//             ))}
//           </ul>

//           {/* Controls */}
//           <div className="mt-4 flex gap-3">
//             <button
//               className="bg-red-600 text-white px-4 py-2"
//               onClick={async () => {
//                 await api.post(
//                   "/draws/" + selectedEvent._id + "/generate"
//                 );
//                 alert("Draws generated");
//                 loadEvents();
//               }}
//             >
//               Generate Draws
//             </button>

//             <button
//               className="bg-yellow-500 text-white px-4 py-2"
//               onClick={async () => {
//                 await api.put(
//                   "/events/" + selectedEvent._id + "/status",
//                   { status: "LIVE" }
//                 );
//                 loadEvents();
//               }}
//             >
//               Set Live
//             </button>

//             <button
//               className="bg-gray-600 text-white px-4 py-2"
//               onClick={async () => {
//                 await api.put(
//                   "/events/" + selectedEvent._id + "/status",
//                   { status: "COMPLETED" }
//                 );
//                 loadEvents();
//               }}
//             >
//               End Event
//             </button>

//             <button
//               className="bg-black text-white px-4 py-2"
//               onClick={async () => {
//                 if (
//                   window.confirm(
//                     "This will erase all matches. Are you sure?"
//                   )
//                 ) {
//                   await api.delete(
//                     "/events/" + selectedEvent._id + "/reset"
//                   );
//                   alert("Event reset");
//                   loadEvents();
//                 }
//               }}
//             >
//               Reset
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//     </>
//   );
// }

import { useEffect, useState } from "react";
import api from "../../api/api";
import Navbar from "../../components/Navbar";

export default function AdminDashboard() {
  const role = localStorage.getItem("role");

  const [totalEvents, setTotalEvents] = useState(0);
  const [liveEvents, setLiveEvents] = useState(0);
  const [studentsCount, setStudentsCount] = useState(0);
  const [matchesToday, setMatchesToday] = useState(0);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      const [eventsRes, studentsRes] = await Promise.all([
        api.get("/events"),
        api.get("/students"),
      ]);

      setTotalEvents(eventsRes.data.length);
      setLiveEvents(
        eventsRes.data.filter((e) => e.status === "LIVE").length
      );
      setStudentsCount(studentsRes.data.length);

      // placeholder for now
      setMatchesToday(0);
    } catch (err) {
      console.error("Dashboard stats error", err);
    }
  };

  return (
    <>

      <div className="p-3 md:p-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-6">Admin Dashboard</h1>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-6">
          <StatCard title="Total Events" value={totalEvents} />
          <StatCard title="Live Events" value={liveEvents} />
          <StatCard title="Students" value={studentsCount} />
          <StatCard title="Matches Today" value={matchesToday} />
        </div>
      </div>
    </>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="border rounded p-3 md:p-6 text-center shadow-sm bg-white">
      <div className="text-xs md:text-sm text-gray-500">{title}</div>
      <div className="text-xl md:text-3xl font-bold mt-2">{value}</div>
    </div>
  );
}
