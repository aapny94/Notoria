import pool from '../config/db.js';

/** Returns every building with a device count */
export async function fetchBuildingsWithDeviceTotal() {
  const sql = `
    SELECT
      b.id,
      b.name,
      b.location,
      COALESCE(COUNT(d.id), 0)::INT  AS "deviceTotal"
    FROM building b
    LEFT JOIN device d ON d.building_id = b.id
    GROUP BY b.id
    ORDER BY b.id;
  `;

  const { rows } = await pool.query(sql);
  return rows;
};


export const getBuildingById = async (id) => {
  const { rows } = await pool.query('SELECT * FROM building WHERE id = $1', [id]);
  return rows[0];
};