import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import Navbar from "../components/Navbar";

export default function CoordinatorDashboard() {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [bracket, setBracket] = useState({});
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [loading, setLoading] = useState(false);
  const role = localStorage.getItem("role");
  const navigate = useNavigate();

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const res = await api.get("/events");
      setEvents(res.data);
    } catch (error) {
      console.error("Failed to load events:", error);
    }
  };

  const handleSelectEvent = async (eventId) => {
    setSelectedEventId(eventId);
    try {
      const eventRes = await api.get(`/events/${eventId}`);
      setSelectedEvent(eventRes.data);

      if (eventRes.data.status === "DRAWN" || eventRes.data.status === "LIVE") {
        const bracketRes = await api.get(`/draws/${eventId}/bracket`);
        setBracket(bracketRes.data.bracket || {});
      } else {
        setBracket({});
      }
    } catch (error) {
      console.error("Failed to load event details:", error);
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

  const confirmWinner = async (winner) => {
    if (!selectedMatch) return;

    try {
      setLoading(true);
      await api.post(`/draws/match/${selectedMatch._id}/winner`, { winner });
      setSelectedMatch(null);
      handleSelectEvent(selectedEventId);
    } catch (error) {
      alert(error.response?.data?.error || "Failed to record winner");
    } finally {
      setLoading(false);
    }
  };

  const finishRound = async (round) => {
    if (!selectedEventId) return;
    
    const confirmed = window.confirm(
      `Are you sure you want to finish Round ${round}?\n\nThis will create matches for Round ${round + 1} with BYE players automatically advancing.`
    );
    if (!confirmed) return;

    try {
      setLoading(true);
      await api.post(`/draws/${selectedEventId}/finish-round/${round}`);
      alert(`Round ${round} finished! Round ${round + 1} matches created.`);
      handleSelectEvent(selectedEventId);
    } catch (error) {
      alert(error.response?.data?.error || "Failed to finish round");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar role={role} />
      <div className="min-h-screen bg-gray-50">
        <div className="w-full md:max-w-7xl mx-auto p-3 md:p-6">
          <h1 className="text-2xl md:text-3xl font-bold mb-6">Coordinator Dashboard</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {/* Events List */}
            <div className="lg:col-span-1 md:col-span-2">
              <div className="bg-white rounded-lg border overflow-hidden h-full">
                <div className="bg-gray-100 p-4 border-b">
                  <h2 className="font-bold">Events</h2>
                </div>
                <div className="max-h-[600px] overflow-y-auto">
                  {events.length === 0 ? (
                    <div className="p-4 text-gray-500 text-sm">
                      No events available
                    </div>
                  ) : (
                    events.map((e) => (
                      <div
                        key={e._id}
                        onClick={() => handleSelectEvent(e._id)}
                        className={`p-3 border-b cursor-pointer hover:bg-gray-50 ${
                          selectedEventId === e._id ? "bg-blue-100" : ""
                        }`}
                      >
                        <div className="font-semibold text-sm">
                          {e.sport} {e.category}
                        </div>
                        <div className="text-xs text-gray-600">{e.format}</div>
                        <div
                          className={`text-xs font-semibold mt-1 ${
                            e.status === "REGISTRATION"
                              ? "text-yellow-600"
                              : e.status === "DRAWN"
                              ? "text-blue-600"
                              : e.status === "LIVE"
                              ? "text-green-600"
                              : "text-gray-600"
                          }`}
                        >
                          {e.status}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Event Details */}
            <div className="lg:col-span-3">
              {selectedEvent ? (
                <div className="space-y-6">
                  {/* Event Header */}
                  <div className="bg-white rounded-lg border p-6">
                    <h2 className="text-2xl font-bold mb-2">
                      {selectedEvent.sport} – {selectedEvent.category} – {selectedEvent.format}
                    </h2>
                    <div className="flex items-center gap-4 flex-wrap">
                      <div>
                        <span className="text-gray-600">Status: </span>
                        <span
                          className={`font-semibold ${
                            selectedEvent.status === "REGISTRATION"
                              ? "text-yellow-600"
                              : selectedEvent.status === "DRAWN"
                              ? "text-blue-600"
                              : selectedEvent.status === "LIVE"
                              ? "text-green-600"
                              : "text-gray-600"
                          }`}
                        >
                          {selectedEvent.status}
                        </span>
                      </div>
                      {selectedEvent.status === "REGISTRATION" && (
                        <button
                          onClick={() =>
                            navigate(
                              `/coordinator/participants/${selectedEventId}`
                            )
                          }
                          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        >
                          Add Participants
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Bracket Display */}
                  {Object.keys(bracket).length > 0 && (
                    <div className="bg-white rounded-lg border p-6">
                      <h3 className="font-bold text-lg mb-4">Tournament Bracket</h3>

                      {/* Finals Winner Display */}
                      {(() => {
                        const rounds = getAccessibleRounds(bracket);
                        const lastRound = rounds[rounds.length - 1];
                        const finalMatches = bracket[lastRound];
                        const isFinals = finalMatches && finalMatches.length === 1 && finalMatches[0].status === "COMPLETED";

                        if (isFinals) {
                          const finalMatch = finalMatches[0];
                          return (
                            <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-500 rounded-lg p-6 text-center mb-6">
                              <h2 className="text-2xl font-bold text-green-700 mb-3">🏆 Tournament Champion 🏆</h2>
                              <div className="text-3xl font-bold text-green-600">{finalMatch.winnerName}</div>
                            </div>
                          );
                        }
                        return null;
                      })()}

                      <div className="mb-4 flex gap-2">
                        {(() => {
                          const rounds = getAccessibleRounds(bracket);
                          const currentRound = Math.min(...rounds.filter(r => bracket[r]?.some(m => m.status === "PENDING")));
                          
                          if (currentRound && bracket[currentRound]) {
                            const allRoundComplete = bracket[currentRound].every(m => m.status === "COMPLETED");
                            
                            if (allRoundComplete && currentRound < Math.max(...rounds)) {
                              return (
                                <button
                                  onClick={() => finishRound(currentRound)}
                                  disabled={loading}
                                  className="bg-orange-600 text-white px-6 py-2 rounded hover:bg-orange-700 disabled:opacity-50"
                                >
                                  ✓ Finish Round {currentRound}
                                </button>
                              );
                            }
                          }
                          return null;
                        })()}
                      </div>

                      <div className="flex flex-col gap-2 overflow-x-auto pb-4">
                        {getAccessibleRounds(bracket).map((round) => {
                          const rounds = getAccessibleRounds(bracket);
                          const lastRound = rounds[rounds.length - 1];
                          const isFinalRound = round === lastRound && bracket[round]?.length === 1;

                          return (
                            <div key={round} className="md:min-w-[280px] w-full md:w-auto">
                              <h4 className={`font-bold text-center text-sm md:text-base mb-3 sticky top-0 py-2 ${
                                isFinalRound ? "bg-green-50 text-green-700" : "bg-white"
                              }`}>
                                {isFinalRound ? "Grand Final" : `Round ${round}`}
                                {!isRoundComplete(round, bracket) && bracket[round]?.some(m => m.status === "PENDING") && (
                                  <div className="text-xs text-yellow-600 font-normal">In Progress</div>
                                )}
                              </h4>
                              <div className="space-y-2">
                                {bracket[round].map((m) => (
                                  <div
                                    key={m._id}
                                    onClick={() => {
                                      if (m.status === "PENDING")
                                        setSelectedMatch(m);
                                    }}
                                    className={`border rounded p-3 text-sm ${
                                      m.status === "PENDING"
                                        ? "cursor-pointer hover:bg-yellow-50 border-yellow-300"
                                        : "bg-gray-50"
                                    }`}
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
                                    <div className="text-gray-400 my-1">vs</div>
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
                                        Winner: {m.winnerName}
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
                  )}

                  {Object.keys(bracket).length === 0 && selectedEvent.status !== "REGISTRATION" && (
                    <div className="bg-blue-50 border border-blue-200 rounded p-6 text-center">
                      <p className="text-gray-700">
                        The tournament bracket has not been generated yet.
                      </p>
                    </div>
                  )}

                  {selectedEvent.status === "REGISTRATION" && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded p-6 text-center">
                      <p className="text-gray-700">
                        Event is in registration phase. Add participants first.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-lg border p-12 text-center text-gray-500">
                  Select an event to view details
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Winner Selection Modal */}
        {selectedMatch && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
              <h2 className="text-xl font-bold mb-6">Select Winner</h2>

              <div className="space-y-3">
                <button
                  onClick={() =>
                    confirmWinner(selectedMatch.slot1)
                  }
                  disabled={loading}
                  className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700 disabled:opacity-50 font-semibold"
                >
                  {selectedMatch.slot1Name || selectedMatch.slot1 || "BYE"}
                </button>

                <button
                  onClick={() =>
                    confirmWinner(selectedMatch.slot2)
                  }
                  disabled={loading}
                  className="w-full bg-green-600 text-white p-3 rounded hover:bg-green-700 disabled:opacity-50 font-semibold"
                >
                  {selectedMatch.slot2Name || selectedMatch.slot2 || "BYE"}
                </button>

                <button
                  onClick={() => setSelectedMatch(null)}
                  disabled={loading}
                  className="w-full bg-gray-400 text-white p-3 rounded hover:bg-gray-500 disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
