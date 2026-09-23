import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";

import { logout } from "../redux/authSlice";

function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());

    navigate("/login");
  };

  const authPages = ["/login", "/register"];

  if (!isAuthenticated || authPages.includes(location.pathname)) {
    return null;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <nav className="border-b bg-white shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <h1
          className="cursor-pointer text-xl font-bold text-gray-900"
          onClick={() =>
            navigate(user?.role === "admin" ? "/admin" : "/dashboard")
          }
        >
          User Management
        </h1>

        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            Welcome,{" "}
            <span className="font-medium text-gray-900">{user?.name}</span>
          </span>

          {user?.role === "admin" ? (
            <button
              onClick={() => navigate("/admin")}
              className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              Admin Dashboard
            </button>
          ) : (
            <button
              onClick={() => navigate("/dashboard")}
              className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              Dashboard
            </button>
          )}

          <button
            onClick={handleLogout}
            className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
