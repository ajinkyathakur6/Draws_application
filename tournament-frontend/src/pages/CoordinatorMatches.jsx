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

      <div className="p-3 md:p-6 min-h-screen bg-gray-50">
        <h1 className="text-2xl md:text-3xl font-bold mb-4">Today's Matches</h1>

        {error && (
          <p className="text-red-600 bg-red-50 p-4 rounded mb-4 text-sm md:text-base">Error: {error}</p>
        )}

        {matches.length === 0 && !error && (
          <p className="text-gray-600 text-sm md:text-base">No pending matches.</p>
        )}

        <div className="grid gap-4">
          {matches.map((m) => (
            <div
              key={m._id}
              className="border rounded p-3 md:p-4 bg-white shadow hover:shadow-lg transition"
            >
              <div className="font-bold text-xs md:text-sm text-gray-700 mb-2">
                {m.eventId.sport} – {m.eventId.category} – {m.eventId.format}
              </div>

              <div className="text-xs md:text-sm text-gray-500 mb-3">
                Round {m.round}
              </div>

              <div className="flex flex-col md:flex-row gap-2 md:gap-4 md:items-center md:justify-between">
                <button
                  className="bg-blue-500 text-white px-3 md:px-4 py-2 md:py-2 rounded text-sm md:text-base font-medium hover:bg-blue-600 transition flex-1 md:flex-none"
                  onClick={() => confirmWinner(m._id, m.slot1, m.slot1Name)}
                >
                  {m.slot1Name || "BYE"}
                </button>

                <span className="hidden md:inline text-gray-400 text-sm">vs</span>
                <span className="md:hidden text-gray-400 text-xs text-center">vs</span>

                <button
                  className="bg-green-500 text-white px-3 md:px-4 py-2 md:py-2 rounded text-sm md:text-base font-medium hover:bg-green-600 transition flex-1 md:flex-none"
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
