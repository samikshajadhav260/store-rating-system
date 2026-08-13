import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

const API_URL = "http://localhost:5000/api";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user") || "null")
  );

  const [isLogin, setIsLogin] = useState(true);

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
    address: "",
  });

  const [stores, setStores] = useState([]);
  const [filteredStores, setFilteredStores] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [selectedStore, setSelectedStore] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const [showRating, setShowRating] = useState(false);
  const [ratingValue, setRatingValue] = useState(0);

  const [myRatings, setMyRatings] = useState({});

  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
  });

  const [adminStats, setAdminStats] = useState({
    totalUsers: 0,
    totalStores: 0,
    totalRatings: 0,
  });

  const [adminUsers, setAdminUsers] = useState([]);
  const [adminStores, setAdminStores] = useState([]);

  const [adminUserSearch, setAdminUserSearch] = useState("");
  const [adminStoreSearch, setAdminStoreSearch] = useState("");

  const [showAddUser, setShowAddUser] = useState(false);
  const [showAddStore, setShowAddStore] = useState(false);

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    address: "",
    role: "USER",
  });

  const [newStore, setNewStore] = useState({
    name: "",
    email: "",
    address: "",
    owner_id: "",
  });

  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserDetails, setShowUserDetails] = useState(false);

  const [ownerDashboard, setOwnerDashboard] = useState(null);

  const [adminPage, setAdminPage] = useState("dashboard");

  const authHeaders = {
    Authorization: `Bearer ${token}`,
  };

  useEffect(() => {
    if (token && user) {
      if (user.role === "ADMIN") {
        loadAdminDashboard();
      } else if (user.role === "OWNER") {
        loadOwnerDashboard();
      } else {
        loadStores();
      }
    }
  }, [token, user]);

  useEffect(() => {
    applyStoreSearch();
  }, [searchTerm, filter, stores]);

  const showMessage = (text) => {
    setMessage(text);
    setError("");

    setTimeout(() => {
      setMessage("");
    }, 3000);
  };

  const showError = (text) => {
    setError(text);
    setMessage("");

    setTimeout(() => {
      setError("");
    }, 4000);
  };

  const validateName = (name) => {
    return name.trim().length >= 20 && name.trim().length <= 60;
  };

  const validateAddress = (address) => {
    return address.length <= 400;
  };

  const validatePassword = (password) => {
    return (
      password.length >= 8 &&
      password.length <= 16 &&
      /[A-Z]/.test(password) &&
      /[^A-Za-z0-9]/.test(password)
    );
  };

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await axios.post(
        `${API_URL}/auth/login`,
        loginData
      );

      const receivedToken = response.data.token;

      let loggedUser = response.data.user;

      if (!loggedUser && receivedToken) {
        try {
          const payload = JSON.parse(
            atob(receivedToken.split(".")[1])
          );

          loggedUser = {
            id: payload.id,
            role: payload.role,
            name: payload.name,
            email: payload.email,
          };
        } catch (decodeError) {
          console.log("JWT decode skipped");
        }
      }

      localStorage.setItem("token", receivedToken);

      if (loggedUser) {
        localStorage.setItem("user", JSON.stringify(loggedUser));
      }

      setToken(receivedToken);
      setUser(loggedUser);

      showMessage("Login successful");

      setLoginData({
        email: "",
        password: "",
      });
    } catch (err) {
      showError(
        err.response?.data?.message ||
          "Invalid email or password"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!validateName(registerData.name)) {
      showError("Name must be between 20 and 60 characters.");
      return;
    }

    if (!validateEmail(registerData.email)) {
      showError("Please enter a valid email address.");
      return;
    }

    if (!validatePassword(registerData.password)) {
      showError(
        "Password must be 8-16 characters and contain at least one uppercase letter and one special character."
      );
      return;
    }

    if (!validateAddress(registerData.address)) {
      showError("Address cannot exceed 400 characters.");
      return;
    }

    try {
      setLoading(true);

      await axios.post(
        `${API_URL}/auth/register`,
        registerData
      );

      showMessage("Registration successful. Please login.");

      setIsLogin(true);

      setRegisterData({
        name: "",
        email: "",
        password: "",
        address: "",
      });
    } catch (err) {
      showError(
        err.response?.data?.message ||
          "Registration failed"
      );
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setToken("");
    setUser(null);

    setStores([]);
    setFilteredStores([]);
    setMyRatings({});
    setOwnerDashboard(null);

    showMessage("Logged out successfully");
  };

  const loadStores = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        `${API_URL}/stores`
      );

      const data = Array.isArray(response.data)
        ? response.data
        : response.data.stores || [];

      setStores(data);
      setFilteredStores(data);

      if (user?.id) {
        loadMyRatings();
      }
    } catch (err) {
      showError(
        err.response?.data?.message ||
          "Unable to load stores"
      );
    } finally {
      setLoading(false);
    }
  };

  const loadMyRatings = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/ratings/user/${user.id}`,
        {
          headers: authHeaders,
        }
      );

      const ratings = Array.isArray(response.data)
        ? response.data
        : response.data.ratings || [];

      const ratingMap = {};

      ratings.forEach((rating) => {
        ratingMap[rating.store_id] = rating.rating;
      });

      setMyRatings(ratingMap);
    } catch (err) {
      console.log("My ratings endpoint unavailable");
    }
  };

  const applyStoreSearch = () => {
    let results = [...stores];

    const search = searchTerm.trim().toLowerCase();

    if (search) {
      results = results.filter((store) => {
        const name = String(store.name || "").toLowerCase();
        const email = String(store.email || "").toLowerCase();
        const address = String(store.address || "").toLowerCase();

        return (
          name.includes(search) ||
          email.includes(search) ||
          address.includes(search)
        );
      });
    }

    if (filter === "rated") {
      results = results.filter(
        (store) => Number(store.average_rating || 0) > 0
      );
    }

    if (filter === "unrated") {
      results = results.filter(
        (store) => Number(store.average_rating || 0) === 0
      );
    }

    setFilteredStores(results);
  };

  const handleSearch = (e) => {
    e?.preventDefault();
    applyStoreSearch();
  };

  const openRating = (store) => {
    setSelectedStore(store);

    const existingRating = myRatings[store.id];

    setRatingValue(existingRating || 0);
    setShowRating(true);
  };

  const submitRating = async () => {
    if (!ratingValue) {
      showError("Please select a rating.");
      return;
    }

    if (!selectedStore) {
      return;
    }

    try {
      const existingRating =
        myRatings[selectedStore.id];

      if (existingRating) {
        await axios.put(
          `${API_URL}/ratings`,
          {
            store_id: selectedStore.id,
            rating: ratingValue,
          },
          {
            headers: authHeaders,
          }
        );

        showMessage("Rating updated successfully");
      } else {
        await axios.post(
          `${API_URL}/ratings`,
          {
            store_id: selectedStore.id,
            rating: ratingValue,
          },
          {
            headers: authHeaders,
          }
        );

        showMessage("Rating submitted successfully");
      }

      setShowRating(false);
      setRatingValue(0);

      await loadStores();
      await loadMyRatings();
    } catch (err) {
      showError(
        err.response?.data?.message ||
          "Unable to submit rating"
      );
    }
  };

  const openStoreDetails = async (store) => {
    try {
      const [storeResponse, ratingsResponse] =
        await Promise.all([
          axios.get(`${API_URL}/stores/${store.id}`, {
            headers: authHeaders,
          }),
          axios.get(`${API_URL}/ratings/store/${store.id}`, {
            headers: authHeaders,
          }),
        ]);

      const storeData =
        storeResponse.data.store || storeResponse.data;

      const ratingsData = Array.isArray(ratingsResponse.data)
        ? ratingsResponse.data
        : ratingsResponse.data.ratings || [];

      setSelectedStore({
        ...storeData,
        ratings: ratingsData,
        total_ratings:
          storeData.total_ratings ?? ratingsData.length,
        rating_count:
          storeData.rating_count ?? ratingsData.length,
      });
    } catch (err) {
      console.error("View store details error:", err);
      setSelectedStore({
        ...store,
        ratings: [],
      });
    }

    setShowDetails(true);
  };

  const changePassword = async (e) => {
    e.preventDefault();

    if (!validatePassword(passwordData.newPassword)) {
      showError(
        "New password must be 8-16 characters and contain at least one uppercase letter and one special character."
      );
      return;
    }

    try {
      await axios.put(
        `${API_URL}/auth/change-password`,
        passwordData,
        {
          headers: authHeaders,
        }
      );

      showMessage("Password changed successfully");

      setPasswordData({
        oldPassword: "",
        newPassword: "",
      });

      setShowChangePassword(false);
    } catch (err) {
      showError(
        err.response?.data?.message ||
          "Unable to change password"
      );
    }
  };

  const loadAdminDashboard = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/admin/dashboard`,
        {
          headers: authHeaders,
        }
      );

      setAdminStats({
        totalUsers:
          response.data.totalUsers || 0,
        totalStores:
          response.data.totalStores || 0,
        totalRatings:
          response.data.totalRatings || 0,
      });
    } catch (err) {
      showError(
        err.response?.data?.message ||
          "Unable to load admin dashboard"
      );
    }
  };

  const loadAdminUsers = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/admin/users`,
        {
          headers: authHeaders,
        }
      );

      const data = Array.isArray(response.data)
        ? response.data
        : response.data.users || [];

      setAdminUsers(data);
    } catch (err) {
      showError(
        err.response?.data?.message ||
          "Unable to load users"
      );
    }
  };

  const loadAdminStores = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/admin/stores`,
        {
          headers: authHeaders,
        }
      );

      const data = Array.isArray(response.data)
        ? response.data
        : response.data.stores || [];

      setAdminStores(data);
    } catch (err) {
      showError(
        err.response?.data?.message ||
          "Unable to load stores"
      );
    }
  };

  const addAdminUser = async (e) => {
    e.preventDefault();

    if (!validateName(newUser.name)) {
      showError("Name must be between 20 and 60 characters.");
      return;
    }

    if (!validateEmail(newUser.email)) {
      showError("Please enter a valid email.");
      return;
    }

    if (!validatePassword(newUser.password)) {
      showError(
        "Password must be 8-16 characters with at least one uppercase letter and one special character."
      );
      return;
    }

    if (!validateAddress(newUser.address)) {
      showError("Address cannot exceed 400 characters.");
      return;
    }

    try {
      await axios.post(
        `${API_URL}/admin/users`,
        newUser,
        {
          headers: authHeaders,
        }
      );

      showMessage("User added successfully");

      setNewUser({
        name: "",
        email: "",
        password: "",
        address: "",
        role: "USER",
      });

      setShowAddUser(false);

      await loadAdminUsers();
      await loadAdminDashboard();
    } catch (err) {
      showError(
        err.response?.data?.message ||
          "Unable to add user"
      );
    }
  };

  const addAdminStore = async (e) => {
    e.preventDefault();

    if (!newStore.name.trim()) {
      showError("Store name is required.");
      return;
    }

    if (!validateEmail(newStore.email)) {
      showError("Please enter a valid store email.");
      return;
    }

    if (!validateAddress(newStore.address)) {
      showError("Address cannot exceed 400 characters.");
      return;
    }

    try {
      await axios.post(
        `${API_URL}/admin/stores`,
        newStore,
        {
          headers: authHeaders,
        }
      );

      showMessage("Store added successfully");

      setNewStore({
        name: "",
        email: "",
        address: "",
        owner_id: "",
      });

      setShowAddStore(false);

      await loadAdminStores();
      await loadAdminDashboard();
    } catch (err) {
      showError(
        err.response?.data?.message ||
          "Unable to add store"
      );
    }
  };

  const openAdminUserDetails = async (id) => {
    try {
      const response = await axios.get(
        `${API_URL}/admin/users/${id}`,
        {
          headers: authHeaders,
        }
      );

      setSelectedUser(
        response.data.user || response.data
      );

      setShowUserDetails(true);
    } catch (err) {
      showError(
        err.response?.data?.message ||
          "Unable to load user details"
      );
    }
  };

  const loadOwnerDashboard = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/owner/dashboard`,
        {
          headers: authHeaders,
        }
      );

      setOwnerDashboard(response.data);
    } catch (err) {
      showError(
        err.response?.data?.message ||
          "Unable to load owner dashboard"
      );
    }
  };

  const filteredAdminUsers = adminUsers.filter(
    (item) => {
      const search =
        adminUserSearch.trim().toLowerCase();

      if (!search) return true;

      return (
        String(item.name || "")
          .toLowerCase()
          .includes(search) ||
        String(item.email || "")
          .toLowerCase()
          .includes(search) ||
        String(item.address || "")
          .toLowerCase()
          .includes(search) ||
        String(item.role || "")
          .toLowerCase()
          .includes(search)
      );
    }
  );

  const filteredAdminStores = adminStores.filter(
    (item) => {
      const search =
        adminStoreSearch.trim().toLowerCase();

      if (!search) return true;

      return (
        String(item.name || "")
          .toLowerCase()
          .includes(search) ||
        String(item.email || "")
          .toLowerCase()
          .includes(search) ||
        String(item.address || "")
          .toLowerCase()
          .includes(search)
      );
    }
  );

  if (!token || !user) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-brand">
            <div className="auth-logo">★</div>

            <h1>Store Rating</h1>

            <p>
              Discover great stores and share your
              experience with the community.
            </p>
          </div>

          <div className="auth-form">
            <h2>
              {isLogin ? "Welcome back" : "Create account"}
            </h2>

            <p className="auth-subtitle">
              {isLogin
                ? "Sign in to continue to your account."
                : "Create your Store Rating account."}
            </p>

            {message && (
              <div className="form-message">
                {message}
              </div>
            )}

            {error && (
              <div className="form-message form-error">
                {error}
              </div>
            )}

            {isLogin ? (
              <form onSubmit={handleLogin}>
                <div className="input-group">
                  <label>Email</label>

                  <input
                    type="email"
                    value={loginData.email}
                    onChange={(e) =>
                      setLoginData({
                        ...loginData,
                        email: e.target.value,
                      })
                    }
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <div className="input-group">
                  <label>Password</label>

                  <input
                    type="password"
                    value={loginData.password}
                    onChange={(e) =>
                      setLoginData({
                        ...loginData,
                        password: e.target.value,
                      })
                    }
                    placeholder="Enter your password"
                    required
                  />
                </div>

                <button
                  className="primary-button"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? "Signing in..." : "Login"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister}>
                <div className="input-group">
                  <label>Name</label>

                  <input
                    type="text"
                    value={registerData.name}
                    onChange={(e) =>
                      setRegisterData({
                        ...registerData,
                        name: e.target.value,
                      })
                    }
                    placeholder="20-60 characters"
                    required
                  />
                </div>

                <div className="input-group">
                  <label>Email</label>

                  <input
                    type="email"
                    value={registerData.email}
                    onChange={(e) =>
                      setRegisterData({
                        ...registerData,
                        email: e.target.value,
                      })
                    }
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <div className="input-group">
                  <label>Password</label>

                  <input
                    type="password"
                    value={registerData.password}
                    onChange={(e) =>
                      setRegisterData({
                        ...registerData,
                        password: e.target.value,
                      })
                    }
                    placeholder="8-16 chars, uppercase + special"
                    required
                  />
                </div>

                <div className="input-group">
                  <label>Address</label>

                  <input
                    type="text"
                    value={registerData.address}
                    onChange={(e) =>
                      setRegisterData({
                        ...registerData,
                        address: e.target.value,
                      })
                    }
                    placeholder="Maximum 400 characters"
                    required
                  />
                </div>

                <button
                  className="primary-button"
                  type="submit"
                  disabled={loading}
                >
                  {loading
                    ? "Creating..."
                    : "Create Account"}
                </button>
              </form>
            )}

            <div className="switch-section">
              {isLogin
                ? "Don't have an account?"
                : "Already have an account?"}

              <button
                type="button"
                className="switch-button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError("");
                  setMessage("");
                }}
              >
                {isLogin ? "Register" : "Login"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (user.role === "ADMIN") {
    return (
      <div className="admin-page">
        <div className="admin-navbar">
          <div className="admin-brand">
            <div className="brand-mark">★</div>

            <div>
              <strong>Store Rating</strong>
              <span>System Administrator</span>
            </div>
          </div>

          <div className="admin-nav">
            <button
              className={`admin-nav-button ${
                adminPage === "dashboard"
                  ? "active"
                  : ""
              }`}
              onClick={() => {
                setAdminPage("dashboard");
                loadAdminDashboard();
              }}
            >
              Dashboard
            </button>

            <button
              className={`admin-nav-button ${
                adminPage === "users" ? "active" : ""
              }`}
              onClick={() => {
                setAdminPage("users");
                loadAdminUsers();
              }}
            >
              Users
            </button>

            <button
              className={`admin-nav-button ${
                adminPage === "stores" ? "active" : ""
              }`}
              onClick={() => {
                setAdminPage("stores");
                loadAdminStores();
              }}
            >
              Stores
            </button>
          </div>

          <div className="admin-user-area">
            <div className="admin-avatar">
              {(user.name || "A")
                .charAt(0)
                .toUpperCase()}
            </div>

            <div className="admin-user-details">
              <strong>{user.name || "Admin"}</strong>
              <span>ADMIN</span>
            </div>

            <button
              className="admin-logout"
              onClick={logout}
            >
              Logout
            </button>
          </div>
        </div>

        <div className="admin-content">
          {message && (
            <div className="form-message">
              {message}
            </div>
          )}

          {error && (
            <div className="form-message form-error">
              {error}
            </div>
          )}

          {adminPage === "dashboard" && (
            <>
              <div className="admin-welcome">
                <div className="page-eyebrow">
                  System Administrator
                </div>

                <h1>Dashboard</h1>

                <p>
                  Manage users, stores and monitor
                  submitted ratings.
                </p>
              </div>

              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon users-icon">
                    👥
                  </div>

                  <div>
                    <span>Total Users</span>
                    <strong>
                      {adminStats.totalUsers}
                    </strong>
                    <small>Registered users</small>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon stores-icon">
                    🏪
                  </div>

                  <div>
                    <span>Total Stores</span>
                    <strong>
                      {adminStats.totalStores}
                    </strong>
                    <small>Registered stores</small>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon ratings-icon">
                    ★
                  </div>

                  <div>
                    <span>Total Ratings</span>
                    <strong>
                      {adminStats.totalRatings}
                    </strong>
                    <small>Submitted ratings</small>
                  </div>
                </div>
              </div>

              <div className="management-section">
                <div className="section-header">
                  <h2>Management</h2>

                  <p>
                    Manage users and stores from one
                    place.
                  </p>
                </div>

                <div className="management-grid">
                  <button
                    className="management-card"
                    onClick={() =>
                      setShowAddUser(true)
                    }
                  >
                    <div className="management-icon">
                      👤
                    </div>

                    <div className="management-content">
                      <h3>Add User</h3>

                      <p>
                        Add normal users and admin
                        users.
                      </p>

                      <span>
                        Add new user →
                      </span>
                    </div>
                  </button>

                  <button
                    className="management-card"
                    onClick={() =>
                      setShowAddStore(true)
                    }
                  >
                    <div className="management-icon store-management-icon">
                      🏪
                    </div>

                    <div className="management-content">
                      <h3>Add Store</h3>

                      <p>
                        Register a new store in the
                        platform.
                      </p>

                      <span>
                        Add new store →
                      </span>
                    </div>
                  </button>
                </div>
              </div>
            </>
          )}

          {adminPage === "users" && (
            <div className="admin-table-section">
              <div className="table-page-header">
                <div>
                  <h1>Users</h1>
                  <p>
                    View and manage normal and admin
                    users.
                  </p>
                </div>

                <button
                  className="primary-button"
                  style={{ width: "auto", padding: "0 18px" }}
                  onClick={() =>
                    setShowAddUser(true)
                  }
                >
                  + Add User
                </button>
              </div>

              <div className="table-toolbar">
                <div className="table-search">
                  <span>⌕</span>

                  <input
                    value={adminUserSearch}
                    onChange={(e) =>
                      setAdminUserSearch(
                        e.target.value
                      )
                    }
                    placeholder="Search by name, email, address or role"
                  />
                </div>

                <span className="result-count">
                  {filteredAdminUsers.length} users
                </span>
              </div>

              <div className="data-table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Address</th>
                      <th>Role</th>
                      <th>Details</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredAdminUsers.map(
                      (item) => (
                        <tr key={item.id}>
                          <td>
                            <span className="id-badge">
                              #{item.id}
                            </span>
                          </td>

                          <td>
                            <div className="table-user">
                              <div className="small-avatar">
                                {(
                                  item.name || "U"
                                )
                                  .charAt(0)
                                  .toUpperCase()}
                              </div>

                              <strong>
                                {item.name}
                              </strong>
                            </div>
                          </td>

                          <td>{item.email}</td>
                          <td>{item.address}</td>

                          <td>
                            <span
                              className={`role-badge ${String(
                                item.role || ""
                              ).toLowerCase()}`}
                            >
                              {item.role}
                            </span>
                          </td>

                          <td>
                            <button
                              type="button"
                              className="details-button"
                              onClick={() =>
                                openAdminUserDetails(
                                  item.id
                                )
                              }
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>

                {filteredAdminUsers.length === 0 && (
                  <div className="table-empty">
                    No users found.
                  </div>
                )}
              </div>
            </div>
          )}

          {adminPage === "stores" && (
            <div className="admin-table-section">
              <div className="table-page-header">
                <div>
                  <h1>Stores</h1>
                  <p>
                    View all registered stores and
                    ratings.
                  </p>
                </div>

                <button
                  className="primary-button"
                  style={{ width: "auto", padding: "0 18px" }}
                  onClick={() =>
                    setShowAddStore(true)
                  }
                >
                  + Add Store
                </button>
              </div>

              <div className="table-toolbar">
                <div className="table-search">
                  <span>⌕</span>

                  <input
                    value={adminStoreSearch}
                    onChange={(e) =>
                      setAdminStoreSearch(
                        e.target.value
                      )
                    }
                    placeholder="Search by name, email or address"
                  />
                </div>

                <span className="result-count">
                  {filteredAdminStores.length} stores
                </span>
              </div>

              <div className="data-table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Store</th>
                      <th>Email</th>
                      <th>Address</th>
                      <th>Rating</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredAdminStores.map(
                      (store) => (
                        <tr key={store.id}>
                          <td>
                            #{store.id}
                          </td>

                          <td>
                            <div className="table-user">
                              <div className="store-small-icon">
                                🏪
                              </div>

                              <strong>
                                {store.name}
                              </strong>
                            </div>
                          </td>

                          <td>{store.email}</td>
                          <td>{store.address}</td>

                          <td>
                            <span className="rating-badge">
                              ★{" "}
                              {Number(
                                store.average_rating || 0
                              ).toFixed(1)}
                            </span>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>

                {filteredAdminStores.length === 0 && (
                  <div className="table-empty">
                    No stores found.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {showAddUser && (
          <div className="modal-overlay">
            <div className="details-modal">
              <button
                className="close-button"
                onClick={() =>
                  setShowAddUser(false)
                }
              >
                ×
              </button>

              <div className="modal-icon">
                👤
              </div>

              <h2>Add User</h2>

              <form onSubmit={addAdminUser}>
                <div className="input-group">
                  <label>Name</label>

                  <input
                    value={newUser.name}
                    onChange={(e) =>
                      setNewUser({
                        ...newUser,
                        name: e.target.value,
                      })
                    }
                    placeholder="20-60 characters"
                    required
                  />
                </div>

                <div className="input-group">
                  <label>Email</label>

                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) =>
                      setNewUser({
                        ...newUser,
                        email: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="input-group">
                  <label>Password</label>

                  <input
                    type="password"
                    value={newUser.password}
                    onChange={(e) =>
                      setNewUser({
                        ...newUser,
                        password: e.target.value,
                      })
                    }
                    placeholder="8-16 chars, uppercase + special"
                    required
                  />
                </div>

                <div className="input-group">
                  <label>Address</label>

                  <input
                    value={newUser.address}
                    onChange={(e) =>
                      setNewUser({
                        ...newUser,
                        address: e.target.value,
                      })
                    }
                    placeholder="Maximum 400 characters"
                    required
                  />
                </div>

                <div className="input-group">
                  <label>Role</label>

                  <select
                    value={newUser.role}
                    onChange={(e) =>
                      setNewUser({
                        ...newUser,
                        role: e.target.value,
                      })
                    }
                  >
                    <option value="USER">
                      USER
                    </option>

                    <option value="ADMIN">
                      ADMIN
                    </option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="submit-rating"
                >
                  Add User
                </button>
              </form>
            </div>
          </div>
        )}

        {showAddStore && (
          <div className="modal-overlay">
            <div className="details-modal">
              <button
                className="close-button"
                onClick={() =>
                  setShowAddStore(false)
                }
              >
                ×
              </button>

              <div className="modal-icon">
                🏪
              </div>

              <h2>Add Store</h2>

              <form onSubmit={addAdminStore}>
                <div className="input-group">
                  <label>Store Name</label>

                  <input
                    value={newStore.name}
                    onChange={(e) =>
                      setNewStore({
                        ...newStore,
                        name: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="input-group">
                  <label>Email</label>

                  <input
                    type="email"
                    value={newStore.email}
                    onChange={(e) =>
                      setNewStore({
                        ...newStore,
                        email: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="input-group">
                  <label>Address</label>

                  <input
                    value={newStore.address}
                    onChange={(e) =>
                      setNewStore({
                        ...newStore,
                        address: e.target.value,
                      })
                    }
                    maxLength={400}
                    required
                  />
                </div>

                <div className="input-group">
                  <label>Owner ID</label>

                  <input
                    value={newStore.owner_id}
                    onChange={(e) =>
                      setNewStore({
                        ...newStore,
                        owner_id: e.target.value,
                      })
                    }
                    placeholder="Optional"
                  />
                </div>

                <button
                  type="submit"
                  className="submit-rating"
                >
                  Add Store
                </button>
              </form>
            </div>
          </div>
        )}

        {showUserDetails && selectedUser && (
          <div className="modal-overlay">
            <div className="details-modal">
              <button
                className="close-button"
                onClick={() =>
                  setShowUserDetails(false)
                }
              >
                ×
              </button>

              <div className="modal-icon">
                👤
              </div>

              <h2>
                {selectedUser.name}
              </h2>

              <p>
                <strong>Email:</strong>{" "}
                {selectedUser.email}
              </p>

              <p>
                <strong>Address:</strong>{" "}
                {selectedUser.address}
              </p>

              <p>
                <strong>Role:</strong>{" "}
                {selectedUser.role}
              </p>

              {selectedUser.role === "OWNER" && (
                <div className="overall-rating-large">
                  <span>★</span>

                  <strong>
                    {Number(
                      selectedUser.average_rating ||
                        selectedUser.rating ||
                        0
                    ).toFixed(1)}
                  </strong>

                  <small>
                    Store Owner Rating
                  </small>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (user.role === "OWNER") {
    const ownerStore =
      ownerDashboard?.store || null;

    const ownerRatings =
      ownerDashboard?.ratings || [];

    return (
      <div className="dashboard">
        <div className="navbar">
          <div className="navbar-logo">
            Store <span>Rating</span>
          </div>

          <div className="navbar-right">
            <span>
              {user.name || "Store Owner"}
            </span>

            <button
              className="details-button"
              onClick={() =>
                setShowChangePassword(true)
              }
            >
              Change Password
            </button>

            <button
              className="logout-button"
              onClick={logout}
            >
              Logout
            </button>
          </div>
        </div>

        <div className="dashboard-content">
          {message && (
            <div className="toast">
              {message}
            </div>
          )}

          {error && (
            <div className="toast toast-error">
              {error}
            </div>
          )}

          <div className="welcome-section">
            <h1>Owner Dashboard</h1>

            <p>
              View your store rating and customers
              who submitted ratings.
            </p>
          </div>

          {ownerStore && (
            <>
              <div className="store-card">
                <div className="store-icon">
                  🏪
                </div>

                <div className="store-info">
                  <h3>
                    {ownerStore.name}
                  </h3>

                  <p className="store-email">
                    {ownerStore.email}
                  </p>

                  <p className="store-address">
                    {ownerStore.address}
                  </p>

                  <div className="rating-display">
                    <span className="star">
                      ★
                    </span>

                    <strong>
                      {Number(
                        ownerStore.average_rating || 0
                      ).toFixed(1)}
                    </strong>

                    <span>
                      {ownerStore.total_ratings || 0}{" "}
                      ratings
                    </span>
                  </div>
                </div>
              </div>

              <div className="section-heading">
                <h2>
                  Users Who Submitted Ratings
                </h2>

                <span>
                  {ownerRatings.length} users
                </span>
              </div>

              <div className="customer-ratings">
                {ownerRatings.length === 0 ? (
                  <div className="no-ratings">
                    No ratings submitted yet.
                  </div>
                ) : (
                  ownerRatings.map((rating) => (
                    <div
                      className="customer-rating"
                      key={rating.rating_id}
                    >
                      <div className="customer-info">
                        <div className="customer-avatar">
                          {(rating.name || "U")
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div>
                          <strong>
                            {rating.name}
                          </strong>

                          <small>
                            {rating.email}
                          </small>
                        </div>
                      </div>

                      <span className="customer-stars">
                        {"★".repeat(
                          Number(rating.rating || 0)
                        )}
                        {"☆".repeat(
                          5 -
                            Number(
                              rating.rating || 0
                            )
                        )}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>

        {showChangePassword && (
          <div className="modal-overlay">
            <div className="rating-modal">
              <button
                className="close-button"
                onClick={() =>
                  setShowChangePassword(false)
                }
              >
                ×
              </button>

              <div className="modal-icon">
                🔐
              </div>

              <h2>Change Password</h2>

              <p>
                Update your account password.
              </p>

              <form onSubmit={changePassword}>
                <div className="input-group">
                  <label>
                    Current Password
                  </label>

                  <input
                    type="password"
                    value={
                      passwordData.oldPassword
                    }
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        oldPassword:
                          e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="input-group">
                  <label>
                    New Password
                  </label>

                  <input
                    type="password"
                    value={
                      passwordData.newPassword
                    }
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        newPassword:
                          e.target.value,
                      })
                    }
                    placeholder="8-16 chars, uppercase + special"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="submit-rating"
                >
                  Change Password
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="navbar">
        <div className="navbar-logo">
          Store <span>Rating</span>
        </div>

        <div className="navbar-right">
          <span>
            {user.name || user.email}
          </span>

          <button
            className="logout-button"
            onClick={logout}
          >
            Logout
          </button>
        </div>
      </div>

      <div className="dashboard-content">
        {message && (
          <div className="toast">
            {message}
          </div>
        )}

        {error && (
          <div className="toast toast-error">
            {error}
          </div>
        )}

        <div className="welcome-section">
          <h1>
            Discover Great Stores
          </h1>

          <p>
            Find stores and share your experience.
          </p>
        </div>

        <form
          className="search-section"
          onSubmit={handleSearch}
        >
          <div className="search-input-wrapper">
            <span>⌕</span>

            <input
              type="text"
              placeholder="Search stores by name, email or address..."
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(e.target.value)
              }
            />
          </div>

          <button
            type="submit"
            className="search-button"
          >
            Search
          </button>
        </form>

        <div className="filter-section">
          <span className="filter-title">
            Filter
          </span>

          <div className="filter-buttons">
            <button
              type="button"
              className={`filter-button ${
                filter === "all"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setFilter("all")
              }
            >
              All
            </button>

            <button
              type="button"
              className={`filter-button ${
                filter === "rated"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setFilter("rated")
              }
            >
              Rated
            </button>

            <button
              type="button"
              className={`filter-button ${
                filter === "unrated"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setFilter("unrated")
              }
            >
              Not Rated
            </button>
          </div>
        </div>

        <div className="section-heading">
          <h2>
            Stores
          </h2>

          <span>
            {filteredStores.length} stores
          </span>
        </div>

        {loading ? (
          <div className="loading">
            Loading stores...
          </div>
        ) : filteredStores.length === 0 ? (
          <div className="no-stores">
            <h3>
              No stores found
            </h3>

            <p>
              Try another name, email or address.
            </p>
          </div>
        ) : (
          <div className="store-grid">
            {filteredStores.map((store) => {
              const averageRating = Number(
                store.average_rating || 0
              );

              const myRating =
                myRatings[store.id];

              return (
                <div
                  className="store-card"
                  key={store.id}
                >
                  <div className="store-icon">
                    🏪
                  </div>

                  <div className="store-info">
                    <h3>
                      {store.name}
                    </h3>

                    <p className="store-address">
                      {store.address}
                    </p>

                    <p className="store-email">
                      {store.email}
                    </p>

                    <div className="rating-display">
                      <span className="star">
                        ★
                      </span>

                      <strong>
                        {averageRating.toFixed(1)}
                      </strong>

                      <span>
                        {store.total_ratings ||
                          store.rating_count ||
                          0}{" "}
                        ratings
                      </span>
                    </div>

                    {myRating && (
                      <div className="my-rating">
                        <span>
                          Your rating:
                        </span>

                        <strong>
                          {myRating}/5
                        </strong>

                        <span className="my-stars customer-stars">
                          {"★".repeat(
                            Number(myRating)
                          )}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="card-buttons">
                    <button
                      type="button"
                      className="details-button"
                      onClick={() =>
                        openStoreDetails(store)
                      }
                    >
                      View Details
                    </button>

                    <button
                      type="button"
                      className="rate-button"
                      onClick={() =>
                        openRating(store)
                      }
                    >
                      {myRating
                        ? "Update Rating"
                        : "Add Rating"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showRating && selectedStore && (
        <div className="modal-overlay">
          <div className="rating-modal">
            <button
              className="close-button"
              onClick={() =>
                setShowRating(false)
              }
            >
              ×
            </button>

            <div className="modal-icon">
              ⭐
            </div>

            <h2>
              {myRatings[selectedStore.id]
                ? "Update Your Rating"
                : "Rate This Store"}
            </h2>

            <p>
              {selectedStore.name}
            </p>

            <div className="stars">
              {[1, 2, 3, 4, 5].map(
                (star) => (
                  <button
                    type="button"
                    key={star}
                    className={`star ${
                      star <= ratingValue
                        ? "selected"
                        : ""
                    }`}
                    onClick={() =>
                      setRatingValue(star)
                    }
                  >
                    ★
                  </button>
                )
              )}
            </div>

            <div className="rating-text">
              {ratingValue === 1 &&
                "Poor"}

              {ratingValue === 2 &&
                "Fair"}

              {ratingValue === 3 &&
                "Good"}

              {ratingValue === 4 &&
                "Very Good"}

              {ratingValue === 5 &&
                "Excellent"}
            </div>

            <button
              type="button"
              className="submit-rating"
              onClick={submitRating}
            >
              {myRatings[selectedStore.id]
                ? "Update Rating"
                : "Submit Rating"}
            </button>
          </div>
        </div>
      )}

      {showDetails && selectedStore && (
        <div className="modal-overlay">
          <div className="details-modal">
            <button
              className="close-button"
              onClick={() =>
                setShowDetails(false)
              }
            >
              ×
            </button>

            <div className="modal-icon">
              🏪
            </div>

            <h2 className="store-name">
              {selectedStore.name}
            </h2>

            <p className="detail-address">
              📍 {selectedStore.address}
            </p>

            <p className="detail-email">
              ✉ {selectedStore.email}
            </p>

            <div className="overall-rating-large">
              <span>★</span>

              <strong>
                {Number(
                  selectedStore.average_rating || 0
                ).toFixed(1)}
              </strong>

              <small>
                {selectedStore.total_ratings ||
                  selectedStore.rating_count ||
                  0}{" "}
                ratings
              </small>
            </div>

            <hr />

            <h3>
              Customer Ratings
            </h3>

            <div className="customer-ratings">
              {selectedStore.ratings &&
              selectedStore.ratings.length > 0 ? (
                selectedStore.ratings.map(
                  (rating, index) => (
                    <div
                      className="customer-rating"
                      key={
                        rating.rating_id ||
                        rating.id ||
                        index
                      }
                    >
                      <div className="customer-info">
                        <div className="customer-avatar">
                          {(
                            rating.name || "U"
                          )
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div>
                          <strong>
                            {rating.name ||
                              "Customer"}
                          </strong>

                          <small>
                            {rating.email || ""}
                          </small>
                        </div>
                      </div>

                      <span className="customer-stars">
                        {"★".repeat(
                          Number(
                            rating.rating || 0
                          )
                        )}
                        {"☆".repeat(
                          5 -
                            Number(
                              rating.rating || 0
                            )
                        )}
                      </span>
                    </div>
                  )
                )
              ) : (
                <div className="no-ratings">
                  No customer ratings available.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;