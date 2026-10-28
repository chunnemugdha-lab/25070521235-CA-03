import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages
import Home from "./pages/Home";
import BrowseJobs from "./pages/BrowseJobs";
import JobDetails from "./pages/JobDetails";
import CreateJob from "./pages/CreateJob";
import EditJob from "./pages/EditJob";
import Dashboard from "./pages/Dashboard";
import MyApplications from "./pages/MyApplications";
import MyPostedJobs from "./pages/MyPostedJobs";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";

import "./App.css";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="app-container">
          <Navbar />
          <main className="main-content">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/jobs" element={<BrowseJobs />} />
              <Route path="/jobs/:id" element={<JobDetails />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              {/* Protected Student Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/post-job"
                element={
                  <ProtectedRoute>
                    <CreateJob />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/edit-job/:id"
                element={
                  <ProtectedRoute>
                    <EditJob />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-applications"
                element={
                  <ProtectedRoute>
                    <MyApplications />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-jobs"
                element={
                  <ProtectedRoute>
                    <MyPostedJobs />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />

              {/* 404 Fallback */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
