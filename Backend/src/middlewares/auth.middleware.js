const redis = require("../db/cache");
const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");

const authSeller = async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const isBlackListed = await redis.get(`blacklsit:${token}`);
  if (isBlackListed) return res.status(401).json({ message: "Unauthorized" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    let user = await redis.get(`user:${decoded.id}`);
    if (!user) {
      user = await userModel.findById({ id: decoded.id });
      await redis.set("user:" + user._id, user);
    }
    if (user.role !== "seller") {
      return res.status(403).json({ message: "Forbidden" });
    }

    req.seller = user;

    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};

const authUser = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: "Unauthorized" });
  const isBlackListed = await redis.get(`blacklsit:${token}`);
  if (isBlackListed) return res.status(401).json({ message: "Unauthorized" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    let user = await redis.get(`user:${decoded.id}`);
    if (!user) {
      user = await userModel.findById({ id: decoded.id });
      await redis.set("user:" + user._id, user);
    }
    if (!user) return res.status(401).json({ message: "Unauthorized" });
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};

module.exports = { authSeller, authUser };
