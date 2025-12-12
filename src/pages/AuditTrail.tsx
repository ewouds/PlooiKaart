import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import client from "../api/client";

interface AuditEvent {
  _id: string;
  timestamp: string;
  actorUserId: { displayName: string; username: string };
  type: string;
  data: any;
}

export default function AuditTrail() {
  const [events, setEvents] = useState<AuditEvent[]>([]);

  useEffect(() => {
    client.get("/audit").then((res) => setEvents(res.data));
  }, []);

  const renderDetails = (event: AuditEvent) => {
    if (event.type === "MEETING_SUBMITTED") {
      const { meetingDate, penalizedUserIds, topUps } = event.data;
      return (
        <div>
          <p>Meeting Date: {meetingDate}</p>
          {penalizedUserIds && penalizedUserIds.length > 0 && (
            <p>Penalized Users (Absent/Unexcused): {penalizedUserIds.join(", ")}</p> // Ideally map IDs to names, but IDs are stored.
            // Wait, the backend stores IDs. I should probably populate them or fetch users map.
            // For now, showing IDs is "okay" but not user friendly.
            // Let's just show count or raw IDs for MVP, or fetch users.
          )}
          {topUps && topUps.length > 0 && (
            <div>
              <p>Top-Ups:</p>
              <ul>
                {topUps.map((t: any, i: number) => (
                  <li key={i}>
                    User {t.userId}: +{t.amount} ({t.comment})
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      );
    }
    if (event.type === "PASSWORD_RESET_REQUESTED") {
      return <p>Requested password reset for {event.data?.email}</p>;
    }
    if (event.type === "PASSWORD_RESET_COMPLETED") {
      return <p>Password reset completed</p>;
    }
    return <pre>{JSON.stringify(event.data, null, 2)}</pre>;
  };

  return (
    <div style={{ padding: "2rem" }}>
      <header style={{ display: "flex", justifyContent: "space-between" }}>
        <h1>Audit Trail</h1>
        <Link to='/'>Back to Dashboard</Link>
      </header>
      <table border={1} cellPadding={5} style={{ width: "100%", borderCollapse: "collapse", marginTop: "1rem" }}>
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>Actor</th>
            <th>Action</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody>
          {events.map((e) => (
            <tr key={e._id}>
              <td>{new Date(e.timestamp).toLocaleString()}</td>
              <td>{e.actorUserId?.displayName || "System"}</td>
              <td>{e.type}</td>
              <td>{renderDetails(e)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
