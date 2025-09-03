import express from "express";
import { dataBuildingById, listBuildings } from "../controllers/buildingController-sample.js"; // sample call from controller //
import { getCategoryMenu } from "../controllers/categoryController.js";
import { getDocumentPreview } from "../controllers/documentController.js";
import { updateDocument } from "../controllers/documentController.js";
// import all the controller bellow here //


const router = express.Router(); // do not delete //

router.get("/buildings", listBuildings); // sample route //

// router.{Method "get","put", "delete", "post"}("{API Route Directory}", {Controller Function}); [follow this method] //

router.get("/buildings/:id", dataBuildingById); // sample route //

// list all the routes bellow here //

router.get("/menu", getCategoryMenu);
router.get("/docs/:idOrSlug", getDocumentPreview);
router.put("/docs/:idOrSlug", updateDocument); // 👈 add this

export default router; // do not delete //



