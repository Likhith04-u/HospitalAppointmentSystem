
import { useEffect, useState } from "react";
import "./App.css";

const API = "http://localhost:5000/api";

function App() {
  const [section, setSection] = useState("Dashboard");
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const [token, setToken] = useState(
    () => localStorage.getItem("hospitalAdminToken") || ""
  );

  const [loginForm, setLoginForm] = useState({
    email: "admin@hospital.com",
    password: "",
  });

  const [loginError, setLoginError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  const [appointmentSearch, setAppointmentSearch] = useState("");
  const [appointmentStatusFilter, setAppointmentStatusFilter] =
    useState("All");
  const [appointmentFromDate, setAppointmentFromDate] = useState("");
  const [appointmentToDate, setAppointmentToDate] = useState("");

  const [patientForm, setPatientForm] = useState({
    name: "",
    age: "",
    gender: "Male",
    phone: "",
    email: "",
    address: "",
  });

  const [doctorForm, setDoctorForm] = useState({
    name: "",
    specialization: "",
    phone: "",
    email: "",
    consultationFee: "0",
  });

  const [appointmentForm, setAppointmentForm] = useState({
    patient: "",
    doctor: "",
    appointmentDate: "",
    appointmentTime: "",
    reason: "",
  });

  // API request helper
  async function request(path, options = {}) {
    const response = await fetch(`${API}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Request failed");
    }

    return data;
  }

  // Admin login
  async function handleLogin(event) {
    event.preventDefault();
    setLoginError("");
    setLoggingIn(true);

    try {
      const response = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginForm),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      if (!data.token) {
        throw new Error("The server did not return a login token.");
      }

      localStorage.setItem("hospitalAdminToken", data.token);
      setToken(data.token);
      setLoginForm((previous) => ({
        ...previous,
        password: "",
      }));
      setSection("Dashboard");
    } catch (error) {
      setLoginError(error.message || "Could not log in.");
    } finally {
      setLoggingIn(false);
    }
  }

  // Admin logout
  function handleLogout() {
    localStorage.removeItem("hospitalAdminToken");
    setToken("");
    setPatients([]);
    setDoctors([]);
    setAppointments([]);
    setMessage("");
    setLoginError("");
    setSection("Dashboard");
    setLoading(false);
  }

  // Load hospital data
  async function loadData() {
    if (!token) return;

    setLoading(true);

    try {
      const [patientData, doctorData, appointmentData] =
        await Promise.all([
          request("/patients"),
          request("/doctors"),
          request("/appointments"),
        ]);

      setPatients(patientData);
      setDoctors(doctorData);
      setAppointments(appointmentData);
      setMessage("");
    } catch (error) {
      setMessage(`Could not load data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (token) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [token]);

  // Add patient
  async function submitPatient(event) {
    event.preventDefault();

    try {
      await request("/patients", {
        method: "POST",
        body: JSON.stringify({
          ...patientForm,
          age: Number(patientForm.age),
        }),
      });

      setPatientForm({
        name: "",
        age: "",
        gender: "Male",
        phone: "",
        email: "",
        address: "",
      });

      setMessage("Patient added successfully.");
      await loadData();
    } catch (error) {
      setMessage(`Could not add patient: ${error.message}`);
    }
  }

  // Add doctor
  async function submitDoctor(event) {
    event.preventDefault();

    try {
      await request("/doctors", {
        method: "POST",
        body: JSON.stringify({
          ...doctorForm,
          consultationFee: Number(doctorForm.consultationFee),
        }),
      });

      setDoctorForm({
        name: "",
        specialization: "",
        phone: "",
        email: "",
        consultationFee: "0",
      });

      setMessage("Doctor added successfully.");
      await loadData();
    } catch (error) {
      setMessage(`Could not add doctor: ${error.message}`);
    }
  }

  // Book appointment
  async function submitAppointment(event) {
    event.preventDefault();

    try {
      await request("/appointments", {
        method: "POST",
        body: JSON.stringify(appointmentForm),
      });

      setAppointmentForm({
        patient: "",
        doctor: "",
        appointmentDate: "",
        appointmentTime: "",
        reason: "",
      });

      setMessage("Appointment booked successfully.");
      await loadData();
    } catch (error) {
      setMessage(`Could not book appointment: ${error.message}`);
    }
  }

  // Delete a record
  async function deleteRecord(type, id) {
    if (!window.confirm("Are you sure you want to delete this record?")) {
      return;
    }

    try {
      await request(`/${type}/${id}`, {
        method: "DELETE",
      });

      setMessage("Record deleted successfully.");
      await loadData();
    } catch (error) {
      setMessage(`Could not delete record: ${error.message}`);
    }
  }

  // Edit patient
  async function editPatient(patient) {
    const name = window.prompt("Patient name:", patient.name);

    if (name === null || !name.trim()) return;

    const phone = window.prompt("Patient phone:", patient.phone);

    if (phone === null || !phone.trim()) return;

    try {
      await request(`/patients/${patient._id}`, {
        method: "PUT",
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
        }),
      });

      setMessage("Patient updated successfully.");
      await loadData();
    } catch (error) {
      setMessage(`Could not update patient: ${error.message}`);
    }
  }

  // Edit doctor
  async function editDoctor(doctor) {
    const name = window.prompt("Doctor name:", doctor.name);

    if (name === null || !name.trim()) return;

    const specialization = window.prompt(
      "Specialization:",
      doctor.specialization
    );

    if (specialization === null || !specialization.trim()) return;

    const phone = window.prompt("Doctor phone:", doctor.phone);

    if (phone === null || !phone.trim()) return;

    try {
      await request(`/doctors/${doctor._id}`, {
        method: "PUT",
        body: JSON.stringify({
          name: name.trim(),
          specialization: specialization.trim(),
          phone: phone.trim(),
        }),
      });

      setMessage("Doctor updated successfully.");
      await loadData();
    } catch (error) {
      setMessage(`Could not update doctor: ${error.message}`);
    }
  }

  // Update appointment status
  async function updateAppointmentStatus(id, status) {
    try {
      await request(`/appointments/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });

      setMessage("Appointment status updated.");
      await loadData();
    } catch (error) {
      setMessage(`Could not update status: ${error.message}`);
    }
  }

  // Search and filter appointments
  const filteredAppointments = appointments.filter((appointment) => {
    const search = appointmentSearch.trim().toLowerCase();

    const patientName = appointment.patient?.name || "";
    const doctorName = appointment.doctor?.name || "";
    const specialization = appointment.doctor?.specialization || "";
    const reason = appointment.reason || "";
    const status = appointment.status || "Scheduled";

    const matchesSearch =
      !search ||
      [
        patientName,
        doctorName,
        specialization,
        reason,
        status,
      ].some((value) =>
        String(value).toLowerCase().includes(search)
      );

    const date = appointment.appointmentDate
      ? String(appointment.appointmentDate).slice(0, 10)
      : "";

    const matchesStatus =
      appointmentStatusFilter === "All" ||
      status === appointmentStatusFilter;

    const matchesFrom =
      !appointmentFromDate || date >= appointmentFromDate;

    const matchesTo =
      !appointmentToDate || date <= appointmentToDate;

    return (
      matchesSearch &&
      matchesStatus &&
      matchesFrom &&
      matchesTo
    );
  });

  // Export appointments to CSV
  function exportAppointmentsCSV(rows = filteredAppointments) {
    const headers = [
      "Patient",
      "Doctor",
      "Specialization",
      "Date",
      "Time",
      "Status",
      "Reason",
    ];

    const escapeCSV = (value) =>
      `"${String(value ?? "").replace(/"/g, '""')}"`;

    const lines = [
      headers,
      ...rows.map((appointment) => [
        appointment.patient?.name || "Patient unavailable",
        appointment.doctor?.name || "Doctor unavailable",
        appointment.doctor?.specialization || "",
        appointment.appointmentDate
          ? new Date(
              appointment.appointmentDate
            ).toLocaleDateString()
          : "",
        appointment.appointmentTime || "",
        appointment.status || "Scheduled",
        appointment.reason || "",
      ]),
    ].map((row) => row.map(escapeCSV).join(","));

    const blob = new Blob(
      ["\uFEFF" + lines.join("\r\n")],
      { type: "text/csv;charset=utf-8;" }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "hospital-appointment-report.csv";

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  }

  // Report counts
  const reportCounts = {
    total: appointments.length,
    scheduled: appointments.filter(
      (a) => (a.status || "Scheduled") === "Scheduled"
    ).length,
    completed: appointments.filter(
      (a) => a.status === "Completed"
    ).length,
    cancelled: appointments.filter(
      (a) => a.status === "Cancelled"
    ).length,
  };

  const navItems = [
    { name: "Dashboard", icon: "⌂" },
    { name: "Patients", icon: "♙" },
    { name: "Doctors", icon: "⚕" },
    { name: "Appointments", icon: "▦" },
    { name: "Reports", icon: "▤" },
  ];

  // Login screen
  if (!token) {
    return (
      <div className="login-screen">
        <form className="login-card" onSubmit={handleLogin}>
          <div className="login-logo">✚</div>
          <p className="eyebrow">MEDICARE HOSPITAL</p>
          <h1>Admin Login</h1>

          <p className="login-description">
            Sign in to manage hospital patients, doctors and appointments.
          </p>

          {loginError && (
            <div className="message login-error" role="alert">
              {loginError}
            </div>
          )}

          <label className="field">
            <span>Admin email</span>
            <input
              type="email"
              required
              autoComplete="username"
              value={loginForm.email}
              onChange={(event) =>
                setLoginForm({
                  ...loginForm,
                  email: event.target.value,
                })
              }
              placeholder="Enter admin email"
            />
          </label>

          <label className="field">
            <span>Password</span>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={loginForm.password}
              onChange={(event) =>
                setLoginForm({
                  ...loginForm,
                  password: event.target.value,
                })
              }
              placeholder="Enter admin password"
            />
          </label>

          <button
            className="primary-button login-button"
            type="submit"
            disabled={loggingIn}
          >
            {loggingIn ? "Signing in..." : "Sign in"}
          </button>

          <p className="login-footer">
            Hospital Appointment Management System
          </p>
        </form>
      </div>
    );
  }

  // Main application
  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">✚</div>
          <div>
            <h2>MediCare</h2>
            <span>Hospital Management</span>
          </div>
        </div>

        <p className="nav-label">MAIN MENU</p>

        <nav>
          {navItems.map((item) => (
            <button
              key={item.name}
              className={`nav-item ${
                section === item.name ? "active" : ""
              }`}
              onClick={() => setSection(item.name)}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.name}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="status-dot" />
          Local database connected
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="eyebrow">HOSPITAL APPOINTMENT SYSTEM</p>
            <h1>{section}</h1>
          </div>

          <div className="topbar-actions">
            <button
              className="refresh-button"
              onClick={loadData}
            >
              ↻ Refresh data
            </button>

            <button
              className="logout-button"
              onClick={handleLogout}
            >
              Log out
            </button>
          </div>
        </header>

        {message && (
          <div className="message" role="status">
            <span>{message}</span>
            <button onClick={() => setMessage("")}>×</button>
          </div>
        )}

        {loading ? (
          <p className="loading">Loading hospital records...</p>
        ) : (
          <>
            {/* Dashboard */}
            {section === "Dashboard" && (
              <>
                <div className="welcome-panel">
                  <div>
                    <p className="eyebrow light">
                      WELCOME TO MEDICARE
                    </p>
                    <h2>Hospital overview</h2>
                    <p>
                      Manage patient records, doctors and appointments
                      from one place.
                    </p>
                  </div>

                  <div className="welcome-symbol">✚</div>
                </div>

                <div className="stats-grid">
                  <StatCard
                    icon="♙"
                    label="Total Patients"
                    value={patients.length}
                    color="blue"
                  />
                  <StatCard
                    icon="⚕"
                    label="Total Doctors"
                    value={doctors.length}
                    color="green"
                  />
                  <StatCard
                    icon="▦"
                    label="Appointments"
                    value={appointments.length}
                    color="purple"
                  />
                  <StatCard
                    icon="◷"
                    label="Scheduled"
                    value={reportCounts.scheduled}
                    color="orange"
                  />
                </div>

                <section className="report-summary-grid">
                  <div className="report-summary-card">
                    <span>Scheduled</span>
                    <strong>{reportCounts.scheduled}</strong>
                  </div>
                  <div className="report-summary-card">
                    <span>Completed</span>
                    <strong>{reportCounts.completed}</strong>
                  </div>
                  <div className="report-summary-card">
                    <span>Cancelled</span>
                    <strong>{reportCounts.cancelled}</strong>
                  </div>
                </section>

                <section className="panel">
                  <div className="panel-heading">
                    <div>
                      <h2>Recent appointments</h2>
                      <p>Latest records from your database</p>
                    </div>

                    <button
                      className="text-button"
                      onClick={() => setSection("Appointments")}
                    >
                      View all →
                    </button>
                  </div>

                  <AppointmentTable
                    appointments={appointments.slice(0, 5)}
                    onStatusChange={updateAppointmentStatus}
                    onDelete={(id) =>
                      deleteRecord("appointments", id)
                    }
                  />
                </section>
              </>
            )}

            {/* Patients */}
            {section === "Patients" && (
              <div className="content-grid">
                <section className="panel form-panel">
                  <h2>Add patient</h2>
                  <p className="panel-description">
                    Enter the patient's details below.
                  </p>

                  <form onSubmit={submitPatient}>
                    <Field label="Full name">
                      <input
                        required
                        value={patientForm.name}
                        onChange={(e) =>
                          setPatientForm({
                            ...patientForm,
                            name: e.target.value,
                          })
                        }
                        placeholder="Patient name"
                      />
                    </Field>

                    <div className="form-row">
                      <Field label="Age">
                        <input
                          required
                          type="number"
                          min="0"
                          max="130"
                          value={patientForm.age}
                          onChange={(e) =>
                            setPatientForm({
                              ...patientForm,
                              age: e.target.value,
                            })
                          }
                          placeholder="Age"
                        />
                      </Field>

                      <Field label="Gender">
                        <select
                          value={patientForm.gender}
                          onChange={(e) =>
                            setPatientForm({
                              ...patientForm,
                              gender: e.target.value,
                            })
                          }
                        >
                          <option>Male</option>
                          <option>Female</option>
                          <option>Other</option>
                        </select>
                      </Field>
                    </div>

                    <Field label="Phone">
                      <input
                        required
                        value={patientForm.phone}
                        onChange={(e) =>
                          setPatientForm({
                            ...patientForm,
                            phone: e.target.value,
                          })
                        }
                        placeholder="Phone number"
                      />
                    </Field>

                    <Field label="Email">
                      <input
                        type="email"
                        value={patientForm.email}
                        onChange={(e) =>
                          setPatientForm({
                            ...patientForm,
                            email: e.target.value,
                          })
                        }
                        placeholder="patient@example.com"
                      />
                    </Field>

                    <Field label="Address">
                      <textarea
                        value={patientForm.address}
                        onChange={(e) =>
                          setPatientForm({
                            ...patientForm,
                            address: e.target.value,
                          })
                        }
                        placeholder="Patient address"
                        rows="2"
                      />
                    </Field>

                    <button className="primary-button" type="submit">
                      + Add patient
                    </button>
                  </form>
                </section>

                <section className="panel">
                  <div className="panel-heading">
                    <div>
                      <h2>Patient records</h2>
                      <p>{patients.length} patient(s) registered</p>
                    </div>
                  </div>

                  {patients.length === 0 ? (
                    <EmptyState text="No patients registered yet." />
                  ) : (
                    <div className="record-list">
                      {patients.map((patient) => (
                        <div className="record-card" key={patient._id}>
                          <div className="avatar blue-avatar">
                            {patient.name?.charAt(0).toUpperCase()}
                          </div>

                          <div className="record-info">
                            <strong>{patient.name}</strong>
                            <span>
                              Age {patient.age} · {patient.gender}
                            </span>
                            <span>{patient.phone}</span>
                            {patient.email && (
                              <span>{patient.email}</span>
                            )}
                          </div>

                          <div className="record-actions">
                            <button
                              className="edit-button"
                              onClick={() => editPatient(patient)}
                            >
                              Edit
                            </button>
                            <button
                              className="delete-button"
                              onClick={() =>
                                deleteRecord("patients", patient._id)
                              }
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </div>
            )}

            {/* Doctors */}
            {section === "Doctors" && (
              <div className="content-grid">
                <section className="panel form-panel">
                  <h2>Add doctor</h2>
                  <p className="panel-description">
                    Register a doctor in your hospital.
                  </p>

                  <form onSubmit={submitDoctor}>
                    <Field label="Doctor name">
                      <input
                        required
                        value={doctorForm.name}
                        onChange={(e) =>
                          setDoctorForm({
                            ...doctorForm,
                            name: e.target.value,
                          })
                        }
                        placeholder="Dr. name"
                      />
                    </Field>

                    <Field label="Specialization">
                      <input
                        required
                        value={doctorForm.specialization}
                        onChange={(e) =>
                          setDoctorForm({
                            ...doctorForm,
                            specialization: e.target.value,
                          })
                        }
                        placeholder="e.g. Cardiology"
                      />
                    </Field>

                    <Field label="Phone">
                      <input
                        required
                        value={doctorForm.phone}
                        onChange={(e) =>
                          setDoctorForm({
                            ...doctorForm,
                            phone: e.target.value,
                          })
                        }
                        placeholder="Phone number"
                      />
                    </Field>

                    <Field label="Email">
                      <input
                        type="email"
                        value={doctorForm.email}
                        onChange={(e) =>
                          setDoctorForm({
                            ...doctorForm,
                            email: e.target.value,
                          })
                        }
                        placeholder="doctor@example.com"
                      />
                    </Field>

                    <Field label="Consultation fee (₹)">
                      <input
                        type="number"
                        min="0"
                        value={doctorForm.consultationFee}
                        onChange={(e) =>
                          setDoctorForm({
                            ...doctorForm,
                            consultationFee: e.target.value,
                          })
                        }
                      />
                    </Field>

                    <button className="primary-button" type="submit">
                      + Add doctor
                    </button>
                  </form>
                </section>

                <section className="panel">
                  <div className="panel-heading">
                    <div>
                      <h2>Doctor directory</h2>
                      <p>{doctors.length} doctor(s) registered</p>
                    </div>
                  </div>

                  {doctors.length === 0 ? (
                    <EmptyState text="No doctors registered yet." />
                  ) : (
                    <div className="record-list">
                      {doctors.map((doctor) => (
                        <div className="record-card" key={doctor._id}>
                          <div className="avatar green-avatar">⚕</div>

                          <div className="record-info">
                            <strong>{doctor.name}</strong>
                            <span>{doctor.specialization}</span>
                            <span>{doctor.phone}</span>
                            {doctor.email && <span>{doctor.email}</span>}
                            <span>
                              Fee: ₹{doctor.consultationFee ?? 0}
                            </span>
                          </div>

                          <div className="record-actions">
                            <button
                              className="edit-button"
                              onClick={() => editDoctor(doctor)}
                            >
                              Edit
                            </button>
                            <button
                              className="delete-button"
                              onClick={() =>
                                deleteRecord("doctors", doctor._id)
                              }
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </div>
            )}

            {/* Appointments */}
            {section === "Appointments" && (
              <>
                <section className="panel form-panel appointment-form-panel">
                  <h2>Book an appointment</h2>
                  <p className="panel-description">
                    Select a registered patient and doctor.
                  </p>

                  {patients.length === 0 || doctors.length === 0 ? (
                    <p className="notice">
                      First register at least one patient and one doctor.
                    </p>
                  ) : (
                    <form onSubmit={submitAppointment}>
                      <div className="form-row">
                        <Field label="Patient">
                          <select
                            required
                            value={appointmentForm.patient}
                            onChange={(e) =>
                              setAppointmentForm({
                                ...appointmentForm,
                                patient: e.target.value,
                              })
                            }
                          >
                            <option value="">Select patient</option>
                            {patients.map((p) => (
                              <option key={p._id} value={p._id}>
                                {p.name}
                              </option>
                            ))}
                          </select>
                        </Field>

                        <Field label="Doctor">
                          <select
                            required
                            value={appointmentForm.doctor}
                            onChange={(e) =>
                              setAppointmentForm({
                                ...appointmentForm,
                                doctor: e.target.value,
                              })
                            }
                          >
                            <option value="">Select doctor</option>
                            {doctors.map((d) => (
                              <option key={d._id} value={d._id}>
                                {d.name} — {d.specialization}
                              </option>
                            ))}
                          </select>
                        </Field>
                      </div>

                      <div className="form-row">
                        <Field label="Appointment date">
                          <input
                            required
                            type="date"
                            min={new Date().toLocaleDateString("en-CA")}
                            value={appointmentForm.appointmentDate}
                            onChange={(e) =>
                              setAppointmentForm({
                                ...appointmentForm,
                                appointmentDate: e.target.value,
                              })
                            }
                          />
                        </Field>

                        <Field label="Appointment time">
                          <input
                            required
                            type="time"
                            value={appointmentForm.appointmentTime}
                            onChange={(e) =>
                              setAppointmentForm({
                                ...appointmentForm,
                                appointmentTime: e.target.value,
                              })
                            }
                          />
                        </Field>
                      </div>

                      <Field label="Reason for visit">
                        <textarea
                          rows="2"
                          value={appointmentForm.reason}
                          onChange={(e) =>
                            setAppointmentForm({
                              ...appointmentForm,
                              reason: e.target.value,
                            })
                          }
                          placeholder="Brief reason for appointment"
                        />
                      </Field>

                      <button className="primary-button" type="submit">
                        + Book appointment
                      </button>
                    </form>
                  )}
                </section>

                <section className="panel">
                  <div className="panel-heading">
                    <div>
                      <h2>Appointment records</h2>
                      <p>
                        {filteredAppointments.length} shown ·{" "}
                        {appointments.length} total appointment(s)
                      </p>
                    </div>

                    <button
                      className="text-button"
                      onClick={() => exportAppointmentsCSV()}
                    >
                      Export CSV ↓
                    </button>
                  </div>

                  <AppointmentFilters
                    search={appointmentSearch}
                    setSearch={setAppointmentSearch}
                    status={appointmentStatusFilter}
                    setStatus={setAppointmentStatusFilter}
                    fromDate={appointmentFromDate}
                    setFromDate={setAppointmentFromDate}
                    toDate={appointmentToDate}
                    setToDate={setAppointmentToDate}
                  />

                  <AppointmentTable
                    appointments={filteredAppointments}
                    onStatusChange={updateAppointmentStatus}
                    onDelete={(id) =>
                      deleteRecord("appointments", id)
                    }
                  />
                </section>
              </>
            )}

            {/* Reports */}
            {section === "Reports" && (
              <>
                <div className="welcome-panel reports-welcome">
                  <div>
                    <p className="eyebrow light">REPORTING CENTER</p>
                    <h2>Appointment reports</h2>
                    <p>
                      Review appointment status totals or export your
                      appointment list as a CSV file.
                    </p>
                  </div>

                  <button
                    className="report-export-button"
                    onClick={() => exportAppointmentsCSV(appointments)}
                  >
                    Export all appointments ↓
                  </button>
                </div>

                <div className="stats-grid report-stats">
                  <StatCard
                    icon="▦"
                    label="Total Appointments"
                    value={reportCounts.total}
                    color="blue"
                  />
                  <StatCard
                    icon="◷"
                    label="Scheduled"
                    value={reportCounts.scheduled}
                    color="orange"
                  />
                  <StatCard
                    icon="✓"
                    label="Completed"
                    value={reportCounts.completed}
                    color="green"
                  />
                  <StatCard
                    icon="×"
                    label="Cancelled"
                    value={reportCounts.cancelled}
                    color="purple"
                  />
                </div>

                <section className="panel">
                  <div className="panel-heading">
                    <div>
                      <h2>Appointment report</h2>
                      <p>Filter records before exporting.</p>
                    </div>

                    <button
                      className="text-button"
                      onClick={() => exportAppointmentsCSV()}
                    >
                      Export filtered CSV ↓
                    </button>
                  </div>

                  <AppointmentFilters
                    search={appointmentSearch}
                    setSearch={setAppointmentSearch}
                    status={appointmentStatusFilter}
                    setStatus={setAppointmentStatusFilter}
                    fromDate={appointmentFromDate}
                    setFromDate={setAppointmentFromDate}
                    toDate={appointmentToDate}
                    setToDate={setAppointmentToDate}
                  />

                  <p className="report-result-count">
                    Showing {filteredAppointments.length} of{" "}
                    {appointments.length} appointments.
                  </p>

                  <AppointmentTable
                    appointments={filteredAppointments}
                    onStatusChange={updateAppointmentStatus}
                    onDelete={(id) =>
                      deleteRecord("appointments", id)
                    }
                  />
                </section>
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function AppointmentFilters({
  search,
  setSearch,
  status,
  setStatus,
  fromDate,
  setFromDate,
  toDate,
  setToDate,
}) {
  return (
    <div className="appointment-filters">
      <label className="filter-search">
        <span>Search</span>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Patient, doctor, specialty, reason..."
        />
      </label>

      <label>
        <span>Status</span>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option>All</option>
          <option>Scheduled</option>
          <option>Completed</option>
          <option>Cancelled</option>
        </select>
      </label>

      <label>
        <span>From date</span>
        <input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
        />
      </label>

      <label>
        <span>To date</span>
        <input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
        />
      </label>

      <button
        className="secondary-button"
        onClick={() => {
          setSearch("");
          setStatus("All");
          setFromDate("");
          setToDate("");
        }}
      >
        Clear filters
      </button>
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${color}`}>{icon}</div>
      <div>
        <p>{label}</p>
        <h2>{value}</h2>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}

function EmptyState({ text }) {
  return <div className="empty-state">{text}</div>;
}

function AppointmentTable({
  appointments,
  onStatusChange,
  onDelete,
}) {
  if (appointments.length === 0) {
    return <EmptyState text="No appointments found." />;
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Patient</th>
            <th>Doctor</th>
            <th>Date &amp; time</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {appointments.map((appointment) => (
            <tr key={appointment._id}>
              <td>
                {appointment.patient?.name || "Patient unavailable"}
              </td>

              <td>
                {appointment.doctor?.name || "Doctor unavailable"}
                {appointment.doctor?.specialization && (
                  <span className="table-subtext">
                    {appointment.doctor.specialization}
                  </span>
                )}
              </td>

              <td>
                {appointment.appointmentDate
                  ? new Date(
                      appointment.appointmentDate
                    ).toLocaleDateString()
                  : "—"}

                <span className="table-subtext">
                  {appointment.appointmentTime || ""}
                </span>
              </td>

              <td>
                <span
                  className={`status status-${(
                    appointment.status || "Scheduled"
                  ).toLowerCase()}`}
                >
                  {appointment.status || "Scheduled"}
                </span>
              </td>

              <td>
                <div className="table-actions">
                  <select
                    aria-label="Appointment status"
                    value={appointment.status || "Scheduled"}
                    onChange={(e) =>
                      onStatusChange(
                        appointment._id,
                        e.target.value
                      )
                    }
                  >
                    <option>Scheduled</option>
                    <option>Completed</option>
                    <option>Cancelled</option>
                  </select>

                  <button
                    className="delete-button"
                    onClick={() => onDelete(appointment._id)}
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
  );
}

export default App;
