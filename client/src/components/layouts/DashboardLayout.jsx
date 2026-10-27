
import { Outlet } from "react-router-dom";
import Sidebar from "../dashboard/Sidebar";

function DashboardLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-[#0b0d0f]">
      <Sidebar />

      <main className="min-w-0 flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}

export default DashboardLayout;

