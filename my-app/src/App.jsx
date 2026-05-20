import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import Landing from "./pages/landing.jsx";
import QareebAuth from "./pages/QareebAuth.jsx";
import QareebFeed from "./pages/QareebFeed.jsx";
import QareebLayout from "./pages/QareebLayout.jsx";
import QareebProfile from "./pages/QareebProfile.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<QareebAuth />} />

        <Route path="/app" element={<QareebLayout />}>
          <Route index element={<QareebFeed />} />
          <Route path="profile" element={<QareebProfile />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
