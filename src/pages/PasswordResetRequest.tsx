import React, { useState } from "react";
import { Link } from "react-router-dom";
import client from "../api/client";

export default function PasswordResetRequest() {
  const [identifier, setIdentifier] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await client.post("/auth/password-reset/request", { identifier });
      setMessage(res.data.message);
    } catch (err) {
      setMessage("Something went wrong. Please try again.");
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Reset Password</h1>
      {message ? (
        <p>{message}</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <p>Enter your username or email to receive a reset link.</p>
          <input value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder='Username or Email' required />
          <button type='submit'>Send Reset Link</button>
        </form>
      )}
      <p>
        <Link to='/login'>Back to Login</Link>
      </p>
    </div>
  );
}
