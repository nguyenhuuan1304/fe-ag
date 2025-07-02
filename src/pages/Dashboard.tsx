import { useNavigate } from "react-router-dom";
import { TabsHeader } from "../components/TabsHeader";

export function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = user?.role === "ADMIN";
  if (isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
        <p className="text-lg text-gray-700">
          This page is for admin use only. Please check back later.
        </p>
        <p className="text-sm text-gray-500 mt-2">
          If you have any questions, please contact support.
        </p>
        <div
          className="cursor-pointer flex items-center gap-4 justify-between bg-blue-500 p-2 rounded-lg text-white mt-4 hover:bg-blue-600 transition-colors"
          onClick={() => navigate("/register")}
        >
          <span className="font-semibold">Đăng ký tài khoản</span>
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-col mx-auto px-20 py-10 w-full h-full">
      <TabsHeader />
    </div>
  );
}
