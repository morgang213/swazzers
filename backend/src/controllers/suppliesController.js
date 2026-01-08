const db = require('../config/database');

/**
 * List supplies with filters
 */
async function listSupplies(req, res, next) {
  try {
    const { category, search, active = 'true' } = req.query;
    const agencyId = req.user.agencyId;

    let query = db('supplies as s')
      .leftJoin('supply_categories as sc', 's.category_id', 'sc.id')
      .where('s.agency_id', agencyId)
      .select(
        's.*',
        'sc.name as category_name'
      )
      .orderBy('s.name');

    if (active !== 'all') {
      query = query.where('s.active', active === 'true');
    }

    if (category) {
      query = query.where('s.category_id', category);
    }

    if (search) {
      query = query.where(function() {
        this.where('s.name', 'ilike', `%${search}%`)
          .orWhere('s.sku', 'ilike', `%${search}%`)
          .orWhere('s.manufacturer', 'ilike', `%${search}%`);
      });
    }

    const supplies = await query;

    res.json({ supplies });
  } catch (error) {
    next(error);
  }
}

/**
 * Get supply by ID
 */
async function getSupply(req, res, next) {
  try {
    const { id } = req.params;
    const agencyId = req.user.agencyId;

    const supply = await db('supplies as s')
      .leftJoin('supply_categories as sc', 's.category_id', 'sc.id')
      .where({ 's.id': id, 's.agency_id': agencyId })
      .select(
        's.*',
        'sc.name as category_name'
      )
      .first();

    if (!supply) {
      return res.status(404).json({ error: 'Supply not found' });
    }

    res.json({ supply });
  } catch (error) {
    next(error);
  }
}

/**
 * Create supply
 */
async function createSupply(req, res, next) {
  try {
    const agencyId = req.user.agencyId;
    const {
      category_id,
      name,
      description,
      sku,
      manufacturer,
      unit_of_measure,
      unit_cost,
      default_par_level,
      tracks_expiration
    } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Supply name is required' });
    }

    const [supplyId] = await db('supplies')
      .insert({
        agency_id: agencyId,
        category_id,
        name,
        description,
        sku,
        manufacturer,
        unit_of_measure: unit_of_measure || 'each',
        unit_cost: unit_cost || 0,
        default_par_level: default_par_level || 0,
        tracks_expiration: tracks_expiration || false,
        active: true
      })
      .returning('id');

    const supply = await db('supplies')
      .where({ id: supplyId })
      .first();

    res.status(201).json({ supply });
  } catch (error) {
    next(error);
  }
}

/**
 * Update supply
 */
async function updateSupply(req, res, next) {
  try {
    const { id } = req.params;
    const agencyId = req.user.agencyId;
    const updateData = { ...req.body };
    
    delete updateData.id;
    delete updateData.agency_id;

    const updated = await db('supplies')
      .where({ id, agency_id: agencyId })
      .update({
        ...updateData,
        updated_at: db.fn.now()
      });

    if (!updated) {
      return res.status(404).json({ error: 'Supply not found' });
    }

    const supply = await db('supplies')
      .where({ id })
      .first();

    res.json({ supply });
  } catch (error) {
    next(error);
  }
}

/**
 * Deactivate supply
 */
async function deleteSupply(req, res, next) {
  try {
    const { id } = req.params;
    const agencyId = req.user.agencyId;

    const updated = await db('supplies')
      .where({ id, agency_id: agencyId })
      .update({ active: false, updated_at: db.fn.now() });

    if (!updated) {
      return res.status(404).json({ error: 'Supply not found' });
    }

    res.json({ message: 'Supply deactivated successfully' });
  } catch (error) {
    next(error);
  }
}

/**
 * List supply categories
 */
async function listCategories(req, res, next) {
  try {
    const agencyId = req.user.agencyId;

    const categories = await db('supply_categories')
      .where({ agency_id: agencyId, active: true })
      .orderBy('name');

    res.json({ categories });
  } catch (error) {
    next(error);
  }
}

/**
 * Create supply category
 */
async function createCategory(req, res, next) {
  try {
    const agencyId = req.user.agencyId;
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Category name is required' });
    }

    const [categoryId] = await db('supply_categories')
      .insert({
        agency_id: agencyId,
        name,
        description,
        active: true
      })
      .returning('id');

    const category = await db('supply_categories')
      .where({ id: categoryId })
      .first();

    res.status(201).json({ category });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listSupplies,
  getSupply,
  createSupply,
  updateSupply,
  deleteSupply,
  listCategories,
  createCategory
};
