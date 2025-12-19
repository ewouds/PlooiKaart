import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Container,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";
import { LineChart } from "@mui/x-charts/LineChart";
import { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useThemeContext } from "../context/ThemeContext";
import { APP_VERSION } from "../version";

interface ScoreUser {
  _id: string;
  displayName: string;
  score: number;
  profilePicture?: string;
  [key: string]: any;
}

interface HistoryPoint {
  date: string;
  scores: {
    userId: string;
    name: string;
    score: number;
  }[];
}

export default function Dashboard() {
  const theme = useTheme();
  const { user } = useAuth();
  const { mode } = useThemeContext();
  const [scores, setScores] = useState<ScoreUser[]>([]);
  const [history, setHistory] = useState<HistoryPoint[]>([]);

  useEffect(() => {
    client.get("/users/scores").then((res) => setScores(res.data));
    client
      .get("/users/scores/history")
      .then((res) => {
        if (Array.isArray(res.data)) {
          setHistory(res.data);
        } else {
          console.error("Expected array for history but got:", res.data);
          setHistory([]);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch history:", err);
        setHistory([]);
      });
  }, []);

  const myScore = scores.find((s) => s._id === user?._id)?.score;

  // Prepare chart data
  const safeHistory = Array.isArray(history) ? history : [];
  const xLabels = safeHistory.map((h) => h.date);
  const userIds = safeHistory.length > 0 ? safeHistory[0].scores.map((s) => s.userId) : [];

  const series = userIds.map((userId) => {
    const userMeta = safeHistory[0].scores.find((s) => s.userId === userId);
    return {
      label: userMeta?.name || "Onbekend",
      data: safeHistory.map((h) => h.scores.find((s) => s.userId === userId)?.score || 0),
      showMark: false,
      curve: "linear" as const,
    };
  });

  return (
    <>
      <Container maxWidth='sm' sx={{ mt: 1, pb: 1 }}>
        <Card sx={{ textAlign: "center", border: 1, borderColor: "primary.main", opacity: mode === "light" ? 0.95 : 0.8 }}>
          <Typography variant='h1' color='primary' fontWeight='bold' sx={{ p: 2, mt: 1 }}>
            {myScore !== undefined ? myScore : "..."} plooikaarten
          </Typography>
        </Card>

        <Stack direction='row' spacing={1} justifyContent='center' mb={4} flexWrap='wrap' useFlexGap sx={{ gap: 0.5 }}>
          <Button component={RouterLink} to='/meetings/new' variant='outlined' size='large'>
            Samenkomst
          </Button>
          <Button component={RouterLink} to='/audit' variant='outlined'>
            Logboek
          </Button>
          <Button component={RouterLink} to='/reglement' variant='outlined'>
            Reglement
          </Button>
        </Stack>

        <Card sx={{ mt: 1, border: 1, borderColor: "primary.main", opacity: mode === "light" ? 0.9 : 0.6 }}>
          <CardContent>
            {scores.length > 0 && (
              <Box sx={{ width: "100%", height: 300, mb: 2 }}>
                <BarChart
                  dataset={scores.map((s) => ({
                    ...s,
                    positive: s.score >= 0 ? s.score : 0,
                    negative: s.score < 0 ? s.score : 0,
                  }))}
                  xAxis={[{ scaleType: "band", dataKey: "displayName", tickLabelStyle: { fontSize: 10 } }]}
                  series={[
                    { dataKey: "positive", label: "Paskaarten", color: theme.palette.secondary.main, stack: "total" },
                    { dataKey: "negative", label: "Paskaarten", color: theme.palette.primary.main, stack: "total" },
                  ]}
                  height={280}
                  borderRadius={4}
                  margin={{ bottom: 15 }}
                  slotProps={{ legend: { hidden: true } as any }}
                />
              </Box>
            )}

            <List disablePadding>
              {scores.map((s, index) => (
                <div key={s._id}>
                  {index > 0 && <Divider />}
                  <ListItem
                    secondaryAction={
                      <Typography variant='h6' color='primary' fontWeight='bold'>
                        {s.score}
                      </Typography>
                    }
                    sx={{
                      bgcolor: s._id === user?._id ? "action.hover" : "transparent",
                      borderRadius: 1,
                      my: 0.2,
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar src={s.profilePicture} sx={{ bgcolor: s._id === user?._id ? "secondary.main" : undefined }}>
                        {!s.profilePicture && s.displayName.charAt(0).toUpperCase()}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText primary={s.displayName} primaryTypographyProps={{ fontWeight: s._id === user?._id ? "bold" : "medium" }} />
                  </ListItem>
                </div>
              ))}
            </List>
          </CardContent>
        </Card>

        {history.length > 0 && (
          <Card sx={{ mt: 3, border: 1, borderColor: "primary.main", opacity: 0.6 }}>
            <CardHeader title='Vooruitgang' />
            <CardContent>
              <Box sx={{ width: "100%", height: 300 }}>
                <LineChart
                  xAxis={[{ scaleType: "point", data: xLabels }]}
                  series={series}
                  height={280}
                  margin={{ left: 30, right: 10, top: 10, bottom: 20 }}
                />
              </Box>
            </CardContent>
          </Card>
        )}

        <Typography variant='body2' color='text.secondary' align='center' sx={{ mt: 4, mb: 2 }}>
          💩🧸🌳 ver. {APP_VERSION}
        </Typography>
      </Container>
    </>
  );
}
