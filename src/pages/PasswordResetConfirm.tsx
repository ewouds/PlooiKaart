import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import client from "../api/client";

export default function PasswordResetConfirm() {
  const [searchParams] = useSearchParams();
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const token = searchParams.get("token");
  const userId = searchParams.get("id");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await client.post("/auth/password-reset/confirm", {
        userId,
        token,
        newPassword,
      });
      setMessage("Password updated successfully. You can now login.");
      setTimeout(() => navigate("/login"), 3000);
    } catch (err: any) {
      setMessage(err.response?.data?.message || "Failed to reset password");
    }
  };

  if (!token || !userId) {
    return <p>Invalid reset link.</p>;
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Set New Password</h1>
      {message && <p>{message}</p>}
      <form onSubmit={handleSubmit}>
        <input type='password' value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder='New Password' required />
        <button type='submit'>Reset Password</button>
      </form>
      <p>
        <Link to='/login'>Back to Login</Link>
      </p>
    </div>
  );
}
