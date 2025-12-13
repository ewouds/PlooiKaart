export interface User {
  _id: string;
  displayName: string;
  username: string;
  profilePicture?: string;
  role?: string;
}

export interface ScoreUser extends User {
  score: number;
  [key: string]: any;
}

export interface HistoryPoint {
  date: string;
  scores: {
    userId: string;
    name: string;
    score: number;
  }[];
}

export interface AuditEvent {
  _id: string;
  timestamp: string;
  actorUserId: User; // Updated to use User interface which has _id
  type: string;
  data: any;
}
