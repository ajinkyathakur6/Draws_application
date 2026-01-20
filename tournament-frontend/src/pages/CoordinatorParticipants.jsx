import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/api";
import Navbar from "../components/Navbar";

export default function CoordinatorParticipants() {
  const { eventId } = useParams();
  const role = localStorage.getItem("role");

  const [event, setEvent] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [player1, setPlayer1] = useState("");
  const [player2, setPlayer2] = useState("");
  const [studentSuggestions, setStudentSuggestions] = useState([]);
  const [currentField, setCurrentField] = useState("player1");
  const [seed, setSeed] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadEvent();
    loadParticipants();
  }, [eventId]);

  const loadEvent = async () => {
    try {
      const res = await api.get(`/events/${eventId}`);
      setEvent(res.data);
    } catch (error) {
      console.error("Failed to load event:", error);
    }
  };

  const loadParticipants = async () => {
    try {
      const res = await api.get(`/participation/${eventId}`);
      setParticipants(res.data);
    } catch (error) {
      console.error("Failed to load participants:", error);
    }
  };

  const searchStudents = async (value) => {
    if (value.length < 2) {
      setStudentSuggestions([]);
      return;
    }

    try {
      const res = await api.get(`/students/search/${value}`);
      if (res.data) {
        setStudentSuggestions([res.data]);
      }
    } catch (error) {
      setStudentSuggestions([]);
    }
  };

  const handlePlayerSelect = (student) => {
    if (currentField === "player1") {
      setPlayer1(student.rollNo);
    } else {
      setPlayer2(student.rollNo);
    }
    setStudentSuggestions([]);
  };

  const addParticipant = async () => {
    // For SINGLES
    if (event.format === "SINGLES") {
      if (!player1) {
        alert("Please enter a roll number");
        return;
      }

      try {
        setLoading(true);
        await api.post("/participation", {
          eventId,
          rollNo: player1,
          seed: seed ? Number(seed) : 0
        });
        setPlayer1("");
        setSeed("");
        setStudentSuggestions([]);
        loadParticipants();
      } catch (error) {
        alert(error.response?.data?.error || "Failed to add participant");
      } finally {
        setLoading(false);
      }
    }
    // For DOUBLES or MIXED
    else {
      if (!player1 || !player2) {
        alert("Please enter both player roll numbers");
        return;
      }

      if (player1 === player2) {
        alert("Both players must be different");
        return;
      }

      try {
        setLoading(true);
        await api.post("/participation", {
          eventId,
          members: [player1, player2],
          seed: seed ? Number(seed) : 0
        });
        setPlayer1("");
        setPlayer2("");
        setSeed("");
        setStudentSuggestions([]);
        loadParticipants();
      } catch (error) {
        alert(error.response?.data?.error || "Failed to add team");
      } finally {
        setLoading(false);
      }
    }
  };

  const removeParticipant = async (participantId) => {
    try {
      await api.delete(`/participation/${participantId}`);
      loadParticipants();
    } catch (error) {
      alert("Failed to remove participant");
    }
  };

  if (!event) return <div className="p-6">Loading...</div>;

  const isSingles = event.format === "SINGLES";
  const isDoubles = event.format === "DOUBLES" || event.format === "MIXED";

  return (
    <>
      <Navbar role={role} />
      <div className="p-4 md:p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Add Participants</h1>
        <h2 className="text-lg md:text-xl text-gray-600 mb-6">
          {event.sport} – {event.category} – {event.format}
        </h2>

        {/* Add Participant Section */}
        <div className="bg-white border rounded-lg p-4 mb-6">
          <h3 className="font-bold mb-3">
            {isSingles ? "Add Player" : "Add Team"}
          </h3>
          <div className="space-y-3">
            {/* Player 1 */}
            <div className="relative">
              <input
                type="text"
                placeholder="Player 1 Roll No..."
                value={player1}
                onChange={(e) => {
                  setPlayer1(e.target.value);
                  setCurrentField("player1");
                  searchStudents(e.target.value);
                }}
                onFocus={() => setCurrentField("player1")}
                className="w-full border p-2 rounded"
              />
              {studentSuggestions.length > 0 && currentField === "player1" && (
                <div className="absolute top-12 left-0 right-0 bg-white border rounded shadow-lg z-10">
                  {studentSuggestions.map((student) => (
                    <div
                      key={student._id}
                      onClick={() => handlePlayerSelect(student)}
                      className="p-2 hover:bg-gray-100 cursor-pointer border-b"
                    >
                      <div className="font-semibold">{student.rollNo}</div>
                      <div className="text-sm text-gray-600">{student.name}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Player 2 (for DOUBLES/MIXED) */}
            {isDoubles && (
              <div className="relative">
                <input
                  type="text"
                  placeholder="Player 2 Roll No..."
                  value={player2}
                  onChange={(e) => {
                    setPlayer2(e.target.value);
                    setCurrentField("player2");
                    searchStudents(e.target.value);
                  }}
                  onFocus={() => setCurrentField("player2")}
                  className="w-full border p-2 rounded"
                />
                {studentSuggestions.length > 0 && currentField === "player2" && (
                  <div className="absolute top-12 left-0 right-0 bg-white border rounded shadow-lg z-10">
                    {studentSuggestions.map((student) => (
                      <div
                        key={student._id}
                        onClick={() => handlePlayerSelect(student)}
                        className="p-2 hover:bg-gray-100 cursor-pointer border-b"
                      >
                        <div className="font-semibold">{student.rollNo}</div>
                        <div className="text-sm text-gray-600">{student.name}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Seed */}
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="number"
                placeholder="Seed (optional)"
                value={seed}
                onChange={(e) => setSeed(e.target.value)}
                min="0"
                className="w-full sm:w-24 border p-2 rounded"
              />
              <button
                onClick={addParticipant}
                disabled={loading}
                className="w-full sm:flex-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 font-semibold"
              >
                {loading ? "Adding..." : isSingles ? "Add Player" : "Add Team"}
              </button>
            </div>
          </div>
        </div>

        {/* Participants List */}
        <div className="bg-white border rounded-lg overflow-x-auto">
          {/* Desktop Table */}
          <table className="w-full hidden md:table">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">
                  {isSingles ? "Player" : "Team"}
                </th>
                <th className="p-3 text-left">Members</th>
                <th className="p-3 text-left">Seed</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {participants.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-4 text-center text-gray-500">
                    No participants added yet
                  </td>
                </tr>
              ) : (
                participants.map((p, index) => (
                  <tr key={p._id} className="border-t hover:bg-gray-50">
                    <td className="p-3">
                      {isSingles ? p.studentName : `Team ${index + 1}`}
                    </td>
                    <td className="p-3">
                      {Array.isArray(p.members)
                        ? p.members.map(m => m.name || m).join(" + ")
                        : p.studentName}
                    </td>
                    <td className="p-3">{p.seed || "—"}</td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => removeParticipant(p._id)}
                        className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Mobile Card Layout */}
          <div className="md:hidden">
            {participants.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No participants added yet
              </div>
            ) : (
              <div className="divide-y">
                {participants.map((p, index) => (
                  <div key={p._id} className="p-4 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-bold text-sm">
                          {isSingles ? p.studentName : `Team ${index + 1}`}
                        </div>
                        <div className="text-xs text-gray-600">
                          {Array.isArray(p.members)
                            ? p.members.map(m => m.name || m).join(" + ")
                            : p.studentName}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-semibold text-gray-700">
                          Seed: {p.seed || "—"}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => removeParticipant(p._id)}
                      className="w-full bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700 font-semibold"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
          <p className="text-xs sm:text-sm text-gray-700">
            <strong>Note:</strong> For {event.format} format
            {isSingles
              ? " - add individual players."
              : " - add teams of 2 players each."}
            Once all participants added, the admin will generate draws.
          </p>
        </div>
      </div>
    </>
  );
}
