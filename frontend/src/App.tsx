'use client'

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { LandingPage } from '@/pages/landing'
import Login from '@/pages/login'
import Register from '@/pages/register'
import { DoctorDashboard } from '@/pages/doctor-dashboard'
import { DoctorScan } from '@/pages/doctor-scan'
import { DoctorReports } from '@/pages/doctor-reports'
import { DoctorPatients } from '@/pages/doctor-patients'
import { DoctorHistory } from '@/pages/doctor-history'
import { DoctorSettingsPage } from '@/pages/doctor-settings'
import { PatientDashboard } from '@/pages/patient-dashboard'
import { api } from '@/lib/api'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  if (!api.isAuthenticated()) {
    return <Navigate to="/login" replace />
  }
  return <>{children}</>
}

export default function App() {
  return (
    <Router>
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/doctor"
            element={
              <PrivateRoute>
                <DoctorDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/doctor/scan"
            element={
              <PrivateRoute>
                <DoctorScan />
              </PrivateRoute>
            }
          />
          <Route
            path="/doctor/reports"
            element={
              <PrivateRoute>
                <DoctorReports />
              </PrivateRoute>
            }
          />
          <Route
            path="/doctor/patients"
            element={
              <PrivateRoute>
                <DoctorPatients />
              </PrivateRoute>
            }
          />
          <Route
            path="/doctor/history"
            element={
              <PrivateRoute>
                <DoctorHistory />
              </PrivateRoute>
            }
          />
          <Route
            path="/doctor/settings"
            element={
              <PrivateRoute>
                <DoctorSettingsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/patient"
            element={
              <PrivateRoute>
                <PatientDashboard />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </Router>
  )
}
