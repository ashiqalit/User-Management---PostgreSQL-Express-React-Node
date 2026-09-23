import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

import api from "../services/api";

function AdminDashboard() {
  const { user } = useSelector((state) => state.auth);

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  });
  const [creating, setCreating] = useState(false);

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

  const handleNewUserChange = (e) => {
    const { name, value } = e.target;

    setNewUser((currentUser) => ({
      ...currentUser,
      [name]: value,
    }));
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();

    setError("");

    if (!newUser.name.trim() || !newUser.email.trim() || !newUser.password) {
      setError("Name, email and password are required");
      return;
    }

    try {
      setCreating(true);

      const response = await api.post("/admin/users", {
        name: newUser.name.trim(),
        email: newUser.email.trim(),
        password: newUser.password,
        role: newUser.role,
      });

      const createdUser = response.data.user;

      setUsers((currentUsers) => [...currentUsers, createdUser]);

      setNewUser({
        name: "",
        email: "",
        password: "",
        role: "user",
      });

      setShowCreateForm(false);
    } catch (error) {
      console.error(error);

      setError(error.response?.data?.message || "Failed to create user");
    } finally {
      setCreating(false);
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
      <button onClick={() => setShowCreateForm(!showCreateForm)}>
        {showCreateForm ? "Cancel" : "Create User"}
      </button>

      {showCreateForm && (
        <form onSubmit={handleCreateUser}>
          <h3>Create New User</h3>
          <div>
            <label>Name</label>
            <input
              type="text"
              name="name"
              value={newUser.name}
              onChange={handleNewUserChange}
              placeholder="Enter name"
            />
          </div>

          <div>
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={newUser.email}
              onChange={handleNewUserChange}
              placeholder="Enter mail"
            />
          </div>

          <div>
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={newUser.password}
              onChange={handleNewUserChange}
              placeholder="Enter password"
            />
          </div>

          <div>
            <label>Role</label>
            <select
              name="role"
              value={newUser.role}
              onChange={handleNewUserChange}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button type="submit" disabled={creating}>
            {creating ? "Creating.." : "Create User"}
          </button>
        </form>
      )}
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
