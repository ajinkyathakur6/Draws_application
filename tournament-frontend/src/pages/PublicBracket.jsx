import { useEffect, useState } from "react";
import api from "../api/api";

export default function PublicBracket() {
  const [events, setEvents] = useState([]);
  const [eventId, setEventId] = useState(null);
  const [bracket, setBracket] = useState({});

  useEffect(() => {
    api.get("/events").then((res) => setEvents(res.data));
  }, []);

  const loadBracket = async (id) => {
    setEventId(id);
    const res = await api.get("/draws/" + id + "/bracket");
    setBracket(res.data.bracket || {});
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">Live Tournament Bracket</h1>

      <select
        className="border p-2 mt-2"
        onChange={(e) => loadBracket(e.target.value)}
      >
        <option>Select Event</option>
        {events.map((e) => (
          <option key={e._id} value={e._id}>
            {e.sport} - {e.category} - {e.format}
          </option>
        ))}
      </select>

      {/* Finals Winner Display */}
      {eventId && (() => {
        const rounds = Object.keys(bracket).sort((a, b) => parseInt(a) - parseInt(b));
        const lastRound = rounds[rounds.length - 1];
        const finalMatches = bracket[lastRound];
        const isFinals = finalMatches && finalMatches.length === 1 && finalMatches[0].status === "COMPLETED";

        if (isFinals) {
          const finalMatch = finalMatches[0];
          return (
            <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-500 rounded-lg p-6 text-center my-6">
              <h2 className="text-2xl font-bold text-green-700 mb-3">🏆 Tournament Champion 🏆</h2>
              <div className="text-3xl font-bold text-green-600">{finalMatch.winnerName}</div>
            </div>
          );
        }
        return null;
      })()}

      <div className="flex overflow-x-auto mt-6 space-x-6">
        {Object.keys(bracket)
          .sort((a, b) => parseInt(a) - parseInt(b))
          .map((round) => {
            const rounds = Object.keys(bracket).sort((a, b) => parseInt(a) - parseInt(b));
            const lastRound = rounds[rounds.length - 1];
            const isFinalRound = parseInt(round) === parseInt(lastRound) && bracket[round]?.length === 1;

            return (
              <div key={round} className="min-w-[250px]">
                <h2 className={`font-bold text-center ${isFinalRound ? "text-green-700 bg-green-50 p-2 rounded" : ""}`}>
                  {isFinalRound ? "Grand Final" : `Round ${round}`}
                </h2>

                {bracket[round].map((m) => (
                  <div key={m._id} className="border p-2 my-2 text-sm">
                    <div
                      className={
                        m.winner === m.slot1 ? "font-bold text-green-600" : ""
                      }
                    >
                      {m.slot1Name || "BYE"}
                    </div>
                    <div className="text-gray-400 text-xs my-1">vs</div>
                    <div
                      className={
                        m.winner === m.slot2 ? "font-bold text-green-600" : ""
                      }
                    >
                      {m.slot2Name || "BYE"}
                    </div>
                    {m.winnerName && (
                      <div className="text-xs text-green-600 font-semibold mt-2 pt-2 border-t">
                        ✓ Winner: {m.winnerName}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            );
          })}
      </div>
    </div>
  );
}
