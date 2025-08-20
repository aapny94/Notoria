import { fetchBuildingsWithDeviceTotal, getBuildingById } from "../models/buildingModel-sample.js";

export async function listBuildings(req, res, next) {
  try {
    const buildings = await fetchBuildingsWithDeviceTotal();
    res.json(buildings);
  } catch (err) {
    next(err);                // forward to error handler middleware
  }
}

export async function dataBuildingById(req, res, next) {
  const { id } = req.params;
  try {
    const building = await getBuildingById(id);
    if (!building) {
      return res.status(404).json({ error: "Building not found" });
    }
    res.json(building);
  } catch (err) {
    next(err);                // forward to error handler middleware
  }
}