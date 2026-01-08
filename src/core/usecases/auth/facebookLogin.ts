import { prisma } from "../../../infrastructure/prisma/prismaClient";
import jwt, { type SignOptions } from "jsonwebtoken";
import axios from "axios";

interface FacebookLoginInput {
  token: string;
  phone: string;
}

interface FacebookUser {
  id: string;
  name: string;
  email?: string;
  picture?: {
    data: {
      url: string;
    }
  };
}

export async function facebookLogin(input: FacebookLoginInput) {
  // 1. Verify token with Facebook
  let fbUser: FacebookUser;
  try {
    const response = await axios.get<FacebookUser>(`https://graph.facebook.com/me?access_token=${input.token}&fields=id,name,email,picture.type(large)`);
    fbUser = response.data;
  } catch (error) {
    throw new Error("INVALID_FACEBOOK_TOKEN");
  }

  const { id: facebookId, email, name, picture } = fbUser;
  const avatarUrl = picture?.data?.url;

  // Note: Facebook might not return email if user didn't grant permission or signed up with phone only.
  // We can key off facebookId primarily.

  let user = await prisma.user.findUnique({
    where: { facebookId }
  });

  if (!user && email) {
    // Check if email exists
    user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (user) {
      // Link account
      user = await prisma.user.update({
        where: { id: user.id },
        data: { facebookId }
      });
    }
  }

  if (!user) {
     // Create new user
     if (!input.phone) {
       throw new Error("PHONE_REQUIRED_FOR_NEW_USER");
     }
     if (!email) {
        // We really prefer email. If FB doesn't give email, and user didn't provide one...
        // For now let's assume if email is missing we might fail or allow strictly phone-based user if model supports it (model says email String?, so yes).
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
          email: email || undefined,
          name: name || "Facebook User",
          facebookId,
          avatarUrl: avatarUrl,
          role: "CUSTOMER",
          isActive: true,
          phone: input.phone
        }
      });
  }

  // 4. Update avatar if missing
  if (!user.avatarUrl && avatarUrl) {
    await prisma.user.update({
      where: { id: user.id },
      data: { avatarUrl }
    });
  }

  // 5. Generate Token
  const token = jwt.sign(
    {
      sub: String(user.id),
      id: user.id,
      email: user.email!, // might be null if FB didn't give email
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
