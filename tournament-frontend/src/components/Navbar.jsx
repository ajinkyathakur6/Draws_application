import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Navbar({ role }) {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  return (
    <>
      <div className="w-full bg-gray-800 text-white px-3 md:px-6 py-3 flex justify-between items-center">
        <div className="font-bold text-lg md:text-xl">�� Draws App</div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-2xl"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          ☰
        </button>

        {/* Desktop Menu */}
        <div className="hidden md:flex gap-4 lg:gap-6 items-center">
          {role === "ADMIN" && (
            <>
              <Link to="/admin" className="text-sm hover:text-yellow-300">
                Dashboard
              </Link>
              <Link to="/admin/events" className="text-sm hover:text-yellow-300">
                Events
              </Link>
              <Link to="/admin/students" className="text-sm hover:text-yellow-300">
                Students
              </Link>
              <Link to="/admin/brackets" className="text-sm hover:text-yellow-300">
                Brackets
              </Link>
            </>
          )}

          {role === "COORDINATOR" && (
            <>
              <Link to="/coordinator" className="text-sm hover:text-yellow-300">
                Dashboard
              </Link>
              <Link to="/coordinator/matches" className="text-sm hover:text-yellow-300">
                Today's Matches
              </Link>
              <Link to="/coordinator/brackets" className="text-sm hover:text-yellow-300">
                Brackets
              </Link>
            </>
          )}

          <button
            onClick={logout}
            className="bg-red-500 px-3 py-1 text-sm rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-gray-700 text-white px-3 py-2 space-y-2">
          {role === "ADMIN" && (
            <>
              <Link to="/admin" className="block text-sm py-2 hover:text-yellow-300" onClick={() => setMobileMenuOpen(false)}>
                Dashboard
              </Link>
              <Link to="/admin/events" className="block text-sm py-2 hover:text-yellow-300" onClick={() => setMobileMenuOpen(false)}>
                Events
              </Link>
              <Link to="/admin/students" className="block text-sm py-2 hover:text-yellow-300" onClick={() => setMobileMenuOpen(false)}>
                Students
              </Link>
              <Link to="/admin/brackets" className="block text-sm py-2 hover:text-yellow-300" onClick={() => setMobileMenuOpen(false)}>
                Brackets
              </Link>
            </>
          )}

          {role === "COORDINATOR" && (
            <>
              <Link to="/coordinator" className="block text-sm py-2 hover:text-yellow-300" onClick={() => setMobileMenuOpen(false)}>
                Dashboard
              </Link>
              <Link to="/coordinator/matches" className="block text-sm py-2 hover:text-yellow-300" onClick={() => setMobileMenuOpen(false)}>
                Today's Matches
              </Link>
              <Link to="/coordinator/brackets" className="block text-sm py-2 hover:text-yellow-300" onClick={() => setMobileMenuOpen(false)}>
                Brackets
              </Link>
            </>
          )}

          <button
            onClick={() => {
              logout();
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left bg-red-500 px-3 py-2 text-sm rounded hover:bg-red-600 mt-2"
          >
            Logout
          </button>
        </div>
      )}
    </>
  );
}
