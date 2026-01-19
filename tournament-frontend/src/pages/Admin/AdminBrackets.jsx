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
      <h1 className="text-2xl font-bold mb-6">Brackets</h1>

      <div className="grid gap-4">
        {events.map(e => (
          <div
            key={e._id}
            className="border rounded-lg p-4 bg-white shadow hover:shadow-lg transition flex justify-between items-center"
          >
            <div>
              <h3 className="font-bold text-lg">{e.sport}</h3>
              <p className="text-sm text-gray-600">{e.category} - {e.format}</p>
              <p className="text-xs text-gray-500 mt-1">Status: <span className="font-semibold">{e.status}</span></p>
            </div>

            <button
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
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
