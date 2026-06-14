import createHttpError from "../utils/createHttpError.js";

const requireAdmin = (req, _res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return next(createHttpError(403, "Admin access required"));
  }

  return next();
};

export default requireAdmin;
