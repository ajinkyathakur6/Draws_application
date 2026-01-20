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

      <div className="flex flex-col md:flex-row gap-2 mb-4">
        <select value={sport} onChange={(e) => setSport(e.target.value)} className="text-xs md:text-sm border p-2 rounded">
          <option>Badminton</option>
          <option>Table Tennis</option>
          <option>Carrom</option>
        </select>

        <select value={category} onChange={(e) => setCategory(e.target.value)} className="text-xs md:text-sm border p-2 rounded">
          <option value="MENS">Mens</option>
          <option value="WOMENS">Womens</option>
          <option value="MIXED">Mixed</option>
        </select>

        <select
          value={format}
          disabled={category === "MIXED"}
          onChange={(e) => setFormat(e.target.value)}
          className="text-xs md:text-sm border p-2 rounded disabled:opacity-50"
        >
          <option value="SINGLES">Singles</option>
          <option value="DOUBLES">Doubles</option>
        </select>

        <button className="bg-green-600 text-white px-3 md:px-4 py-2 rounded text-xs md:text-sm hover:bg-green-700 whitespace-nowrap" onClick={createEvent}>
          Create
        </button>
      </div>

      <div className="overflow-x-auto bg-white rounded border">
      <table className="w-full border-collapse border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="border border-gray-300 px-2 md:px-4 py-2 md:py-3 text-left text-xs md:text-sm font-semibold">Event</th>
            <th className="border border-gray-300 px-2 md:px-4 py-2 md:py-3 text-left text-xs md:text-sm font-semibold">Status</th>
            <th className="border border-gray-300 px-2 md:px-4 py-2 md:py-3 text-left text-xs md:text-sm font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {events.map((e) => (
            <tr key={e._id} className="hover:bg-gray-50">
              <td className="border border-gray-300 px-2 md:px-4 py-2 md:py-3">
                <div className="font-semibold text-xs md:text-base">{e.sport}</div>
                <div className="text-xs text-gray-600">{e.category} - {e.format}</div>
              </td>
              <td className="border border-gray-300 px-2 md:px-4 py-2 md:py-3">
                <span className={`px-2 md:px-3 py-1 rounded text-xs md:text-sm font-semibold ${
                  e.status === "REGISTRATION" ? "bg-yellow-100 text-yellow-800" :
                  e.status === "DRAWN" ? "bg-blue-100 text-blue-800" :
                  e.status === "LIVE" ? "bg-green-100 text-green-800" :
                  "bg-gray-100 text-gray-800"
                }`}>
                  {e.status}
                </span>
              </td>
              <td className="border border-gray-300 px-2 md:px-4 py-2 md:py-3">
                <button
                  onClick={() =>
                    navigate(`/admin/events/${e._id}/participants`)
                  }
                  className="bg-indigo-600 text-white px-2 md:px-4 py-1 md:py-2 rounded text-xs md:text-base hover:bg-indigo-700 whitespace-nowrap"
                >
                  Participants
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </>
  );
}
