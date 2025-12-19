import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DeleteIcon from "@mui/icons-material/Delete";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs, { Dayjs } from "dayjs";
import React, { useEffect, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import client from "../api/client";

interface User {
  _id: string;
  displayName: string;
  profilePicture?: string;
}

interface TopUp {
  userId: string;
  amount: number;
  comment: string;
}

export default function MeetingForm() {
  const [users, setUsers] = useState<User[]>([]);
  const [date, setDate] = useState<Dayjs | null>(dayjs());
  const [presentIds, setPresentIds] = useState<string[]>([]);
  const [excusedIds, setExcusedIds] = useState<string[]>([]);
  const [topUps, setTopUps] = useState<TopUp[]>([]);
  const [error, setError] = useState("");
  const [openConfirm, setOpenConfirm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    client.get("/users/scores").then((res) => setUsers(res.data));
  }, []);

  useEffect(() => {
    if (date) {
      const dateStr = date.format("YYYY-MM-DD");
      client
        .get(`/meetings/${dateStr}`)
        .then((res) => {
          const meeting = res.data;
          setPresentIds(meeting.presentUserIds || []);
          setExcusedIds(meeting.excusedUserIds || []);
          // Ensure topUps match the interface (strip _id if necessary, though extra props are usually fine)
          setTopUps(
            (meeting.topUps || []).map((t: any) => ({
              userId: t.userId,
              amount: t.amount,
              comment: t.comment || "",
            }))
          );
          setError("");
        })
        .catch((err) => {
          if (err.response && err.response.status === 404) {
            // No meeting found, clear form
            setPresentIds([]);
            setExcusedIds([]);
            setTopUps([]);
          } else {
            console.error("Failed to fetch meeting", err);
          }
        });
    }
  }, [date]);

  const handleAttendanceChange = (userId: string, newStatus: string | null) => {
    if (newStatus === "present") {
      setPresentIds((prev) => [...prev, userId]);
      setExcusedIds((prev) => prev.filter((id) => id !== userId));
    } else if (newStatus === "excused") {
      setExcusedIds((prev) => [...prev, userId]);
      setPresentIds((prev) => prev.filter((id) => id !== userId));
    } else {
      setPresentIds((prev) => prev.filter((id) => id !== userId));
      setExcusedIds((prev) => prev.filter((id) => id !== userId));
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
    const presentSet = new Set(presentIds);
    for (const id of excusedIds) {
      if (presentSet.has(id)) {
        setError("Een heerschap kan niet tegelijkertijd aanwezig en verontschuldigd zijn.");
        return;
      }
    }

    for (const t of topUps) {
      if (t.amount <= 0 || t.amount % 5 !== 0) {
        setError("De bijkoop dient een veelvoud van vijf te bedragen.");
        return;
      }
    }

    try {
      await client.post("/meetings", {
        date: date ? date.format("YYYY-MM-DD") : "",
        presentUserIds: presentIds,
        excusedUserIds: excusedIds,
        topUps,
      });
      navigate("/");
    } catch (err: any) {
      if (err.response?.status === 409 && err.response?.data?.code === "MEETING_EXISTS") {
        setOpenConfirm(true);
      } else {
        setError(err.response?.data?.message || "Het indienen der vergadering is mislukt.");
      }
    }
  };

  const handleConfirmOverwrite = async () => {
    try {
      await client.post("/meetings", {
        date: date ? date.format("YYYY-MM-DD") : "",
        presentUserIds: presentIds,
        excusedUserIds: excusedIds,
        topUps,
        overwrite: true,
      });
      setOpenConfirm(false);
      navigate("/");
    } catch (err: any) {
      setError(err.response?.data?.message || "Het overschrijven der samenkomst is mislukt.");
      setOpenConfirm(false);
    }
  };

  return (
    <Container maxWidth='sm' sx={{ mt: 2, pb: 4 }}>
      <Button component={RouterLink} to='/' startIcon={<ArrowBackIcon />} sx={{ mb: 2 }}>
        terug
      </Button>

      <Typography variant='h4' gutterBottom>
        Samenkomst
      </Typography>

      {error && (
        <Alert severity='error' sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label='Datum der Samenkomst'
                value={date}
                onChange={(newValue) => setDate(newValue)}
                slotProps={{ textField: { fullWidth: true, required: true } }}
              />
            </LocalizationProvider>
          </CardContent>
        </Card>

        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant='h6' gutterBottom>
              Aanwezigen
            </Typography>
            <Stack spacing={2}>
              {users.map((u) => {
                let status = null;
                if (presentIds.includes(u._id)) status = "present";
                else if (excusedIds.includes(u._id)) status = "excused";

                return (
                  <Box
                    key={u._id}
                    sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #eee", pb: 1 }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <Avatar src={u.profilePicture} sx={{ width: 32, height: 32 }}>
                        {!u.profilePicture && u.displayName.charAt(0).toUpperCase()}
                      </Avatar>
                      <Typography variant='body1' fontWeight='medium'>
                        {u.displayName}
                      </Typography>
                    </Box>
                    <ToggleButtonGroup value={status} exclusive onChange={(_, newStatus) => handleAttendanceChange(u._id, newStatus)} size='small'>
                      <ToggleButton value='present' color='success' sx={{ px: 2 }}>
                        <CheckCircleIcon fontSize='small' sx={{ mr: 1 }} /> Aanwezig
                      </ToggleButton>
                      <ToggleButton value='excused' color='warning' sx={{ px: 2 }}>
                        <HelpOutlineIcon fontSize='small' sx={{ mr: 1 }} /> Ziek
                      </ToggleButton>
                    </ToggleButtonGroup>
                  </Box>
                );
              })}
            </Stack>
          </CardContent>
        </Card>

        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant='h6' gutterBottom>
              Bijkoop (5 Plooikaarten)
            </Typography>

            {topUps.map((t, i) => (
              <Box key={i} sx={{ p: 2, bgcolor: "background.default", borderRadius: 2, mb: 2, border: "1px solid", borderColor: "divider" }}>
                <FormControl fullWidth margin='normal'>
                  <InputLabel>Heerschap</InputLabel>
                  <Select value={t.userId} label='Heerschap' onChange={(e) => updateTopUp(i, "userId", e.target.value)}>
                    {users.map((u) => (
                      <MenuItem key={u._id} value={u._id}>
                        {u.displayName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  label='Toelichting'
                  value={t.comment}
                  onChange={(e) => updateTopUp(i, "comment", e.target.value)}
                  placeholder='Reden (bv. Rondje voor de ganse groep)'
                  fullWidth
                  margin='normal'
                />

                <Button variant='outlined' color='error' startIcon={<DeleteIcon />} onClick={() => removeTopUp(i)} fullWidth sx={{ mt: 1 }}>
                  Verwijderen
                </Button>
              </Box>
            ))}

            <Button variant='outlined' startIcon={<AddIcon />} onClick={addTopUp} fullWidth>
              Bijkoop toevoegen
            </Button>
          </CardContent>
        </Card>

        <Button type='submit' variant='contained' size='large' fullWidth>
          Samenkomst indienen
        </Button>
      </form>

      <Dialog
        open={openConfirm}
        onClose={() => setOpenConfirm(false)}
        aria-labelledby='alert-dialog-title'
        aria-describedby='alert-dialog-description'
      >
        <DialogTitle id='alert-dialog-title'>{"Reeds Bestaande Zitting"}</DialogTitle>
        <DialogContent>
          <DialogContentText id='alert-dialog-description'>
            Voorwaar, er is reeds een samenkomst geboekstaafd op deze datum. Wenst gij de bestaande notulen te overschrijven met de onderhavige
            gegevens?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirm(false)}>Afzien</Button>
          <Button onClick={handleConfirmOverwrite} autoFocus color='error'>
            Overschrijven
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
