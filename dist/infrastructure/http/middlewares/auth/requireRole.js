"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = requireRole;
function requireRole(...roles) {
    return (req, res, next) => {
        const role = req.auth?.role;
        if (!role)
            return res.status(401).json({ error: "UNAUTHORIZED" });
        if (!roles.includes(role))
            return res.status(403).json({ error: "FORBIDDEN" });
        return next();
    };
}
