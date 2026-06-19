import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-4 h-4 rounded-full bg-primary" />
          <span className="text-2xl font-bold tracking-tight text-base-content">Flinggo</span>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
