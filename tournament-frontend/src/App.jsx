import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import PublicBracket from "./pages/PublicBracket";
import EventBracketPage from "./pages/EventBracketPage";

import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminEvents from "./pages/Admin/AdminEvents";
import AdminStudents from "./pages/Admin/AdminStudents";
import AdminBrackets from "./pages/Admin/AdminBrackets";
import AdminEventParticipants from "./pages/Admin/AdminEventParticipants";

import CoordinatorDashboard from "./pages/CoordinatorDashboard";
import CoordinatorMatches from "./pages/CoordinatorMatches";
import CoordinatorParticipants from "./pages/CoordinatorParticipants";

import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public */}
        <Route path="/" element={<PublicBracket />} />
        <Route path="/login" element={<Login />} />
        <Route path="/bracket/:eventId" element={<EventBracketPage />} />

        {/* Admin (LAYOUT ROUTE) */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="ADMIN">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="events" element={<AdminEvents />} />
          <Route path="students" element={<AdminStudents />} />
          <Route path="brackets" element={<AdminBrackets />} />

          {/* ✅ MOVE THIS INSIDE */}
          <Route
            path="events/:id/participants"
            element={<AdminEventParticipants />}
          />
        </Route>

        {/* Coordinator */}
        <Route
          path="/coordinator"
          element={
            <ProtectedRoute role="COORDINATOR">
              <CoordinatorDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/coordinator/matches"
          element={
            <ProtectedRoute role="COORDINATOR">
              <CoordinatorMatches />
            </ProtectedRoute>
          }
        />

        <Route
          path="/coordinator/participants/:eventId"
          element={
            <ProtectedRoute role="COORDINATOR">
              <CoordinatorParticipants />
            </ProtectedRoute>
          }
        />

        <Route
          path="/coordinator/brackets"
          element={
            <ProtectedRoute role="COORDINATOR">
              <EventBracketPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/coordinator/brackets/:eventId"
          element={
            <ProtectedRoute role="COORDINATOR">
              <EventBracketPage />
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}
