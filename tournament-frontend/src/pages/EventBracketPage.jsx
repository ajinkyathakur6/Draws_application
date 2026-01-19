import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/api";
import Navbar from "../components/Navbar";

export default function EventBracketPage() {
  const { eventId } = useParams();
  const role = localStorage.getItem("role");

  const [bracket, setBracket] = useState({});
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    if (eventId) {
      loadData();
    } else {
      // Load all events if no eventId provided
      loadEvents();
    }
  }, [eventId]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const res = await api.get("/events");
      setEvents(res.data);
    } catch (error) {
      console.error("Failed to load events:", error);
    } finally {
      setLoading(false);
    }
  };

  // Check if all matches in a round are completed
  const isRoundComplete = (roundNum, bracketData) => {
    const roundMatches = bracketData[roundNum];
    if (!roundMatches) return false;
    return roundMatches.every(m => m.status === "COMPLETED");
  };

  // Filter bracket to show only accessible rounds
  const getAccessibleRounds = (bracketData) => {
    const rounds = Object.keys(bracketData).sort((a, b) => parseInt(a) - parseInt(b));
    const accessible = [];
    
    for (let i = 0; i < rounds.length; i++) {
      const round = parseInt(rounds[i]);
      
      // First round is always accessible
      if (round === 1) {
        accessible.push(round);
      } else {
        // Subsequent rounds only accessible if previous round is complete
        const prevRound = parseInt(rounds[i - 1]);
        if (isRoundComplete(prevRound, bracketData)) {
          accessible.push(round);
        }
      }
    }
    return accessible;
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const eventRes = await api.get(`/events/${eventId}`);
      setEvent(eventRes.data);

      if (
        eventRes.data.status === "DRAWN" ||
        eventRes.data.status === "LIVE" ||
        eventRes.data.status === "COMPLETED"
      ) {
        const bracketRes = await api.get(`/draws/${eventId}/bracket`);
        setBracket(bracketRes.data);
      }
    } catch (error) {
      console.error("Failed to load bracket:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar role={role} />
        <div className="p-6 text-center">Loading...</div>
      </>
    );
  }

  // If no eventId, show event selector
  if (!eventId) {
    return (
      <>
        <Navbar role={role} />
        <div className="p-6">
          <h1 className="text-3xl font-bold mb-6">Tournament Brackets</h1>
          
          {events.length === 0 && (
            <p className="text-gray-600">No events available</p>
          )}

          <div className="grid gap-4">
            {events.map(evt => (
              <div key={evt._id} className="border rounded p-4 bg-white shadow hover:shadow-lg cursor-pointer transition" onClick={() => {
                window.location.href = `/coordinator/brackets/${evt._id}`;
              }}>
                <h3 className="font-bold text-lg">{evt.sport} – {evt.category} – {evt.format}</h3>
                <p className="text-sm text-gray-600">Status: <span className="font-semibold">{evt.status}</span></p>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar role={role} />
      <div className="p-6">
        {event && (
          <>
            <h1 className="text-3xl font-bold mb-2">
              {event.sport} – {event.category} – {event.format}
            </h1>
            <p className="text-gray-600 mb-6">
              Status: <span className="font-semibold">{event.status}</span>
            </p>
          </>
        )}

        {Object.keys(bracket).length > 0 ? (
          <div>
            {/* Check if final round has only one match (finals) */}
            {(() => {
              const rounds = getAccessibleRounds(bracket);
              const lastRound = rounds[rounds.length - 1];
              const finalMatches = bracket[lastRound];
              const isFinals = finalMatches && finalMatches.length === 1 && finalMatches[0].status === "COMPLETED";

              if (isFinals) {
                // Show finals winner prominently
                const finalMatch = finalMatches[0];
                return (
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-500 rounded-lg p-8 text-center mb-6">
                    <h2 className="text-2xl font-bold text-green-700 mb-4">🏆 Tournament Champion 🏆</h2>
                    <div className="text-4xl font-bold text-green-600">{finalMatch.winnerName}</div>
                    <div className="text-sm text-gray-600 mt-4">Grand Final Winner</div>
                  </div>
                );
              }
              return null;
            })()}

            {/* Show all bracket rounds */}
            <div className="flex gap-6 overflow-x-auto pb-4">
              {getAccessibleRounds(bracket).map((round) => {
                const rounds = getAccessibleRounds(bracket);
                const lastRound = rounds[rounds.length - 1];
                const isFinalRound = round === lastRound && bracket[round]?.length === 1;

                return (
                  <div key={round} className="min-w-[280px]">
                    <h2 className={`font-bold text-center mb-3 sticky top-0 py-2 ${
                      isFinalRound ? "bg-green-50 text-green-700" : "bg-white"
                    }`}>
                      {isFinalRound ? "Grand Final" : `Round ${round}`}
                      {!isRoundComplete(round, bracket) && bracket[round]?.some(m => m.status === "PENDING") && (
                        <div className="text-xs text-yellow-600 font-normal">In Progress</div>
                      )}
                    </h2>
                  <div className="space-y-2">
                    {bracket[round].map((m) => (
                      <div
                        key={m._id}
                        className="border rounded p-3 text-sm bg-white hover:shadow-md transition"
                      >
                        <div
                          className={`${
                            m.winner === m.slot1
                              ? "font-bold text-green-700"
                              : ""
                          }`}
                        >
                          {m.slot1Name || "BYE"}
                        </div>
                        <div className="text-gray-400 my-1 text-xs">vs</div>
                        <div
                          className={`${
                            m.winner === m.slot2
                              ? "font-bold text-green-700"
                              : ""
                          }`}
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
                </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 border rounded p-12 text-center">
            <p className="text-gray-600">
              {event?.status === "REGISTRATION"
                ? "Tournament bracket not yet generated. Check back later!"
                : "No bracket available for this event."}
            </p>
          </div>
        )}
      </div>
    </>
  );
}
