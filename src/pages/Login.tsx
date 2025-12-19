import { Alert, Avatar, Box, Button, Card, CardContent, Container, Link, MenuItem, TextField, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";

interface LoginUser {
  displayName: string;
  username: string;
  profilePicture?: string;
}

export default function Login() {
  const [users, setUsers] = useState<LoginUser[]>([]);
  const [username, setUsername] = useState(localStorage.getItem("lastUsername") || "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const selectedUser = users.find((u) => u.username === username);

  useEffect(() => {
    client
      .get("/users/login-list")
      .then((res) => setUsers(res.data))
      .catch((err) => console.error("Failed to fetch users", err));
  }, []);

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUsername = e.target.value;
    setUsername(newUsername);
    localStorage.setItem("lastUsername", newUsername);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await client.post("/auth/login", { username, password });
      const { token, user } = res.data;
      login(user, token);
      navigate("/");
    } catch (err: any) {
      setError(err.response?.data?.message || "De toegang is u ontzegd.");
    }
  };

  return (
    <Container maxWidth='xs' sx={{ display: "flex", flexDirection: "column", justifyContent: "center", minHeight: "100vh" }}>
      <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
        <Box component='img' src='/plooi_logo.png' alt='PlooiKaart Logo' sx={{ width: 180, height: 180, objectFit: "contain" }} />
      </Box>
      <Card>
        <CardContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 2, mb: 1 }}>
            {selectedUser && (
              <Avatar src={selectedUser.profilePicture} sx={{ width: 56, height: 56 }}>
                {!selectedUser.profilePicture && selectedUser.displayName.charAt(0).toUpperCase()}
              </Avatar>
            )}
            <Typography variant='h4' component='h1'>
              Zich Kenbaar Maken
            </Typography>
          </Box>

          {error && <Alert severity='error'>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <TextField
              select
              label='Naam'
              value={username}
              onChange={handleUsernameChange}
              required
              autoFocus
              SelectProps={{
                renderValue: (selected: unknown) => {
                  const user = users.find((u) => u.username === selected);
                  return (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Avatar src={user?.profilePicture} sx={{ width: 24, height: 24 }}>
                        {!user?.profilePicture && user?.displayName.charAt(0).toUpperCase()}
                      </Avatar>
                      {user?.displayName}
                    </Box>
                  );
                },
              }}
            >
              {users.map((user) => (
                <MenuItem key={user.username} value={user.username}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Avatar src={user.profilePicture} sx={{ width: 24, height: 24 }}>
                      {!user.profilePicture && user.displayName.charAt(0).toUpperCase()}
                    </Avatar>
                    {user.displayName}
                  </Box>
                </MenuItem>
              ))}
            </TextField>
            <TextField label='Geheimschrift' type='password' value={password} onChange={(e) => setPassword(e.target.value)} required />
            <Button type='submit' variant='contained' color='primary' fullWidth size='large' sx={{ mt: 2 }}>
              Betreden
            </Button>
          </form>

          <Box textAlign='center' mt={2}>
            <Link component={RouterLink} to='/forgot-password' variant='body2'>
              Geheimschrift ontgaan?
            </Link>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}
