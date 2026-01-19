import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/api";
import Navbar from "../components/Navbar";

export default function EventBracketPage() {
  const { eventId } = useParams();
  const role = localStorage.getItem("role");

  const [bracket, setBracket] = useState({});
  const [roundStatus, setRoundStatus] = useState({});
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [finishingRound, setFinishingRound] = useState(false);

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
    // Check only non-bye matches
    const nonByeMatches = roundMatches.filter(m => !m.isBye);
    return nonByeMatches.length > 0 && nonByeMatches.every(m => m.status === "COMPLETED");
  };

  // Filter bracket to show only accessible rounds (finished rounds + current active round)
  const getAccessibleRounds = (bracketData, statusData) => {
    const rounds = Object.keys(bracketData).sort((a, b) => parseInt(a) - parseInt(b));
    const accessible = [];
    
    for (let i = 0; i < rounds.length; i++) {
      const round = parseInt(rounds[i]);
      
      // Always show finished rounds
      if (statusData[round] === "FINISHED") {
        accessible.push(round);
      }
      // Show active round only if ALL previous rounds are finished (or it's round 1)
      else if (statusData[round] === "ACTIVE") {
        if (round === 1) {
          // Round 1 is always accessible if active
          accessible.push(round);
        } else {
          // Check if ALL previous rounds are finished
          let allPreviousFinished = true;
          for (let j = 1; j < round; j++) {
            if (!statusData[j] || statusData[j] !== "FINISHED") {
              allPreviousFinished = false;
              break;
            }
          }
          if (allPreviousFinished) {
            accessible.push(round);
          }
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
        setBracket(bracketRes.data.bracket || {});
        setRoundStatus(bracketRes.data.roundStatus || {});
      }
    } catch (error) {
      console.error("Failed to load bracket:", error);
    } finally {
      setLoading(false);
    }
  };

  const finishRound = async (roundNum) => {
    if (!confirm(`Are you sure you want to finish Round ${roundNum}? This will create the next round.`)) {
      return;
    }
    
    try {
      setFinishingRound(true);
      const res = await api.post(`/draws/${eventId}/finish-round/${roundNum}`);
      alert(res.data.message);
      loadData(); // Reload bracket
    } catch (error) {
      alert(error.response?.data?.error || "Failed to finish round");
    } finally {
      setFinishingRound(false);
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
              const rounds = getAccessibleRounds(bracket, roundStatus);
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
              {getAccessibleRounds(bracket, roundStatus).map((round) => {
                const rounds = getAccessibleRounds(bracket, roundStatus);
                const lastRound = rounds[rounds.length - 1];
                const isFinalRound = round === lastRound && bracket[round]?.length === 1;
                const isActiveRound = roundStatus[round] === "ACTIVE";
                const roundComplete = isRoundComplete(round, bracket);

                return (
                  <div key={round} className="min-w-[320px]">
                    <div className={`font-bold text-center mb-3 sticky top-0 py-3 rounded ${
                      isFinalRound ? "bg-green-50 text-green-700" : "bg-gray-100"
                    }`}>
                      <div className="text-lg">
                        {isFinalRound ? "Grand Final" : `Round ${round}`}
                      </div>
                      {isActiveRound && !roundComplete && (
                        <div className="text-xs text-yellow-600 font-normal mt-1">In Progress</div>
                      )}
                      {isActiveRound && roundComplete && (
                        <div className="text-xs text-green-600 font-normal mt-1">Complete - Ready to Finish</div>
                      )}
                      {roundStatus[round] === "FINISHED" && (
                        <div className="text-xs text-blue-600 font-normal mt-1">Finished</div>
                      )}
                    </div>
                    
                  <div className="space-y-3">
                    {bracket[round].map((m) => (
                      <div
                        key={m._id}
                        className={`border rounded-lg p-4 text-sm bg-white shadow transition ${
                          m.isBye ? "bg-gray-50" : "hover:shadow-lg"
                        }`}
                      >
                        <div className="text-xs text-gray-500 mb-2">Match #{m.matchNo}</div>
                        
                        {/* Player 1 */}
                        <div
                          className={`p-2 rounded mb-1 ${
                            m.winner === m.slot1
                              ? "font-bold text-green-700 bg-green-50"
                              : "text-gray-700"
                          }`}
                        >
                          {m.slot1Name || "TBD"}
                        </div>
                        
                        <div className="text-gray-400 my-1 text-xs text-center">vs</div>
                        
                        {/* Player 2 */}
                        <div
                          className={`p-2 rounded mb-2 ${
                            m.winner === m.slot2
                              ? "font-bold text-green-700 bg-green-50"
                              : m.slot2 === null || m.isBye
                              ? "text-gray-400 italic"
                              : "text-gray-700"
                          }`}
                        >
                          {m.slot2Name || (m.isBye ? "BYE" : "TBD")}
                        </div>

                        {/* Show winner */}
                        {m.status === "COMPLETED" && m.winnerName && (
                          <div className="text-xs text-green-600 font-semibold pt-2 border-t bg-green-50 p-2 rounded">
                            ✓ Winner: {m.winnerName}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Finish Round Button */}
                  {isActiveRound && roundComplete && (role === "COORDINATOR" || role === "ADMIN") && (
                    <div className="mt-4">
                      <button
                        onClick={() => finishRound(round)}
                        disabled={finishingRound}
                        className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 transition disabled:bg-gray-400"
                      >
                        {finishingRound ? "Finishing..." : `Finish Round ${round} →`}
                      </button>
                    </div>
                  )}
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