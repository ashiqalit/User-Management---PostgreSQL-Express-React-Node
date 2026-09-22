import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

import api from "../services/api";

function AdminDashboard() {
  const { user } = useSelector((state) => state.auth);

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get("/admin/users");

        setUsers(response.data.users);
      } catch (error) {
        console.error(error);

        setError(error.response?.data?.message || "Failed to load users");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleDelete = async (userId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this user?",
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/admin/users/${userId}`);

      setUsers((currentUsers) =>
        currentUsers.filter((currentUser) => currentUser.id !== userId),
      );
    } catch (error) {
      console.error(error);

      setError(error.response?.data?.message || "Failed to delete user");
    }
  };

  if (loading) {
    return <p>Loading users..</p>;
  }

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <h2>Welcome, {user?.name}</h2>

      {error && <p>{error}</p>}

      <h2>User Management</h2>
      <p>Total users: {users.length}</p>

      <table border="1">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {users.map((currentUser) => (
            <tr key={currentUser.id}>
              <td>{currentUser.id}</td>
              <td>{currentUser.name}</td>
              <td>{currentUser.email}</td>
              <td>{currentUser.role}</td>
              <td>
                <button>Edit</button>
                <button onClick={() => handleDelete(currentUser.id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminDashboard;
