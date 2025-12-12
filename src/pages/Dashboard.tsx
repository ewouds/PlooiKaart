import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";

interface ScoreUser {
  _id: string;
  displayName: string;
  score: number;
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [scores, setScores] = useState<ScoreUser[]>([]);

  useEffect(() => {
    client.get("/users/scores").then((res) => setScores(res.data));
  }, []);

  const myScore = scores.find((s) => s._id === user?._id)?.score;

  return (
    <div style={{ padding: "2rem" }}>
      <header style={{ display: "flex", justifyContent: "space-between" }}>
        <h1>PlooiKaart Dashboard</h1>
        <div>
          <span>Welcome, {user?.displayName} </span>
          <button onClick={logout}>Logout</button>
        </div>
      </header>

      <section style={{ margin: "2rem 0", padding: "1rem", border: "1px solid #ccc" }}>
        <h2>My Score: {myScore !== undefined ? myScore : "..."} plooikaarten</h2>
        <p>1 point = 1 plooikaart</p>
      </section>

      <nav>
        <Link to='/meetings/new'>Register Meeting</Link> | <Link to='/audit'>Audit Trail</Link> | <Link to='/reglement'>Reglement</Link>
      </nav>

      <section style={{ marginTop: "2rem" }}>
        <h3>Leaderboard</h3>
        <table border={1} cellPadding={5} style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>User</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody>
            {scores.map((s) => (
              <tr key={s._id} style={{ fontWeight: s._id === user?._id ? "bold" : "normal" }}>
                <td>{s.displayName}</td>
                <td>{s.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
