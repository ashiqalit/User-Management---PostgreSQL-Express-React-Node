import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginSuccess } from "../redux/authSlice";
import api from "../services/api";

function UserDashboard() {
  const dispatch = useDispatch();

  const { token } = useSelector((state) => state.auth);

  const [profile, setProfile] = useState(null);

  const [selectedImage, setSelectedImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [uploading, setUploading] = useState(false);

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

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (!file) {
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setError("Only JPEG, PNG and WebP images are allowed");

      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB");

      return;
    }

    setError("");
    setSelectedImage(file);

    const imagePreview = URL.createObjectURL(file);

    setPreview(imagePreview);
  };

  const handleUploadPicture = async () => {
    if (!selectedImage) {
      setError("Please select an image");
      return;
    }

    try {
      setUploading(true);
      setError("");
      setSuccess("");

      const formData = new FormData();

      formData.append("profile_picture", selectedImage);

      const response = await api.post("/users/profile-picture", formData);

      const updatedUser = response.data.user;

      setProfile(updatedUser);

      dispatch(
        loginSuccess({
          user: updatedUser,
          token,
        }),
      );

      setSelectedImage(null);
      setPreview("");

      setSuccess("Profile picture updated successfully");
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message || "Failed to upload profile picture",
      );
    } finally {
      setUploading(false);
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

      <div>
        <h2>Profile Picture</h2>

        {profile?.profile_picture && (
          <div>
            <img
              src={`http://localhost:5000/uploads/${profile.profile_picture}`}
              alt="Profile"
              width="150"
              height="150"
            />
          </div>
        )}

        {preview && (
          <div>
            <p>Preview:</p>

            <img src={preview} alt="Preview" width="150" height="150" />
          </div>
        )}

        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleImageChange}
        />

        <button
          type="button"
          onClick={handleUploadPicture}
          disabled={!selectedImage || uploading}
        >
          {uploading ? "Uploading..." : "Upload Picture"}
        </button>
      </div>

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
