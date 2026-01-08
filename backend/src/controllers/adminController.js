const db = require('../config/database');

/**
 * Get agency details
 */
async function getAgency(req, res, next) {
  try {
    const agencyId = req.user.agencyId;

    const agency = await db('agencies')
      .where({ id: agencyId })
      .first();

    if (!agency) {
      return res.status(404).json({ error: 'Agency not found' });
    }

    res.json({ agency });
  } catch (error) {
    next(error);
  }
}

/**
 * Update agency
 */
async function updateAgency(req, res, next) {
  try {
    const agencyId = req.user.agencyId;
    const updateData = { ...req.body };

    delete updateData.id;

    const updated = await db('agencies')
      .where({ id: agencyId })
      .update({
        ...updateData,
        updated_at: db.fn.now()
      });

    if (!updated) {
      return res.status(404).json({ error: 'Agency not found' });
    }

    const agency = await db('agencies')
      .where({ id: agencyId })
      .first();

    res.json({ agency });
  } catch (error) {
    next(error);
  }
}

/**
 * List stations
 */
async function listStations(req, res, next) {
  try {
    const agencyId = req.user.agencyId;

    const stations = await db('stations')
      .where({ agency_id: agencyId })
      .orderBy('name');

    // Get unit counts for each station
    const stationsWithCounts = await Promise.all(
      stations.map(async (station) => {
        const unitCount = await db('units')
          .where({ station_id: station.id, active: true })
          .count('* as count')
          .first();

        return {
          ...station,
          unit_count: parseInt(unitCount.count)
        };
      })
    );

    res.json({ stations: stationsWithCounts });
  } catch (error) {
    next(error);
  }
}

/**
 * Create station
 */
async function createStation(req, res, next) {
  try {
    const agencyId = req.user.agencyId;
    const { name, address, city, state, zip } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Station name is required' });
    }

    const [stationId] = await db('stations')
      .insert({
        agency_id: agencyId,
        name,
        address,
        city,
        state,
        zip,
        active: true
      })
      .returning('id');

    const station = await db('stations')
      .where({ id: stationId })
      .first();

    res.status(201).json({ station });
  } catch (error) {
    next(error);
  }
}

/**
 * Update station
 */
async function updateStation(req, res, next) {
  try {
    const { id } = req.params;
    const agencyId = req.user.agencyId;
    const updateData = { ...req.body };

    delete updateData.id;
    delete updateData.agency_id;

    const updated = await db('stations')
      .where({ id, agency_id: agencyId })
      .update({
        ...updateData,
        updated_at: db.fn.now()
      });

    if (!updated) {
      return res.status(404).json({ error: 'Station not found' });
    }

    const station = await db('stations')
      .where({ id })
      .first();

    res.json({ station });
  } catch (error) {
    next(error);
  }
}

/**
 * List units
 */
async function listUnits(req, res, next) {
  try {
    const agencyId = req.user.agencyId;

    const units = await db('units as u')
      .leftJoin('stations as s', 'u.station_id', 's.id')
      .where('u.agency_id', agencyId)
      .select(
        'u.*',
        's.name as station_name'
      )
      .orderBy('u.name');

    res.json({ units });
  } catch (error) {
    next(error);
  }
}

/**
 * Create unit
 */
async function createUnit(req, res, next) {
  try {
    const agencyId = req.user.agencyId;
    const { name, type, station_id, vehicle_id } = req.body;

    if (!name || !type) {
      return res.status(400).json({ error: 'Unit name and type are required' });
    }

    const [unitId] = await db('units')
      .insert({
        agency_id: agencyId,
        name,
        type,
        station_id,
        vehicle_id,
        active: true
      })
      .returning('id');

    const unit = await db('units')
      .where({ id: unitId })
      .first();

    res.status(201).json({ unit });
  } catch (error) {
    next(error);
  }
}

/**
 * Update unit
 */
async function updateUnit(req, res, next) {
  try {
    const { id } = req.params;
    const agencyId = req.user.agencyId;
    const updateData = { ...req.body };

    delete updateData.id;
    delete updateData.agency_id;

    const updated = await db('units')
      .where({ id, agency_id: agencyId })
      .update({
        ...updateData,
        updated_at: db.fn.now()
      });

    if (!updated) {
      return res.status(404).json({ error: 'Unit not found' });
    }

    const unit = await db('units')
      .where({ id })
      .first();

    res.json({ unit });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAgency,
  updateAgency,
  listStations,
  createStation,
  updateStation,
  listUnits,
  createUnit,
  updateUnit
};
