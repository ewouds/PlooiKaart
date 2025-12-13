
import { ContainerClient } from "@azure/storage-blob";
import dotenv from "dotenv";
import fs from "fs";
import mongoose from "mongoose";
import path from "path";
import { User } from "../server/models/User";

dotenv.config();

async function main() {
  // 1. Connect to MongoDB
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) throw new Error("MONGODB_URI not found");
  
  await mongoose.connect(mongoUri);
  console.log("Connected to MongoDB");

  // 2. Find user 'Ewoud'
  // Note: The seed data uses 'Ewoud' as displayName. Let's check case-insensitive.
  const user = await User.findOne({ displayName: { $regex: new RegExp("^ewoud$", "i") } });
  if (!user) {
    console.error("User 'Ewoud' not found");
    process.exit(1);
  }
  console.log(`Found user: ${user.displayName} (${user._id})`);

  // 3. Upload to Azure
  const sasUrl = process.env.VITE_AZURE_STORAGE_SAS_URL;
  if (!sasUrl) throw new Error("VITE_AZURE_STORAGE_SAS_URL not found");

  const containerName = "plooiimages";
  const urlObj = new URL(sasUrl);
  if (!urlObj.pathname.includes(containerName)) {
    urlObj.pathname = `/${containerName}`;
  }

  const containerClient = new ContainerClient(urlObj.toString());
  
  // Ensure container exists (though SAS might not have permission to create it, we hope it exists)
  // We can't create container with SAS usually unless it has 'c' permission for Account SAS, 
  // but this looks like a Service SAS or Account SAS. The token has 'sp=rwdlacupiytfx', so 'c' (create) is there.
  try {
    await containerClient.createIfNotExists({ access: "blob" });
  } catch (e) {
    console.log("Container creation skipped or failed (might already exist or no permission):", e.message);
  }

  const filePath = path.join(process.cwd(), "public", "ewoud.jpg");
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
  }

  const fileName = `ewoud-${Date.now()}.jpg`;
  const blockBlobClient = containerClient.getBlockBlobClient(fileName);

  console.log(`Uploading ${fileName}...`);
  await blockBlobClient.uploadFile(filePath, {
    blobHTTPHeaders: { blobContentType: "image/jpeg" }
  });

  const blobUrl = blockBlobClient.url.split("?")[0];
  console.log(`Uploaded to: ${blobUrl}`);

  // 4. Update User
  user.profilePicture = blobUrl;
  await user.save();
  console.log("User profile updated.");

  await mongoose.disconnect();
}

main().catch(console.error);
