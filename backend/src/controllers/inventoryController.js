const db = require('../config/database');
const { differenceInDays } = require('date-fns');

/**
 * Calculate inventory status based on quantity and par level
 */
function calculateInventoryStatus(quantity, parLevel) {
  if (quantity === 0) return 'out_of_stock';
  if (quantity <= parLevel * 0.25) return 'critical';
  if (quantity < parLevel) return 'below_par';
  return 'ok';
}

/**
 * Calculate expiration status
 */
function calculateExpirationStatus(expirationDate) {
  if (!expirationDate) return 'ok';
  
  const daysUntil = differenceInDays(new Date(expirationDate), new Date());
  
  if (daysUntil < 0) return 'expired';
  if (daysUntil <= 30) return 'critical';
  if (daysUntil <= 60) return 'warning';
  if (daysUntil <= 90) return 'soon';
  return 'ok';
}

/**
 * Get unit inventory
 */
async function getUnitInventory(req, res, next) {
  try {
    const { unitId } = req.params;
    const agencyId = req.user.agencyId;

    // Verify unit belongs to agency
    const unit = await db('units')
      .where({ id: unitId, agency_id: agencyId })
      .first();

    if (!unit) {
      return res.status(404).json({ error: 'Unit not found' });
    }

    const inventory = await db('inventory_records as ir')
      .join('supplies as s', 'ir.supply_id', 's.id')
      .leftJoin('supply_categories as sc', 's.category_id', 'sc.id')
      .where({
        'ir.agency_id': agencyId,
        'ir.location_type': 'unit',
        'ir.location_id': unitId
      })
      .select(
        'ir.*',
        's.name as supply_name',
        's.sku',
        's.unit_of_measure',
        's.tracks_expiration',
        'sc.name as category_name'
      )
      .orderBy('s.name');

    // Add calculated statuses
    const inventoryWithStatus = inventory.map(item => ({
      ...item,
      inventory_status: calculateInventoryStatus(item.quantity, item.par_level),
      expiration_status: calculateExpirationStatus(item.expiration_date)
    }));

    res.json({ 
      unit,
      inventory: inventoryWithStatus 
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get station inventory
 */
async function getStationInventory(req, res, next) {
  try {
    const { stationId } = req.params;
    const agencyId = req.user.agencyId;

    // Verify station belongs to agency
    const station = await db('stations')
      .where({ id: stationId, agency_id: agencyId })
      .first();

    if (!station) {
      return res.status(404).json({ error: 'Station not found' });
    }

    const inventory = await db('inventory_records as ir')
      .join('supplies as s', 'ir.supply_id', 's.id')
      .leftJoin('supply_categories as sc', 's.category_id', 'sc.id')
      .where({
        'ir.agency_id': agencyId,
        'ir.location_type': 'station',
        'ir.location_id': stationId
      })
      .select(
        'ir.*',
        's.name as supply_name',
        's.sku',
        's.unit_of_measure',
        's.tracks_expiration',
        'sc.name as category_name'
      )
      .orderBy('s.name');

    // Add calculated statuses
    const inventoryWithStatus = inventory.map(item => ({
      ...item,
      inventory_status: calculateInventoryStatus(item.quantity, item.par_level),
      expiration_status: calculateExpirationStatus(item.expiration_date)
    }));

    res.json({ 
      station,
      inventory: inventoryWithStatus 
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get all inventory summary
 */
async function getAllInventory(req, res, next) {
  try {
    const agencyId = req.user.agencyId;

    const inventory = await db('inventory_records as ir')
      .join('supplies as s', 'ir.supply_id', 's.id')
      .leftJoin('supply_categories as sc', 's.category_id', 'sc.id')
      .where('ir.agency_id', agencyId)
      .select(
        's.id as supply_id',
        's.name as supply_name',
        's.sku',
        'sc.name as category_name',
        db.raw('SUM(ir.quantity) as total_quantity'),
        db.raw('SUM(ir.par_level) as total_par_level')
      )
      .groupBy('s.id', 's.name', 's.sku', 'sc.name')
      .orderBy('s.name');

    res.json({ inventory });
  } catch (error) {
    next(error);
  }
}

/**
 * Record usage
 */
async function recordUsage(req, res, next) {
  try {
    const agencyId = req.user.agencyId;
    const userId = req.user.id;
    const { items, location_type, location_id, incident_number, usage_type, notes } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Items array is required' });
    }

    if (!location_type || !location_id) {
      return res.status(400).json({ error: 'Location is required' });
    }

    await db.transaction(async (trx) => {
      for (const item of items) {
        const { supply_id, quantity } = item;

        if (!supply_id || !quantity || quantity <= 0) {
          throw new Error('Invalid item data');
        }

        // Update inventory
        const inventoryRecord = await trx('inventory_records')
          .where({
            agency_id: agencyId,
            supply_id,
            location_type,
            location_id
          })
          .first();

        if (!inventoryRecord) {
          throw new Error(`Inventory record not found for supply ${supply_id}`);
        }

        if (inventoryRecord.quantity < quantity) {
          const supply = await trx('supplies').where({ id: supply_id }).first();
          throw new Error(`Insufficient quantity for ${supply.name}`);
        }

        await trx('inventory_records')
          .where({ id: inventoryRecord.id })
          .update({
            quantity: inventoryRecord.quantity - quantity,
            updated_at: trx.fn.now()
          });

        // Record transaction
        await trx('transactions').insert({
          agency_id: agencyId,
          supply_id,
          user_id: userId,
          transaction_type: 'usage',
          quantity: -quantity,
          location_type,
          location_id,
          usage_type: usage_type || 'patient_care',
          incident_number,
          notes
        });
      }
    });

    res.json({ message: 'Usage recorded successfully' });
  } catch (error) {
    next(error);
  }
}

/**
 * Adjust inventory quantity
 */
async function adjustInventory(req, res, next) {
  try {
    const agencyId = req.user.agencyId;
    const userId = req.user.id;
    const { supply_id, location_type, location_id, quantity, notes } = req.body;

    if (!supply_id || !location_type || !location_id) {
      return res.status(400).json({ error: 'Supply and location are required' });
    }

    await db.transaction(async (trx) => {
      const inventoryRecord = await trx('inventory_records')
        .where({
          agency_id: agencyId,
          supply_id,
          location_type,
          location_id
        })
        .first();

      if (!inventoryRecord) {
        throw new Error('Inventory record not found');
      }

      const adjustment = quantity - inventoryRecord.quantity;

      await trx('inventory_records')
        .where({ id: inventoryRecord.id })
        .update({
          quantity,
          updated_at: trx.fn.now()
        });

      // Record transaction
      await trx('transactions').insert({
        agency_id: agencyId,
        supply_id,
        user_id: userId,
        transaction_type: 'adjustment',
        quantity: adjustment,
        location_type,
        location_id,
        notes
      });
    });

    res.json({ message: 'Inventory adjusted successfully' });
  } catch (error) {
    next(error);
  }
}

/**
 * Get expiring items
 */
async function getExpiringItems(req, res, next) {
  try {
    const agencyId = req.user.agencyId;
    const { days = 90 } = req.query;

    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + parseInt(days));

    const expiring = await db('inventory_records as ir')
      .join('supplies as s', 'ir.supply_id', 's.id')
      .where('ir.agency_id', agencyId)
      .where('s.tracks_expiration', true)
      .whereNotNull('ir.expiration_date')
      .where('ir.expiration_date', '<=', expirationDate)
      .select(
        'ir.*',
        's.name as supply_name',
        's.sku'
      )
      .orderBy('ir.expiration_date');

    const expiringWithStatus = expiring.map(item => ({
      ...item,
      expiration_status: calculateExpirationStatus(item.expiration_date),
      days_until_expiration: differenceInDays(new Date(item.expiration_date), new Date())
    }));

    res.json({ expiring: expiringWithStatus });
  } catch (error) {
    next(error);
  }
}

/**
 * Get items below par
 */
async function getBelowPar(req, res, next) {
  try {
    const agencyId = req.user.agencyId;

    const belowPar = await db('inventory_records as ir')
      .join('supplies as s', 'ir.supply_id', 's.id')
      .where('ir.agency_id', agencyId)
      .whereRaw('ir.quantity < ir.par_level')
      .select(
        'ir.*',
        's.name as supply_name',
        's.sku',
        's.unit_cost'
      )
      .orderBy('s.name');

    const belowParWithStatus = belowPar.map(item => ({
      ...item,
      inventory_status: calculateInventoryStatus(item.quantity, item.par_level),
      deficit: item.par_level - item.quantity
    }));

    res.json({ belowPar: belowParWithStatus });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getUnitInventory,
  getStationInventory,
  getAllInventory,
  recordUsage,
  adjustInventory,
  getExpiringItems,
  getBelowPar
};
