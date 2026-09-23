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
  const [editingUser, setEditingUser] = useState(null);
  const [editUser, setEditUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  });
  const [updating, setUpdating] = useState(false);

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

  const handleEditClick = (user) => {
    setEditingUser(user);

    setEditUser({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
    });

    setError("");
  };

  const handleEditUserChange = (e) => {
    const { name, value } = e.target;

    setEditUser((currentUser) => ({
      ...currentUser,
      [name]: value,
    }));
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();

    setError("");

    if (!editUser.name.trim() || !editUser.email.trim()) {
      setError("Name and email are required");
      return;
    }
    try {
      setUpdating(true);

      const response = await api.put(`/admin/users/${editingUser.id}`, {
        name: editUser.name.trim(),
        email: editUser.email.trim(),
        password: editUser.password,
        role: editUser.role,
      });

      const updatedUser = response.data.user;

      setUsers((currentUsers) =>
        currentUsers.map((currentUser) =>
          currentUser.id === updatedUser.id ? updatedUser : currentUser,
        ),
      );
      setEditingUser(null);

      setEditUser({
        name: "",
        email: "",
        password: "",
        role: "user",
      });
    } catch (error) {
      console.error(error);

      setError(error.response?.data?.message || "Failed to update user");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <p>Loading users..</p>;
  }

  return (
    <div className="mx-auto max-w-7xl">
      {/* Header */}

      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>

          <p className="mt-2 text-gray-500">
            Manage users and their account permissions.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setShowCreateForm(!showCreateForm);
            setError("");
          }}
          className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          {showCreateForm ? "Cancel" : "+ Add User"}
        </button>
      </div>

      {/* Error */}

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Create User Form */}

      {showCreateForm && (
        <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-xl font-semibold text-gray-900">
            Create New User
          </h2>

          <form
            onSubmit={handleCreateUser}
            className="grid gap-5 md:grid-cols-2"
          >
            {/* Name */}

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Name
              </label>

              <input
                type="text"
                name="name"
                value={newUser.name}
                onChange={handleNewUserChange}
                placeholder="Enter name"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Email */}

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Email
              </label>

              <input
                type="email"
                name="email"
                value={newUser.email}
                onChange={handleNewUserChange}
                placeholder="user@example.com"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Password */}

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Password
              </label>

              <input
                type="password"
                name="password"
                value={newUser.password}
                onChange={handleNewUserChange}
                placeholder="Enter password"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Role */}

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Role
              </label>

              <select
                name="role"
                value={newUser.role}
                onChange={handleNewUserChange}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="user">User</option>

                <option value="admin">Admin</option>
              </select>
            </div>

            {/* Submit */}

            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={creating}
                className="rounded-lg bg-green-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {creating ? "Creating..." : "Create User"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* User Statistics */}

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total Users</p>

          <p className="mt-2 text-3xl font-bold text-gray-900">
            {users.length}
          </p>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Administrators</p>

          <p className="mt-2 text-3xl font-bold text-gray-900">
            {users.filter((user) => user.role === "admin").length}
          </p>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Regular Users</p>

          <p className="mt-2 text-3xl font-bold text-gray-900">
            {users.filter((user) => user.role === "user").length}
          </p>
        </div>
      </div>

      {/* Users Table */}

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
        <div className="border-b px-6 py-5">
          <h2 className="text-xl font-semibold text-gray-900">Users</h2>

          <p className="mt-1 text-sm text-gray-500">
            View and manage registered users.
          </p>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading users...</div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No users found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    User
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Email
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Role
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Joined
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {users.map((user) => (
                  <tr key={user.id} className="transition hover:bg-gray-50">
                    {/* User */}

                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-gray-200 font-semibold text-gray-500">
                          {user.profile_picture ? (
                            <img
                              src={`http://localhost:5000/uploads/${user.profile_picture}`}
                              alt={user.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            user.name?.charAt(0).toUpperCase()
                          )}
                        </div>

                        <div>
                          <p className="font-medium text-gray-900">
                            {user.name}
                          </p>

                          <p className="text-xs text-gray-400">ID: {user.id}</p>
                        </div>
                      </div>
                    </td>

                    {/* Email */}

                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                      {user.email}
                    </td>

                    {/* Role */}

                    <td className="whitespace-nowrap px-6 py-4">
                      <span
                        className={
                          user.role === "admin"
                            ? "rounded-full bg-purple-50 px-3 py-1 text-xs font-medium text-purple-600"
                            : "rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600"
                        }
                      >
                        {user.role}
                      </span>
                    </td>

                    {/* Date */}

                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>

                    {/* Actions */}

                    <td className="whitespace-nowrap px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleEditClick(user)}
                          className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-medium text-blue-600 transition hover:bg-blue-100"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(user.id)}
                          className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-100"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit User Modal */}

      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Edit User
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Update account information.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="rounded-lg px-3 py-2 text-gray-500 hover:bg-gray-100"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="space-y-5">
              {/* Name */}

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={editUser.name}
                  onChange={handleEditUserChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Email */}

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Email
                </label>

                <input
                  type="email"
                  name="email"
                  value={editUser.email}
                  onChange={handleEditUserChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Password */}

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  New Password
                </label>

                <input
                  type="password"
                  name="password"
                  value={editUser.password}
                  onChange={handleEditUserChange}
                  placeholder="Leave blank to keep current password"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Role */}

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Role
                </label>

                <select
                  name="role"
                  value={editUser.role}
                  onChange={handleEditUserChange}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="user">User</option>

                  <option value="admin">Admin</option>
                </select>
              </div>

              {/* Buttons */}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="rounded-lg border border-gray-300 px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={updating}
                  className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {updating ? "Updating..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
