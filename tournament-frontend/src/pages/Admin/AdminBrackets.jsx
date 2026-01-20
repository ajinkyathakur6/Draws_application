import { useEffect, useState } from "react";
import api from "../../api/api";
import { useNavigate } from "react-router-dom";

export default function AdminBrackets() {
  const [events, setEvents] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/events").then(res => setEvents(res.data));
  }, []);

  return (
    <>
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Brackets</h1>

      <div className="grid grid-cols-1 gap-4">
        {events.map(e => (
          <div
            key={e._id}
            className="border rounded-lg p-3 md:p-4 bg-white shadow hover:shadow-lg transition flex flex-col md:flex-row md:justify-between md:items-center gap-3"
          >
            <div>
              <h3 className="font-bold text-base md:text-lg">{e.sport}</h3>
              <p className="text-xs md:text-sm text-gray-600">{e.category} - {e.format}</p>
              <p className="text-xs text-gray-500 mt-1">Status: <span className="font-semibold">{e.status}</span></p>
            </div>

            <button
              className="bg-blue-600 text-white px-4 md:px-6 py-2 rounded text-sm md:text-base hover:bg-blue-700 whitespace-nowrap"
              onClick={() => navigate(`/bracket/${e._id}`)}
            >
              View Bracket
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
