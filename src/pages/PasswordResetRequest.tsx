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
      setMessage(res.data.message);
    } catch (err) {
      setMessage("Something went wrong. Please try again.");
    }
  };

  return (
    <Container maxWidth='xs' sx={{ display: "flex", flexDirection: "column", justifyContent: "center", minHeight: "80vh" }}>
      <Card variant='outlined'>
        <CardContent>
          <Typography variant='h5' component='h1' gutterBottom align='center'>
            Reset Password
          </Typography>

          {message ? (
            <Alert severity='success' sx={{ mb: 2 }}>
              {message}
            </Alert>
          ) : (
            <form onSubmit={handleSubmit}>
              <Typography variant='body2' color='text.secondary' gutterBottom align='center'>
                Enter your username or email to receive a reset link.
              </Typography>

              <TextField
                label='Username or Email'
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                fullWidth
                required
                margin='normal'
              />

              <Button type='submit' variant='contained' color='primary' fullWidth size='large' sx={{ mt: 2 }}>
                Send Reset Link
              </Button>
            </form>
          )}

          <Box sx={{ mt: 2, textAlign: "center" }}>
            <Button component={RouterLink} to='/login' color='primary'>
              Back to Login
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}
