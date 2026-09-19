# 🍃 MongoDB Atlas Setup & Configuration Guide for EcoSort

This guide will walk you through creating a free cloud database on MongoDB Atlas and connecting it to **EcoSort**.

---

## ⚡ Quick Summary: The MongoDB URI Format

A valid MongoDB connection string looks like this:

```bash
mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/ecosort?retryWrites=true&w=majority
```

> ⚠️ **Common Mistakes to Avoid:**
> 1. **Keep the brackets `<` and `>`?** No! Replace `<username>` with `myuser` and `<password>` with `mypassword123`.
> 2. **Special characters in your password?** If your password contains characters like `@`, `:`, `#`, or `%`, you **must URL-encode them** (e.g. replace `@` with `%40`, `#` with `%23`) or use an alphanumeric password.
> 3. **Database Name:** Specify `/ecosort` before the `?` query string so all collections are created in an organized database.
> 4. **IP Whitelist:** Make sure **0.0.0.0/0** is added in Network Access so Cloud Run / web containers can connect.

---

## 🛠️ Step-by-Step Setup (Takes ~3 Minutes)

### Step 1: Create a Free MongoDB Atlas Account & Cluster
1. Navigate to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas).
2. Sign up or log in.
3. Click **"Create a Deployment"** or **"Build a Database"**.
4. Choose the **M0 Free (Shared)** tier (100% free, 512MB storage, never expires).
5. Select any provider (AWS/Google Cloud) and region closest to your users, then click **"Create"**.

---

### Step 2: Create a Database User (Credentials)
1. In the MongoDB Atlas sidebar, click **"Database Access"** (under Security).
2. Click **"Add New Database User"**.
3. Authentication Method: **Password**.
4. Set a **Username** (e.g., `ecosort_admin`).
5. Set a **Password** (e.g., `MySecurePass123` — *Tip: avoid `@` and `:` to avoid URL encoding issues*).
6. Under Database User Privileges, choose **"Read and write to any database"** (or Atlas admin).
7. Click **"Add User"**.

---

### Step 3: Enable Network Access (Allow Cloud Connection)
1. In the MongoDB Atlas sidebar, click **"Network Access"** (under Security).
2. Click **"Add IP Address"**.
3. Click the button **"Allow Access from Anywhere"** (this sets `0.0.0.0/0`).
4. Click **"Confirm"**.
*(Note: Because this cloud container uses dynamic egress IPs, 0.0.0.0/0 is required so the server can reach your cluster).*

---

### Step 4: Copy Your Connection String
1. In the sidebar, click **"Database"** (under Deployment).
2. Click the **"Connect"** button next to your cluster.
3. Choose **"Drivers"** (Node.js).
4. Copy the connection string shown. It will look like:
   ```text
   mongodb+srv://ecosort_admin:<db_password>@cluster0.xxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace `<db_password>` with your real password, and add `/ecosort` before `?`:
   ```text
   mongodb+srv://ecosort_admin:<YOUR_PASSWORD>@cluster0.xxxx.mongodb.net/ecosort?retryWrites=true&w=majority
   ```

---

## 🚀 Step 5: Add MONGODB_URI to Your Application

### Option A: Via AI Studio Settings (Recommended)
1. In the AI Studio interface, open the **Settings / Secrets** menu.
2. Add a secret or environment variable named `MONGODB_URI`.
3. Paste your full connection string.

### Option B: Via `.env` (Local Development)
Add the following line to your `.env` file:
```env
MONGODB_URI="mongodb+srv://ecosort_admin:<YOUR_PASSWORD>@cluster0.xxxx.mongodb.net/ecosort?retryWrites=true&w=majority"
```

---

## 🧪 Testing & Seeding Your Database

### 1. In-App Connection Tester
Open the **Admin Rules** tab in the EcoSort app. The **MongoDB Assistant** banner at the top lets you:
- Check real-time connection status
- Test any URI directly with live diagnostics
- One-click seed 31 municipal waste rules directly into your cluster

### 2. Command Line Seeding Script
You can also run the seed script anytime in your terminal:
```bash
npm run seed:mongodb
```

---

## 🔍 Troubleshooting Common Connection Errors

| Error Message | Cause & Fix |
| :--- | :--- |
| `bad auth: Authentication failed` | Your username or password is incorrect. Verify the user in **Database Access**. If the password has `@`, encode it as `%40`. |
| `querySrv ENOTFOUND` | The cluster host name was mistyped or does not exist. Copy the exact URI from the "Connect" dialog in Atlas. |
| `connection timed out` / `ETIMEDOUT` | Network access is blocked. Go to **Network Access** in Atlas and ensure `0.0.0.0/0` is added and active. |
| `Unreplaced placeholder <password>` | The `<password>` brackets were not removed. Replace `<password>` with your actual password. |

---

## 🛡️ Built-in Zero Downtime Guarantee
EcoSort features **resilient dual-mode storage**:
- If `MONGODB_URI` is provided and connected, all rules, scans, and users are synchronized with MongoDB Atlas.
- If MongoDB is temporarily unreachable or not yet configured, the app seamlessly runs on local embedded storage so users never experience crashes or interruptions.
