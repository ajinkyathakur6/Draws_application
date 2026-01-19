import { Link, useNavigate } from "react-router-dom";

export default function Navbar({ role }) {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  return (
    <div className="w-full bg-gray-800 text-white px-6 py-3 flex justify-between items-center">
      <div className="font-bold text-lg">🏆 Draws App</div>

      <div className="flex gap-6 items-center">
        {role === "ADMIN" && (
          <>
            <Link to="/admin" className="hover:text-yellow-300">
              Dashboard
            </Link>
            <Link to="/admin/events" className="hover:text-yellow-300">
              Events
            </Link>
            <Link to="/admin/students" className="hover:text-yellow-300">
              Students
            </Link>
            <Link to="/admin/brackets" className="hover:text-yellow-300">
              Brackets
            </Link>
          </>
        )}

        {role === "COORDINATOR" && (
          <>
            <Link to="/coordinator" className="hover:text-yellow-300">
              Matches
            </Link>
            <Link to="/coordinator/matches">Today’s Matches</Link>
            <Link to="/coordinator/brackets" className="hover:text-yellow-300">
              Brackets
            </Link>
          </>
        )}

        <button
          onClick={logout}
          className="bg-red-500 px-3 py-1 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
