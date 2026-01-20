import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function AdminLayout() {
  const role = localStorage.getItem("role");

  return (
    <>
      <Navbar role={role} />
      <div className="p-3 md:p-6 min-h-screen bg-gray-50">
        <Outlet />
      </div>
    </>
  );
}
