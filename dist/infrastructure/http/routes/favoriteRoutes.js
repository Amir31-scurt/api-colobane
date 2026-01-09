"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const favoritesController_1 = require("../controllers/favoritesController");
const requireAuth_1 = require("../middlewares/auth/requireAuth");
const router = (0, express_1.Router)();
router.post('/toggle', requireAuth_1.requireAuth, favoritesController_1.toggleFavorite);
router.get('/', requireAuth_1.requireAuth, favoritesController_1.getFavorites);
exports.default = router;
