import { Alert, Box, Button, Card, CardContent, Container, TextField, Typography } from "@mui/material";
import React, { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import client from "../api/client";

export default function PasswordResetRequest() {
  const [identifier, setIdentifier] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await client.post("/auth/password-reset/request", { identifier });
      setMessage("Indien de gebruiker bestaat, is er een reset link verzonden.");
    } catch (err) {
      setMessage("Er is iets misgegaan. Probeer het opnieuw.");
    }
  };

  return (
    <Container maxWidth='xs' sx={{ display: "flex", flexDirection: "column", justifyContent: "center", minHeight: "80vh" }}>
      <Card variant='outlined'>
        <CardContent>
          <Typography variant='h5' component='h1' gutterBottom align='center'>
            Wachtwoord Resetten
          </Typography>

          {message ? (
            <Alert severity='success' sx={{ mb: 2 }}>
              {message}
            </Alert>
          ) : (
            <form onSubmit={handleSubmit}>
              <Typography variant='body2' color='text.secondary' gutterBottom align='center'>
                Vul je gebruikersnaam of e-mailadres in om een reset-link te ontvangen.
              </Typography>

              <TextField
                label='Gebruikersnaam of E-mail'
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                fullWidth
                required
                margin='normal'
              />

              <Button type='submit' variant='contained' color='primary' fullWidth size='large' sx={{ mt: 2 }}>
                Verstuur Reset Link
              </Button>
            </form>
          )}

          <Box sx={{ mt: 2, textAlign: "center" }}>
            <Button component={RouterLink} to='/login' color='primary'>
              Terug naar Login
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}
