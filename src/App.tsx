import { Dashboard } from "./pages/Dashboard";
import { Routes, Route } from "react-router-dom";
import { ProtectedRoute, PublicOnlyRoute } from "./router/guards";
import LoginPage from "./pages/Login";
import RegisterPage from "./pages/Register";
import Header from "./pages/Header";

function AppRouter() {
  return (
    <div className="flex flex-col h-screen w-full">
      <Header />
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>

        <Route
          path="*"
          element={<p className="text-center mt-10">404 - Not found</p>}
        />
      </Routes>
    </div>
  );
}

export default AppRouter;
