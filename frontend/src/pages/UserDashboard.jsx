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
    <div className="mx-auto max-w-4xl">
      {/* Page Header */}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>

        <p className="mt-2 text-gray-500">
          Manage your account information and profile picture.
        </p>
      </div>

      {/* Loading */}

      {loading && (
        <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
          <p className="text-gray-500">Loading profile...</p>
        </div>
      )}

      {/* Error */}

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Success */}

      {success && (
        <div className="mb-6 rounded-lg bg-green-50 p-4 text-sm text-green-600">
          {success}
        </div>
      )}

      {!loading && profile && (
        <div className="grid gap-6 md:grid-cols-3">
          {/* Profile Picture Card */}

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="mb-6 text-lg font-semibold text-gray-900">
              Profile Picture
            </h2>

            <div className="flex flex-col items-center">
              {/* Current / Preview Image */}

              <div className="mb-5 h-32 w-32 overflow-hidden rounded-full border-4 border-gray-100 bg-gray-200">
                {preview ? (
                  <img
                    src={preview}
                    alt="Profile preview"
                    className="h-full w-full object-cover"
                  />
                ) : profile.profile_picture ? (
                  <img
                    src={`${import.meta.env.VITE_API_URL}/uploads/${profile.profile_picture}`}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-4xl font-bold text-gray-400">
                    {profile.name?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* File Input */}

              <label className="mb-3 w-full cursor-pointer rounded-lg border border-gray-300 px-4 py-2 text-center text-sm font-medium text-gray-700 transition hover:bg-gray-50">
                Choose Image
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>

              {/* Upload Button */}

              {selectedImage && (
                <button
                  type="button"
                  onClick={handleUploadPicture}
                  disabled={uploading}
                  className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {uploading ? "Uploading..." : "Upload Picture"}
                </button>
              )}

              <p className="mt-4 text-center text-xs text-gray-400">
                JPEG, PNG or WebP
                <br />
                Maximum size: 5MB
              </p>
            </div>
          </div>

          {/* Profile Information */}

          <div className="rounded-2xl bg-white p-6 shadow-sm md:col-span-2">
            <h2 className="mb-6 text-lg font-semibold text-gray-900">
              Account Information
            </h2>

            <form onSubmit={handleUpdateProfile} className="space-y-5">
              {/* Name */}

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Name
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Email */}

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Email
                </label>

                <input
                  type="email"
                  value={profile.email}
                  disabled
                  className="w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-100 px-4 py-3 text-gray-500"
                />

                <p className="mt-1 text-xs text-gray-400">
                  Email cannot be changed from this page.
                </p>
              </div>

              {/* Role */}

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Role
                </label>

                <div className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-600">
                  {profile.role}
                </div>
              </div>

              {/* Created Date */}

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Member Since
                </label>

                <p className="text-sm text-gray-600">
                  {new Date(profile.created_at).toLocaleDateString()}
                </p>
              </div>

              {/* Save */}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserDashboard;
