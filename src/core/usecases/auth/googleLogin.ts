import { prisma } from "../../../infrastructure/prisma/prismaClient";
import { createAccessToken, createRefreshToken } from "../../services/tokenService";
import axios from "axios";

interface GoogleLoginInput {
  token: string;
  phone: string;
}

interface GoogleUser {
  sub: string;
  email: string;
  name: string;
  picture: string;
}

export async function googleLogin(input: GoogleLoginInput) {
  console.log("🔵 [googleLogin] Start with token length:", input.token?.length);

    // 1. Verify token with Google
    let googleUser: GoogleUser;
    const isAccessToken = input.token.startsWith("ya29.");
    
    if (isAccessToken) {
        console.log("🔵 [googleLogin] Detected Access Token (starts with ya29), verifying via UserInfo...");
        try {
            const response = await axios.get<GoogleUser>(`https://www.googleapis.com/oauth2/v3/userinfo`, {
                headers: { Authorization: `Bearer ${input.token}` },
                timeout: 5000
            });
            googleUser = response.data;
            console.log("🟢 [googleLogin] Access Token verified");
        } catch (err: any) {
             console.error("🔴 [googleLogin] Access Token verification failed:", err.response?.data || err.message);
             // Fail fast if it looked like an access token but failed
             throw new Error("INVALID_GOOGLE_TOKEN");
        }
    } else {
        // Assume ID Token or other format
        try {
            console.log("🔵 [googleLogin] Verifying as ID Token...");
            const response = await axios.get<GoogleUser>(`https://oauth2.googleapis.com/tokeninfo?id_token=${input.token}`, { timeout: 5000 });
            googleUser = response.data;
            console.log("🟢 [googleLogin] ID Token verified");
        } catch (error) {
            console.log("🟡 [googleLogin] ID Token failed, trying Access Token as fallback...");
            try {
                const response = await axios.get<GoogleUser>(`https://www.googleapis.com/oauth2/v3/userinfo`, {
                    headers: { Authorization: `Bearer ${input.token}` },
                    timeout: 5000
                });
                googleUser = response.data;
                console.log("🟢 [googleLogin] Access Token verified (fallback)");
            } catch (err2: any) {
                console.error("🔴 [googleLogin] Token verification failed:", err2.response?.data || err2.message);
                throw new Error("INVALID_GOOGLE_TOKEN");
            }
        }
    }

  const { sub: googleId, email, name, picture } = googleUser;
  console.log("🔵 [googleLogin] Google User:", { email, googleId, name });

  if (!email) {
    throw new Error("GOOGLE_ACCOUNT_NO_EMAIL");
  }

  // 2. Find user by googleId
  let user = await prisma.user.findUnique({
    where: { googleId }
  });

  // 3. If not found, find by email
  if (!user) {
    console.log("🔵 [googleLogin] User not found by googleId, checking email...");
    user = await prisma.user.findUnique({
      where: { email }
    });

    if (user) {
      console.log("🟢 [googleLogin] User found by email, linking account...");
      user = await prisma.user.update({
        where: { id: user.id },
        data: { googleId }
      });
    } else {
      console.log("🔵 [googleLogin] Creating new user...");
      // User doesn't exist, create new
      if (!input.phone) {
        throw new Error("PHONE_REQUIRED");
      }

      // Check if phone unique
       const phoneExists = await prisma.user.findUnique({
        where: { phone: input.phone }
      });
      if (phoneExists) {
        throw new Error("PHONE_ALREADY_USED");
      }

      user = await prisma.user.create({
        data: {
          email,
          name: name || "Google User",
          googleId,
          avatarUrl: picture,
          emailVerified: true,
          role: "CUSTOMER",
          isActive: true,
          phone: input.phone
        }
      });
      console.log("🟢 [googleLogin] New user created:", user.id);
    }
  }

  // 4. Update avatar if missing
  if (!user.avatarUrl && picture) {
    await prisma.user.update({
      where: { id: user.id },
      data: { avatarUrl: picture }
    });
  }

  // 5. Generate Tokens
  console.log("🔵 [googleLogin] Generating tokens for user:", user.id);
  const tokenPayload = {
      id: user.id,
      email: user.email!,
      role: user.role,
      phone: user.phone
  };

  const token = createAccessToken(tokenPayload);
  const refreshToken = createRefreshToken(tokenPayload);
  console.log("🟢 [googleLogin] Tokens generated");

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt
    }
  });

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      createdAt: user.createdAt,
      avatarUrl: user.avatarUrl
    },
    token, // This will be renamed to accessToken by the controller
    refreshToken
  };
}
