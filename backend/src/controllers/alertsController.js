const db = require('../config/database');

/**
 * List alerts
 */
async function listAlerts(req, res, next) {
  try {
    const agencyId = req.user.agencyId;
    const { is_read, severity, type } = req.query;

    let query = db('alerts as a')
      .leftJoin('supplies as s', 'a.supply_id', 's.id')
      .where('a.agency_id', agencyId)
      .where('a.is_dismissed', false)
      .select(
        'a.*',
        's.name as supply_name',
        's.sku'
      )
      .orderBy('a.created_at', 'desc');

    if (is_read !== undefined) {
      query = query.where('a.is_read', is_read === 'true');
    }

    if (severity) {
      query = query.where('a.severity', severity);
    }

    if (type) {
      query = query.where('a.type', type);
    }

    const alerts = await query;

    res.json({ alerts });
  } catch (error) {
    next(error);
  }
}

/**
 * Mark alert as read
 */
async function markAlertRead(req, res, next) {
  try {
    const { id } = req.params;
    const agencyId = req.user.agencyId;

    const updated = await db('alerts')
      .where({ id, agency_id: agencyId })
      .update({
        is_read: true,
        updated_at: db.fn.now()
      });

    if (!updated) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    res.json({ message: 'Alert marked as read' });
  } catch (error) {
    next(error);
  }
}

/**
 * Dismiss alert
 */
async function dismissAlert(req, res, next) {
  try {
    const { id } = req.params;
    const agencyId = req.user.agencyId;

    const updated = await db('alerts')
      .where({ id, agency_id: agencyId })
      .update({
        is_dismissed: true,
        updated_at: db.fn.now()
      });

    if (!updated) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    res.json({ message: 'Alert dismissed' });
  } catch (error) {
    next(error);
  }
}

/**
 * Mark all alerts as read
 */
async function markAllRead(req, res, next) {
  try {
    const agencyId = req.user.agencyId;

    await db('alerts')
      .where({ agency_id: agencyId, is_read: false })
      .update({
        is_read: true,
        updated_at: db.fn.now()
      });

    res.json({ message: 'All alerts marked as read' });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listAlerts,
  markAlertRead,
  dismissAlert,
  markAllRead
};
