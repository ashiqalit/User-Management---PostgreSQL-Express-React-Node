import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginSuccess } from "../redux/authSlice";
import api from "../services/api";

function UserDashboard() {
  const dispatch = useDispatch();

  const { token } = useSelector((state) => state.auth);

  const [profile, setProfile] = useState(null);

  const [name, setName] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get("/users/profile");

        const fetchedUser = response.data.user;

        setProfile(fetchedUser);
        setName(fetchedUser.name);
      } catch (error) {
        console.error(error);

        setError(error.response?.data?.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    try {
      setSaving(true);
      const response = await api.put("/users/profile", {
        name: name.trim(),
      });

      const updatedUser = response.data.user;

      setProfile(updatedUser);

      dispatch(
        loginSuccess({
          user: updatedUser,
          token,
        }),
      );

      setSuccess("Profile updated successfully");
    } catch (error) {
      console.error(error);

      setError(error.response?.data?.message || "Failed to update the profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p>Loading Profile...</p>;
  }

  return (
    <div>
      <h1>User Dashboard</h1>
      {error && <p>{error}</p>}

      {success && <p>{success}</p>}

      {profile && (
        <>
          <h2>Profile</h2>

          <p>
            <strong>Email:</strong> {profile.email}
          </p>

          <p>
            <strong>Role:</strong> {profile.role}
          </p>

          <form onSubmit={handleUpdateProfile}>
            <div>
              <label>Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Update Name"}
            </button>
          </form>
        </>
      )}
    </div>
  );
}

export default UserDashboard;
