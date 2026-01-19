import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function AdminLayout() {
  const role = localStorage.getItem("role");

  return (
    <>
      <Navbar role={role} />
      <div className="p-6">
        <Outlet />
      </div>
    </>
  );
}
