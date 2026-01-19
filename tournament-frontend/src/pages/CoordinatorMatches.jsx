import { useEffect, useState } from "react";
import api from "../api/api";
import Navbar from "../components/Navbar";

export default function CoordinatorMatches() {
  const role = localStorage.getItem("role");
  const [matches, setMatches] = useState([]);
  const [error, setError] = useState(null);

  const loadMatches = async () => {
    try {
      setError(null);
      const res = await api.get("/matches/today");
      // Filter to show only PENDING matches (exclude COMPLETED)
      const pendingMatches = res.data.filter(m => m.status === "PENDING");
      setMatches(pendingMatches);
    } catch (error) {
      console.error("Failed to load matches:", error);
      console.error("Error message:", error.message);
      console.error("Error response:", error.response?.data);
      setError(error.message);
    }
  };

  const confirmWinner = async (matchId, winner, winnerName) => {
    const ok = window.confirm(
      `Confirm winner:\n${winnerName}\n\nThis cannot be undone.`
    );
    if (!ok) return;

    await api.put(`/matches/${matchId}/winner`, { winner });
    loadMatches();
  };

  useEffect(() => {
    loadMatches();
  }, []);

  return (
    <>
      <Navbar role={role} />

      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Today’s Matches</h1>

        {error && (
          <p className="text-red-600 bg-red-50 p-4 rounded mb-4">Error: {error}</p>
        )}

        {matches.length === 0 && !error && (
          <p className="text-gray-600">No pending matches.</p>
        )}

        <div className="grid gap-4">
          {matches.map((m) => (
            <div
              key={m._id}
              className="border rounded p-4 bg-white shadow"
            >
              <div className="font-bold text-sm text-gray-700">
                {m.eventId.sport} – {m.eventId.category} –{" "}
                {m.eventId.format}
              </div>

              <div className="text-sm text-gray-500 mb-2">
                Round {m.round}
              </div>

              <div className="flex justify-between items-center">
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded w-1/2 mr-2"
                  onClick={() => confirmWinner(m._id, m.slot1, m.slot1Name)}
                >
                  {m.slot1Name || "BYE"}
                </button>

                <button
                  className="bg-green-500 text-white px-4 py-2 rounded w-1/2 ml-2"
                  onClick={() => confirmWinner(m._id, m.slot2, m.slot2Name)}
                >
                  {m.slot2Name || "BYE"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
