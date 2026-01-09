"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middlewares/authMiddleware");
const promotionController_1 = require("../controllers/promotionController");
const publicPromotionsController_1 = require("../controllers/publicPromotionsController");
const router = express_1.default.Router();
// Public: Active promotions
router.get("/active", publicPromotionsController_1.listActivePromotionsController);
router.get("/", authMiddleware_1.authRequired, authMiddleware_1.isAdmin, promotionController_1.listPromotionsController);
router.post("/", authMiddleware_1.authRequired, authMiddleware_1.isAdmin, promotionController_1.createPromotionController);
router.get("/:promotionId", authMiddleware_1.authRequired, authMiddleware_1.isAdmin, promotionController_1.getPromotionController);
router.put("/:promotionId", authMiddleware_1.authRequired, authMiddleware_1.isAdmin, promotionController_1.updatePromotionController);
router.put("/:promotionId/toggle", authMiddleware_1.authRequired, authMiddleware_1.isAdmin, promotionController_1.togglePromotionController);
router.put("/:promotionId/products", authMiddleware_1.authRequired, authMiddleware_1.isAdmin, promotionController_1.assignPromotionToProductsController);
router.put("/:promotionId/brands", authMiddleware_1.authRequired, authMiddleware_1.isAdmin, promotionController_1.assignPromotionToBrandsController);
router.put("/:promotionId/categories", authMiddleware_1.authRequired, authMiddleware_1.isAdmin, promotionController_1.assignPromotionToCategoriesController);
exports.default = router;
