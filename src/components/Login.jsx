 import { useState } from "react";

export default function Login({ onLogin }) {
  const [name, setName] = useState("");
  const [hostel, setHostel] = useState("");
  const [contact, setContact] = useState("");

  const allowedHostels = [
    "nivedita",
    "lt williams",
    "pandeya",
    "h-10",
    "h-11",
    "h-14"
  ];

  const login = () => {
    if (!name || !hostel || !contact) {
      alert("All fields are required!");
      return;
    }

    if (!allowedHostels.includes(hostel.trim().toLowerCase())) {
      alert("Login allowed only for approved hostels!");
      return;
    }

    if (!/^[0-9]{10}$/.test(contact)) {
      alert("Enter a valid 10-digit contact number");
      return;
    }

    const user = {
      name,
      hostel,
      contact
    };

    localStorage.setItem("user", JSON.stringify(user));
    onLogin(user);
  };

  return (
    <div className="login-box">
      <div className="login-card">
        <h2>hare-It 🏠</h2>
        <p>Hostel Students Only</p>

        <input
          placeholder="Student Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          placeholder="Hostel Name (e.g. H-10)"
          value={hostel}
          onChange={(e) => setHostel(e.target.value)}
        />

        <input
          placeholder="Contact Number"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
        />

        <button onClick={login}>Login</button>
      </div>
    </div>
  );
}
