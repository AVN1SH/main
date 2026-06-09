import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/user.model";
import { createDashboardToken, verifyDashboardToken } from "@/utils/dashboardAuth";
import crypto from "crypto";

const COOKIE_NAME = "dashboard_token";

const hashPassword = (password: string) => {
  return crypto.createHash("sha256").update(password).digest("hex");
};

export async function GET(req: Request) {
  try {
    await dbConnect();
    
    const cookieHeader = req.headers.get("cookie");
    if (!cookieHeader) {
      return NextResponse.json({ role: null }, { status: 401 });
    }

    const cookies = Object.fromEntries(
      cookieHeader.split("; ").map(c => c.split("="))
    );

    const token = cookies[COOKIE_NAME];
    if (!token) {
      return NextResponse.json({ role: null }, { status: 401 });
    }

    const decoded = verifyDashboardToken(token);
    if (!decoded) {
      return NextResponse.json({ role: null }, { status: 401 });
    }

    return NextResponse.json({
      role: decoded.role,
    });
  } catch (error) {
    console.error("DASHBOARD_AUTH_CHECK_ERROR:", error);
    return NextResponse.json({ role: null }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { email, password, name, type } = await req.json();

    if (!email || !password) {
      return new NextResponse("Email and password are required", { status: 400 });
    }

    await dbConnect();

    if (type === "login") {
      const user = await UserModel.findOne({ email }).lean();
      if (!user) {
        return new NextResponse("Invalid credentials", { status: 401 });
      }

      if (user.password !== hashPassword(password)) {
        return new NextResponse("Invalid credentials", { status: 401 });
      }

      const token = createDashboardToken({
        rbacUserId: user._id.toString(),
        userId: user.userId,
        role: user.role,
        email: user.email,
        name: user.name || undefined,
      });

      const response = NextResponse.json({
        user: {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
        },
      });

      response.cookies.set(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production" && process.env.ALLOW_INSECURE_COOKIES !== "true",
        sameSite: "lax",
        path: "/",
        maxAge: 7 * 24 * 60 * 60,
      });

      return response;
    }

    if (type === "register") {
      const existingUser = await UserModel.findOne({ email }).lean();
      if (existingUser) {
        return new NextResponse("User already exists", { status: 409 });
      }

      const userId = `rbac_${crypto.randomBytes(16).toString("hex")}`;

      const newUser = await UserModel.create({
        userId,
        email,
        password: hashPassword(password),
        name: name || null,
        role: "user",
      });

      const token = createDashboardToken({
        rbacUserId: newUser._id.toString(),
        userId: newUser.userId,
        role: newUser.role,
        email: newUser.email,
        name: newUser.name || undefined,
      });

      const response = NextResponse.json({
        user: {
          id: newUser._id.toString(),
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
        },
      });

      response.cookies.set(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production" && process.env.ALLOW_INSECURE_COOKIES !== "true",
        sameSite: "lax",
        path: "/",
        maxAge: 7 * 24 * 60 * 60,
      });

      return response;
    }

    return new NextResponse("Invalid type", { status: 400 });
  } catch (error) {
    console.error("DASHBOARD_AUTH_ERROR:", error);
    return new NextResponse("Authentication failed", { status: 500 });
  }
}
