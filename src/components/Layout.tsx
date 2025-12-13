import { ContainerClient } from "@azure/storage-blob";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import LogoutIcon from "@mui/icons-material/Logout";
import { AppBar, Avatar, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, TextField, Toolbar } from "@mui/material";
import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useThemeContext } from "../context/ThemeContext";

export default function Layout() {
  const { user, logout, login } = useAuth();
  const { mode, toggleTheme } = useThemeContext();
  const [openProfile, setOpenProfile] = useState(false);
  const [editName, setEditName] = useState("");
  const [editProfilePicture, setEditProfilePicture] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleOpenProfile = () => {
    setEditName(user?.displayName || "");
    setEditProfilePicture(user?.profilePicture || "");
    setOpenProfile(true);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const sasUrl = import.meta.env.VITE_AZURE_STORAGE_SAS_URL;
      if (!sasUrl) throw new Error("Azure Storage SAS URL not found");

      // Ensure the URL points to the container
      const containerName = "plooiimages";
      const urlObj = new URL(sasUrl);
      if (!urlObj.pathname.includes(containerName)) {
        urlObj.pathname = `/${containerName}`;
      }

      const containerClient = new ContainerClient(urlObj.toString());
      const blobName = `${user?._id}-${Date.now()}-${file.name}`;
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);

      await blockBlobClient.uploadData(file, {
        blobHTTPHeaders: { blobContentType: file.type },
      });

      const blobUrl = blockBlobClient.url.split("?")[0];
      setEditProfilePicture(blobUrl);
    } catch (error) {
      console.error("Upload failed", error);
      alert("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const res = await client.patch("/users/me", { displayName: editName, profilePicture: editProfilePicture });
      login(res.data);
      setOpenProfile(false);
    } catch (err) {
      console.error("Failed to update profile", err);
    }
  };

  return (
    <>
      <AppBar
        position='sticky'
        color='transparent'
        elevation={0}
        sx={{ bgcolor: "background.paper", top: 0, zIndex: (theme) => theme.zIndex.appBar }}
      >
        <Toolbar>
          <Box component='img' src='/plooi_logo.png' alt='Logo' sx={{ height: 48, width: 48, mr: 1.5, objectFit: "contain" }} />
          <Box sx={{ flexGrow: 1 }} />
          <IconButton sx={{ mr: 1 }} onClick={toggleTheme} color='inherit'>
            {mode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
          <Button color='inherit' onClick={logout} startIcon={<LogoutIcon />} sx={{ mr: 2 }}></Button>
          {user && (
            <IconButton onClick={handleOpenProfile} sx={{ p: 0 }}>
              <Avatar src={user.profilePicture} sx={{ width: 40, height: 40, bgcolor: "secondary.main" }}>
                {!user.profilePicture && user.displayName.charAt(0).toUpperCase()}
              </Avatar>
            </IconButton>
          )}
        </Toolbar>
      </AppBar>

      <Outlet />

      <Dialog
        open={openProfile}
        onClose={() => setOpenProfile(false)}
        slotProps={{
          backdrop: {
            sx: {
              backdropFilter: "blur(8px)",
              backgroundColor: "rgba(0, 0, 0, 0.5)",
            },
          },
        }}
      >
        <DialogTitle>Update Profile</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Button variant='contained' component='label' disabled={uploading}>
              {uploading ? "Uploading..." : "Upload Profile Picture"}
              <input type='file' hidden accept='image/*' onChange={handleFileUpload} />
            </Button>
          </Box>
          <TextField
            margin='dense'
            label='Profile Picture URL'
            fullWidth
            variant='outlined'
            value={editProfilePicture}
            onChange={(e) => setEditProfilePicture(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenProfile(false)}>Cancel</Button>
          <Button onClick={handleUpdateProfile} variant='contained'>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
