import express from "express";
import { dataBuildingById, listBuildings } from "../controllers/buildingController-sample.js"; // sample call from controller //

// import all the controller bellow here //


const router = express.Router(); // do not delete //

router.get("/buildings", listBuildings); // sample route //

// router.{Method "get","put", "delete", "post"}("{API Route Directory}", {Controller Function}); [follow this method] //

router.get("/buildings/:id", dataBuildingById); // sample route //

// list all the routes bellow here //

export default router; // do not delete //



