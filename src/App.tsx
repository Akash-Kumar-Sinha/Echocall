import { Route, Routes, useLocation } from "react-router-dom";

import Sidebar from "./components/Sidebar";
import Auth from "./Pages/Auth";
import ProtectedRoute from "./utils/ProtectedRoute";
import SpaceRoom from "./Pages/SpaceRoom";
import Profile from "./components/Profile/Profile";

function App() {
  const location = useLocation();

  return (
    <div className="bg-black text-white flex w-full gap-2">
      {location.pathname !== "/" && <Sidebar />}
      <Routes>
        <Route path="/" element={<Auth />} />
        <Route path="/home" element={<ProtectedRoute Protect={SpaceRoom} />} />
        <Route path="/profile" element={<ProtectedRoute Protect={Profile} />} />
      </Routes>
    </div>
  );
}

export default App;
