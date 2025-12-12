import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import client from "../api/client";

interface User {
  _id: string;
  displayName: string;
}

interface TopUp {
  userId: string;
  amount: number;
  comment: string;
}

export default function MeetingForm() {
  const [users, setUsers] = useState<User[]>([]);
  const [date, setDate] = useState("");
  const [presentIds, setPresentIds] = useState<string[]>([]);
  const [excusedIds, setExcusedIds] = useState<string[]>([]);
  const [topUps, setTopUps] = useState<TopUp[]>([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    client.get("/users/scores").then((res) => setUsers(res.data));
  }, []);

  const handleCheckbox = (id: string, list: string[], setList: (l: string[]) => void) => {
    if (list.includes(id)) {
      setList(list.filter((x) => x !== id));
    } else {
      setList([...list, id]);
    }
  };

  const addTopUp = () => {
    if (users.length > 0) {
      setTopUps([...topUps, { userId: users[0]._id, amount: 5, comment: "" }]);
    }
  };

  const updateTopUp = (index: number, field: keyof TopUp, value: any) => {
    const newTopUps = [...topUps];
    newTopUps[index] = { ...newTopUps[index], [field]: value };
    setTopUps(newTopUps);
  };

  const removeTopUp = (index: number) => {
    setTopUps(topUps.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Client-side validation
    const d = new Date(date);
    if (d.getDay() !== 4) {
      setError("Meeting date must be a Thursday");
      return;
    }

    const presentSet = new Set(presentIds);
    for (const id of excusedIds) {
      if (presentSet.has(id)) {
        setError("A user cannot be both present and excused");
        return;
      }
    }

    for (const t of topUps) {
      if (t.amount <= 0 || t.amount % 5 !== 0) {
        setError("Top-up amount must be a positive multiple of 5");
        return;
      }
    }

    try {
      await client.post("/meetings", {
        date,
        presentUserIds: presentIds,
        excusedUserIds: excusedIds,
        topUps,
      });
      navigate("/");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to submit meeting");
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Register Meeting</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "1rem" }}>
          <label>Date (Thursday): </label>
          <input type='date' value={date} onChange={(e) => setDate(e.target.value)} required />
        </div>

        <div style={{ display: "flex", gap: "2rem", marginBottom: "1rem" }}>
          <div>
            <h3>Present</h3>
            {users.map((u) => (
              <div key={`p-${u._id}`}>
                <label>
                  <input
                    type='checkbox'
                    checked={presentIds.includes(u._id)}
                    onChange={() => handleCheckbox(u._id, presentIds, setPresentIds)}
                    disabled={excusedIds.includes(u._id)}
                  />
                  {u.displayName}
                </label>
              </div>
            ))}
          </div>
          <div>
            <h3>Excused (Valid Reason)</h3>
            {users.map((u) => (
              <div key={`e-${u._id}`}>
                <label>
                  <input
                    type='checkbox'
                    checked={excusedIds.includes(u._id)}
                    onChange={() => handleCheckbox(u._id, excusedIds, setExcusedIds)}
                    disabled={presentIds.includes(u._id)}
                  />
                  {u.displayName}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <h3>Top-Ups (Buy Plooikaarten)</h3>
          {topUps.map((t, i) => (
            <div key={i} style={{ marginBottom: "0.5rem", display: "flex", gap: "0.5rem" }}>
              <select value={t.userId} onChange={(e) => updateTopUp(i, "userId", e.target.value)}>
                {users.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.displayName}
                  </option>
                ))}
              </select>
              <input type='number' value={t.amount} onChange={(e) => updateTopUp(i, "amount", parseInt(e.target.value))} step='5' min='5' />
              <input type='text' placeholder='Comment' value={t.comment} onChange={(e) => updateTopUp(i, "comment", e.target.value)} />
              <button type='button' onClick={() => removeTopUp(i)}>
                Remove
              </button>
            </div>
          ))}
          <button type='button' onClick={addTopUp}>
            Add Top-Up
          </button>
        </div>

        <button type='submit'>Submit Meeting</button>
      </form>
    </div>
  );
}
