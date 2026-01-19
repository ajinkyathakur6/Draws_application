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
    <div className="p-3 md:p-6 min-h-screen bg-gray-50">
      <h1 className="text-2xl md:text-3xl font-bold mb-4">Live Tournament Bracket</h1>

      <select
        className="border p-2 mt-2 w-full md:w-64 text-base"
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
            <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-500 rounded-lg p-4 md:p-6 text-center my-4 md:my-6">
              <h2 className="text-xl md:text-2xl font-bold text-green-700 mb-2 md:mb-3">🏆 Tournament Champion 🏆</h2>
              <div className="text-2xl md:text-3xl font-bold text-green-600 break-words">{finalMatch.winnerName}</div>
            </div>
          );
        }
        return null;
      })()}

      <div className="flex flex-col md:flex-row overflow-x-auto mt-6 gap-3 md:gap-6">
        {Object.keys(bracket)
          .sort((a, b) => parseInt(a) - parseInt(b))
          .map((round) => {
            const rounds = Object.keys(bracket).sort((a, b) => parseInt(a) - parseInt(b));
            const lastRound = rounds[rounds.length - 1];
            const isFinalRound = parseInt(round) === parseInt(lastRound) && bracket[round]?.length === 1;

            return (
              <div key={round} className="md:min-w-[280px] w-full md:w-auto">
                <h2 className={`font-bold text-center text-sm md:text-base ${isFinalRound ? "text-green-700 bg-green-50 p-2 rounded" : ""}`}>
                  {isFinalRound ? "Grand Final" : `Round ${round}`}
                </h2>

                {bracket[round].map((m) => (
                  <div key={m._id} className="border p-2 md:p-3 my-2 text-xs md:text-sm">
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
