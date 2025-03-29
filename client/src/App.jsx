import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryProvider } from './contexts/QueryProvider'

// Lazy load components
const Auth = lazy(() => import('./pages/Auth'))
const DashboardForum = lazy(() => import('./pages/DashboardForum'))
const Problems = lazy(() => import('./pages/Problems'))
const ProtectedRoute = lazy(() => import('./auth/ProtectedRoute'))
const SecureExample = lazy(() => import('./pages/SecureExample'))

// Loading fallback
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <h2 className="text-xl font-semibold">Loading...</h2>
    </div>
  </div>
)

const App = () => {

  return (
    <QueryProvider>
      <BrowserRouter>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<DashboardForum />} />
            <Route path="/auth/*" element={<Auth />} />
            <Route path="/problems" element={<Problems />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/secure" element={<SecureExample />} />
            </Route>

            {/* Catch-all route */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </QueryProvider>
  )
}

export default App
