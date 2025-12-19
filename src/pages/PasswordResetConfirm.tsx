import { Alert, Box, Button, Card, CardContent, Container, TextField, Typography } from "@mui/material";
import React, { useState } from "react";
import { Link as RouterLink, useNavigate, useSearchParams } from "react-router-dom";
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
      setMessage("De wijziging der toegangscredentials is succesvol geratificeerd. U bent wederom gerechtigd tot toegang.");
      setTimeout(() => navigate("/login"), 3000);
    } catch (err: any) {
      setMessage(err.response?.data?.message || "De ratificatie van het nieuwe wachtwoord is mislukt");
    }
  };

  if (!token || !userId) {
    return (
      <Container maxWidth='xs' sx={{ mt: 8 }}>
        <Card variant='outlined'>
          <CardContent sx={{ textAlign: "center" }}>
            <Alert severity='error' sx={{ mb: 2 }}>
              Het aangeboden hersteldecreet is ongeldig of verlopen.
            </Alert>
            <Button component={RouterLink} to='/login' variant='text'>
              Terugkeer naar het Inlogportaal
            </Button>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <Container maxWidth='xs' sx={{ display: "flex", flexDirection: "column", justifyContent: "center", minHeight: "80vh" }}>
      <Card variant='outlined'>
        <CardContent>
          <Typography variant='h5' component='h1' gutterBottom align='center'>
            Ratificatie Nieuw Wachtwoord
          </Typography>

          {message && (
            <Alert severity='info' sx={{ mb: 2 }}>
              {message}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              label='Nieuw Geheim Wachtwoord'
              type='password'
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              fullWidth
              required
              margin='normal'
            />

            <Button type='submit' variant='contained' color='primary' fullWidth size='large' sx={{ mt: 2 }}>
              Bekrachtig Nieuw Wachtwoord
            </Button>
          </form>

          <Box sx={{ mt: 2, textAlign: "center" }}>
            <Button component={RouterLink} to='/login' color='primary'>
              Terugkeer naar het Inlogportaal
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}
