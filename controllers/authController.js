import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "15m",
  });
};

const generateRefreshToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });
};

export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "Semua field wajib diisi." });
    }

    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Format email tidak valid." });
    }

    const existing = await User.findOne({
      $or: [{ email }, { name: username }],
    });

    if (existing) {
      if (existing.email === email) {
        return res.status(409).json({ message: "Email sudah terdaftar." });
      }
      if (existing.name === username) {
        return res.status(409).json({ message: "Username sudah digunakan." });
      }
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: username,
      email,
      passwordHash,
      provider: "local",
    });

    res.status(201).json({
      message: "Registrasi berhasil.",
      accessToken: generateToken(user),
      refreshToken: generateRefreshToken(user),
      expiresIn: 900,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};


// login local
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Cek input
    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Email dan password wajib diisi." });
    }

    const user = await User.findOne({ name: username });

    // Tidak ditemukan
    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan." });
    }

    // Cek provider
    if (user.provider === "google") {
      return res.status(400).json({
        message: "Akun ini menggunakan Google Sign-In. Gunakan login Google.",
      });
    }

    // Cek password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: "Password salah." });
    }

    res.json({
      message: "Login berhasil.",
      accessToken: generateToken(user),
      refreshToken: generateRefreshToken(user),
      expiresIn: 900,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};

export const googleAuth = async (req, res) => {
  try {
    const { googleId, name, email, avatar } = req.body;

    if (!googleId || !email) {
      return res
        .status(400)
        .json({ message: "Google ID dan email diperlukan." });
    }

    // Apakah user sudah pernah login Google?
    let user = await User.findOne({ email });

    if (!user) {
      // Daftarkan user baru melalui Google
      user = await User.create({
        name,
        email,
        googleId,
        avatar,
        provider: "google",
        passwordHash: "google-oauth-no-password",
      });
    }

    const token = generateToken(user);

    res.json({
      message: "Login Google berhasil.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error("GOOGLE AUTH ERROR:", error);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};

// ========================
// GET USER PROFILE (PROTECTED)
// ========================
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-passwordHash");

    res.json({ user });
  } catch (error) {
    console.error("PROFILE ERROR:", error);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};
