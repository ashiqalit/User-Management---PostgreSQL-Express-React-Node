import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { logout } from "../redux/authSlice";

function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());

    navigate("/login");
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <nav>
      <div>
        <h2>User Management</h2>
      </div>

      <div>
        <span>Welcome, {user?.name}</span>

        {user?.role === "admin" ? (
          <button onClick={() => navigate("/admin")}>Admin Dashboard</button>
        ) : (
          <button onClick={() => navigate("/dashboard")}>Dashboard</button>
        )}

        <button onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
}

export default Navbar;
