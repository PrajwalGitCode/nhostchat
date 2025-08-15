import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import Welcome from "./pages/Welcome";

import { nhost } from "./nhost";
import { useAuthenticationStatus } from '@nhost/react';

function App() {
  const { isAuthenticated, isLoading } = useAuthenticationStatus();
  if (isLoading) return null;
  return (
    <Router>
      <Routes>
        <Route path="/signup" element={isAuthenticated ? <Navigate to="/welcome" /> : <SignUp />} />
        <Route path="/signin" element={isAuthenticated ? <Navigate to="/welcome" /> : <SignIn />} />
        <Route path="/welcome" element={isAuthenticated ? <Welcome /> : <Navigate to="/signin" />} />
        <Route path="*" element={<Navigate to={isAuthenticated ? "/welcome" : "/signin"} />} />
      </Routes>
    </Router>
  );
}

export default App;
