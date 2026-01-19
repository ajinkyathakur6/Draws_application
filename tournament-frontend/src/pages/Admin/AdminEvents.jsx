import { useEffect, useState } from "react";
import api from "../../api/api";
import { useNavigate } from "react-router-dom";

export default function AdminEvents() {
  const [events, setEvents] = useState([]);
  const navigate = useNavigate();

  const [sport, setSport] = useState("Badminton");
  const [category, setCategory] = useState("MENS");
  const [format, setFormat] = useState("SINGLES");

  useEffect(() => {
    if (category === "MIXED") setFormat("DOUBLES");
  }, [category]);

  const loadEvents = async () => {
    const res = await api.get("/events");
    setEvents(res.data);
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const createEvent = async () => {
    await api.post("/events", { sport, category, format });
    loadEvents();
  };

  return (
    <>
      <h1 className="text-2xl font-bold mb-4">Events</h1>

      <div className="flex gap-2 mb-4">
        <select value={sport} onChange={(e) => setSport(e.target.value)}>
          <option>Badminton</option>
          <option>Table Tennis</option>
          <option>Carrom</option>
        </select>

        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="MENS">Mens</option>
          <option value="WOMENS">Womens</option>
          <option value="MIXED">Mixed</option>
        </select>

        <select
          value={format}
          disabled={category === "MIXED"}
          onChange={(e) => setFormat(e.target.value)}
        >
          <option value="SINGLES">Singles</option>
          <option value="DOUBLES">Doubles</option>
        </select>

        <button className="bg-green-600 text-white px-4" onClick={createEvent}>
          Create
        </button>
      </div>

      <table className="w-full border-collapse border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Event</th>
            <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Status</th>
            <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {events.map((e) => (
            <tr key={e._id} className="hover:bg-gray-50">
              <td className="border border-gray-300 px-4 py-3">
                <div className="font-semibold">{e.sport}</div>
                <div className="text-sm text-gray-600">{e.category} - {e.format}</div>
              </td>
              <td className="border border-gray-300 px-4 py-3">
                <span className={`px-3 py-1 rounded text-sm font-semibold ${
                  e.status === "REGISTRATION" ? "bg-yellow-100 text-yellow-800" :
                  e.status === "DRAWN" ? "bg-blue-100 text-blue-800" :
                  e.status === "LIVE" ? "bg-green-100 text-green-800" :
                  "bg-gray-100 text-gray-800"
                }`}>
                  {e.status}
                </span>
              </td>
              <td className="border border-gray-300 px-4 py-3">
                <button
                  onClick={() =>
                    navigate(`/admin/events/${e._id}/participants`)
                  }
                  className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                >
                  Participants
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
