import { useSelector } from "react-redux"

function AdminDashboard() {
    const { user } = useSelector((state) => state.auth);

    return(
        <div>
            <h1>Admin Dashboard</h1>
            <h2>Welcome, {user?.name}</h2>
            <p>Email: {user?.email}</p>
            <p>Role: {user?.role}</p>

            <hr />

            <h2>User Management</h2>
            <p>Admin can manage users from here</p>
        </div>
    )
}

export default AdminDashboard