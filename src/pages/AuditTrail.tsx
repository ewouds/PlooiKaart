import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EventNoteIcon from "@mui/icons-material/EventNote";
import FilterListIcon from "@mui/icons-material/FilterList";
import PersonIcon from "@mui/icons-material/Person";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import { DateRangePicker } from "@mui/x-date-pickers-pro/DateRangePicker";
import { SingleInputDateRangeField } from "@mui/x-date-pickers-pro/SingleInputDateRangeField";
import { DateRange } from "@mui/x-date-pickers-pro/models";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs, { Dayjs } from "dayjs";
import { useEffect, useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import client from "../api/client";
import { AuditEvent, User } from "../shared/types";

export default function AuditTrail() {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  // Filter states
  const [filterUserId, setFilterUserId] = useState("ALL");
  const [dateRange, setDateRange] = useState<DateRange<Dayjs>>([null, null]);
  const [filterType, setFilterType] = useState("ALL");

  useEffect(() => {
    client.get("/audit").then((res) => setEvents(res.data));
    client.get("/users/scores").then((res) => setUsers(res.data));
  }, []);

  const uniqueTypes = useMemo(() => {
    const types = new Set(events.map((e) => e.type));
    return ["ALL", ...Array.from(types)];
  }, [events]);

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      // Filter by User (Actor)
      if (filterUserId !== "ALL") {
        const actorId = event.actorUserId?._id;
        // If event has no actor (system), and we filter for a specific user, exclude it
        if (!actorId || actorId !== filterUserId) {
          return false;
        }
      }

      // Filter by Date Range
      const [start, end] = dateRange;
      if (start) {
        if (dayjs(event.timestamp).isBefore(start, "day")) return false;
      }
      if (end) {
        if (dayjs(event.timestamp).isAfter(end, "day")) return false;
      }

      // Filter by Type
      if (filterType !== "ALL" && event.type !== filterType) {
        return false;
      }

      return true;
    });
  }, [events, filterUserId, dateRange, filterType]);

  const getUserName = (id: string) => {
    const user = users.find((u) => u._id === id);
    return user ? user.displayName : id;
  };

  const renderDetails = (event: AuditEvent) => {
    if (event.type === "MEETING_SUBMITTED" || event.type === "MEETING_OVERWRITTEN") {
      const { meetingDate, penalizedUserIds, topUps } = event.data;
      return (
        <Box>
          <Typography variant='body2' sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <EventNoteIcon fontSize='small' color='action' />
            Meeting Date: {meetingDate}
          </Typography>

          {penalizedUserIds && penalizedUserIds.length > 0 && (
            <Box sx={{ mt: 1 }}>
              <Typography variant='body2' color='error'>
                Plooikaarten:
              </Typography>
              <Typography variant='body2'>{penalizedUserIds.map((id: string) => getUserName(id)).join(", ")}</Typography>
            </Box>
          )}

          {topUps && topUps.length > 0 && (
            <Box sx={{ mt: 1 }}>
              <Typography variant='body2' fontWeight='bold'>
                Top-Ups:
              </Typography>
              <List dense disablePadding>
                {topUps.map((t: any, i: number) => (
                  <ListItem key={i} disablePadding>
                    <ListItemText
                      primary={`User ${getUserName(t.userId)}: +${t.amount}`}
                      secondary={t.comment ? `(${t.comment})` : null}
                      primaryTypographyProps={{ variant: "body2" }}
                      secondaryTypographyProps={{ variant: "caption" }}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </Box>
      );
    }
    if (event.type === "PASSWORD_RESET_REQUESTED") {
      return <Typography variant='body2'>Requested password reset for {event.data?.email}</Typography>;
    }
    if (event.type === "PASSWORD_RESET_COMPLETED") {
      return <Typography variant='body2'>Password reset completed</Typography>;
    }
    return (
      <Box component='pre' sx={{ p: 1, bgcolor: "grey.100", borderRadius: 1, overflowX: "auto", fontSize: "0.75rem", m: 0 }}>
        {JSON.stringify(event.data, null, 2)}
      </Box>
    );
  };

  return (
    <Container maxWidth='md' sx={{ mt: 2, pb: 4 }}>
      <Button component={RouterLink} to='/' startIcon={<ArrowBackIcon />} sx={{ mb: 2 }}>
        Back to Dashboard
      </Button>

      <Typography variant='h4' gutterBottom>
        Audit Trail
      </Typography>

      <Card variant='outlined' sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction='row' alignItems='center' gap={1} mb={2}>
            <FilterListIcon color='primary' />
            <Typography variant='h6'>Filters</Typography>
          </Stack>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <FormControl fullWidth size='small'>
                  <InputLabel>Filter by User</InputLabel>
                  <Select value={filterUserId} label='Filter by User' onChange={(e) => setFilterUserId(e.target.value)}>
                    <MenuItem value='ALL'>All Users</MenuItem>
                    {users.map((u) => (
                      <MenuItem key={u._id} value={u._id}>
                        {u.displayName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <FormControl fullWidth size='small'>
                  <InputLabel>Event Type</InputLabel>
                  <Select value={filterType} label='Event Type' onChange={(e) => setFilterType(e.target.value)}>
                    {uniqueTypes.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type === "ALL" ? "All Types" : type.replace(/_/g, " ")}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 12, md: 6 }}>
                <DateRangePicker
                  slots={{ field: SingleInputDateRangeField }}
                  label='Date Range'
                  value={dateRange}
                  onChange={(newValue) => setDateRange(newValue)}
                  slotProps={{ textField: { size: "small", fullWidth: true } }}
                />
              </Grid>
            </Grid>
          </LocalizationProvider>
        </CardContent>
      </Card>

      {filteredEvents.length === 0 ? (
        <Typography color='text.secondary'>No audit events found matching your criteria.</Typography>
      ) : (
        <Stack spacing={2}>
          {filteredEvents.map((e) => (
            <Card key={e._id} variant='outlined'>
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
                  <Chip label={e.type.replace(/_/g, " ")} color='primary' size='small' variant='outlined' sx={{ fontWeight: "bold" }} />
                  <Typography variant='caption' color='text.secondary'>
                    {new Date(e.timestamp).toLocaleString()}
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                  {e.actorUserId ? (
                    <Avatar src={e.actorUserId.profilePicture} sx={{ width: 24, height: 24 }}>
                      {!e.actorUserId.profilePicture && e.actorUserId.displayName.charAt(0).toUpperCase()}
                    </Avatar>
                  ) : (
                    <PersonIcon fontSize='small' color='action' />
                  )}
                  <Typography variant='body2'>{e.actorUserId?.displayName || "System"}</Typography>
                </Box>

                <Divider sx={{ my: 1 }} />

                <Box sx={{ bgcolor: "background.default", p: 1.5, borderRadius: 1 }}>{renderDetails(e)}</Box>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Container>
  );
}
