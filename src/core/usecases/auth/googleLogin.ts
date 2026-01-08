import { prisma } from "../../../infrastructure/prisma/prismaClient";
import jwt, { type SignOptions } from "jsonwebtoken";
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
  // 1. Verify token with Google
  let googleUser: GoogleUser;
  try {
    // Try as ID Token first
    const response = await axios.get<GoogleUser>(`https://oauth2.googleapis.com/tokeninfo?id_token=${input.token}`);
    googleUser = response.data;
  } catch (error) {
    try {
        // Try as Access Token (UserInfo endpoint)
        const response = await axios.get<GoogleUser>(`https://www.googleapis.com/oauth2/v3/userinfo`, {
            headers: { Authorization: `Bearer ${input.token}` }
        });
        googleUser = response.data;
    } catch (err2: any) {
        console.error("Google verify error:", err2.response?.data || err2.message);
        console.log("Token received:", input.token);
        throw new Error("INVALID_GOOGLE_TOKEN");
    }
  }

  const { sub: googleId, email, name, picture } = googleUser;

  if (!email) {
    throw new Error("GOOGLE_ACCOUNT_NO_EMAIL");
  }

  // 2. Find user by googleId
  let user = await prisma.user.findUnique({
    where: { googleId }
  });

  // 3. If not found, find by email
  if (!user) {
    user = await prisma.user.findUnique({
      where: { email }
    });

    if (user) {
      // Link account
      user = await prisma.user.update({
        where: { id: user.id },
        data: { googleId }
      });
    } else {
      // User doesn't exist, create new
      if (!input.phone) {
        throw new Error("PHONE_REQUIRED_FOR_NEW_USER");
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
    }
  }

  // 4. Update avatar if missing
  if (!user.avatarUrl && picture) {
    await prisma.user.update({
      where: { id: user.id },
      data: { avatarUrl: picture }
    });
  }

  // 5. Generate Token
  const token = jwt.sign(
    {
      sub: String(user.id),
      id: user.id,
      email: user.email!,
      role: user.role,
      phone: user.phone,
      type: "access"
    },
    String(process.env.JWT_SECRET),
    { expiresIn: String(process.env.JWT_EXPIRES_IN || "7d") as SignOptions["expiresIn"] }
  );

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
    token
  };
}
