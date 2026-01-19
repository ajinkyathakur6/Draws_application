import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/api";

export default function AdminEventParticipants() {
  const { id: eventId } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [editingSeed, setEditingSeed] = useState(null);
  const [seedValue, setSeedValue] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, [eventId]);

  const loadData = async () => {
    try {
      const eventRes = await api.get(`/events/${eventId}`);
      setEvent(eventRes.data);

      const participantsRes = await api.get(`/participation/${eventId}`);
      setParticipants(participantsRes.data);
    } catch (error) {
      console.error("Failed to load data:", error);
    }
  };

  const updateSeed = async (participantId, newSeed) => {
    if (!newSeed || isNaN(newSeed)) {
      alert("Please enter a valid seed number");
      return;
    }

    try {
      await api.put(`/participation/${participantId}/seed`, {
        seed: parseInt(newSeed)
      });
      setEditingSeed(null);
      setSeedValue("");
      loadData();
    } catch (error) {
      alert("Failed to update seed");
    }
  };

  const generateDraws = async () => {
    if (participants.length < 2) {
      alert("At least 2 participants required to generate draws");
      return;
    }

    const confirmGenerate = window.confirm(
      `Generate draws for ${participants.length} participants?`
    );
    if (!confirmGenerate) return;

    try {
      setLoading(true);
      const res = await api.post(`/draws/${eventId}/generate`);
      alert(`Draws generated! Bracket size: ${res.data.bracketSize}, Byes: ${res.data.byes}`);
      
      // Update event status to LIVE
      await api.put(`/events/${eventId}/status`, { status: "LIVE" });
      loadData();
    } catch (error) {
      alert(error.response?.data?.error || "Failed to generate draws");
    } finally {
      setLoading(false);
    }
  };

  if (!event) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate("/admin/events")}
          className="text-blue-600 hover:text-blue-800 mb-4"
        >
          ← Back to Events
        </button>
        <h1 className="text-3xl font-bold">Manage Participants</h1>
        <h2 className="text-xl text-gray-600 mt-2">
          {event.sport} – {event.category} – {event.format}
        </h2>
      </div>

      {/* Event Status and Actions */}
      <div className="bg-white border rounded-lg p-4 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <span className="text-gray-600">Status: </span>
            <span
              className={`font-semibold ${
                event.status === "REGISTRATION"
                  ? "text-yellow-600"
                  : event.status === "DRAWN"
                  ? "text-blue-600"
                  : event.status === "LIVE"
                  ? "text-green-600"
                  : "text-gray-600"
              }`}
            >
              {event.status}
            </span>
          </div>
          <div>
            <span className="text-gray-600 mr-4">
              Total Participants: <strong>{participants.length}</strong>
            </span>
            {event.status === "REGISTRATION" && (
              <button
                onClick={generateDraws}
                disabled={loading || participants.length < 2}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? "Generating..." : "Generate Draws"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Participants Table */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Roll No</th>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Seed</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {participants.length === 0 ? (
              <tr>
                <td colSpan="4" className="p-4 text-center text-gray-500">
                  No participants yet
                </td>
              </tr>
            ) : (
              participants.map((p) => (
                <tr key={p._id} className="border-t hover:bg-gray-50">
                  <td className="p-3 font-semibold">{p.rollNo}</td>
                  <td className="p-3">{p.studentName}</td>
                  <td className="p-3">
                    {editingSeed === p._id ? (
                      <div className="flex gap-2">
                        <input
                          type="number"
                          min="1"
                          value={seedValue}
                          onChange={(e) => setSeedValue(e.target.value)}
                          className="border px-2 py-1 w-16 rounded"
                          autoFocus
                        />
                        <button
                          onClick={() =>
                            updateSeed(p._id, seedValue)
                          }
                          className="bg-blue-600 text-white px-2 py-1 rounded text-sm"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingSeed(null)}
                          className="bg-gray-400 text-white px-2 py-1 rounded text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => {
                          setEditingSeed(p._id);
                          setSeedValue(p.seed || "");
                        }}
                        className="cursor-pointer p-2 hover:bg-gray-100 rounded"
                      >
                        {p.seed || "—"}
                      </div>
                    )}
                  </td>
                  <td className="p-3 text-center">
                    <span className="text-xs text-gray-500">
                      (Click seed to edit)
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Info Section */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
        <h3 className="font-bold mb-2">How Seeding Works:</h3>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• Assign seed numbers to participants (1 = top seed)</li>
          <li>• Seeded players are placed at strategic positions in the bracket</li>
          <li>• Unseeded players fill remaining positions</li>
          <li>• If participants ≠ power of 2 (2,4,8,16,32,64), unseeded players get byes</li>
          <li>• Once draws are generated, seeding cannot be changed</li>
        </ul>
      </div>
    </div>
  );
}
