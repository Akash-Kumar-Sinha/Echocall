import { Route, Routes, useLocation } from "react-router-dom";

import Sidebar from "./components/Sidebar";
import Auth from "./Pages/Auth";
import ProtectedRoute from "./utils/ProtectedRoute";
import SpaceRoom from "./Pages/SpaceRoom";
import Profile from "./Pages/Profile";
import SearchBar from "./Pages/SearchBar";
import NotificationBar from "./Pages/NotificationBar";
import { ProfileProvider } from "./contexts/profileContext";
import Mobilebar from "./components/Mobilebar";

function App() {
  const location = useLocation();

  const showSidebarAndMobilebar =
    location.pathname !== "/" && !location.pathname.startsWith("/call/");

  return (
    <div className="bg-zinc-950 h-full w-full text-yellow-50 flex gap-2">
      {showSidebarAndMobilebar && (
        <>
          <Sidebar />
          <Mobilebar />
        </>
      )}
      <ProfileProvider>
        <Routes>
          <Route path="/" element={<Auth />} />
          <Route
            path="/call/:roomId"
            element={<ProtectedRoute Protect={SpaceRoom} />}
          />
          <Route
            path="/profile"
            element={<ProtectedRoute Protect={Profile} />}
          />
          <Route
            path="/search"
            element={<ProtectedRoute Protect={SearchBar} />}
          />
          <Route
            path="/notification"
            element={<ProtectedRoute Protect={NotificationBar} />}
          />
        </Routes>
      </ProfileProvider>
    </div>
  );
}

export default App;
