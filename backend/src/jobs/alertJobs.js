const cron = require('node-cron');
const { differenceInDays } = require('date-fns');
const db = require('../config/database');
const logger = require('../utils/logger');

/**
 * Generate alerts for expiring items
 */
async function generateExpiringAlerts() {
  try {
    logger.info('Running expiring items alert job...');

    const today = new Date();
    const agencies = await db('agencies').where({ active: true });

    for (const agency of agencies) {
      const settings = typeof agency.settings === 'string' 
        ? JSON.parse(agency.settings) 
        : agency.settings;
      
      const alertDays = settings?.alert_expiring_days || [30, 60, 90];

      // Get expiring items
      for (const days of alertDays) {
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + days);

        const expiringItems = await db('inventory_records as ir')
          .join('supplies as s', 'ir.supply_id', 's.id')
          .where('ir.agency_id', agency.id)
          .where('s.tracks_expiration', true)
          .whereNotNull('ir.expiration_date')
          .whereBetween('ir.expiration_date', [today, expirationDate])
          .select('ir.*', 's.name as supply_name');

        for (const item of expiringItems) {
          const daysUntil = differenceInDays(new Date(item.expiration_date), today);
          
          // Check if alert already exists for this item
          const existingAlert = await db('alerts')
            .where({
              agency_id: agency.id,
              supply_id: item.supply_id,
              location_type: item.location_type,
              location_id: item.location_id,
              type: daysUntil < 0 ? 'expired' : 'expiring'
            })
            .where('created_at', '>', new Date(Date.now() - 24 * 60 * 60 * 1000))
            .first();

          if (!existingAlert) {
            const severity = daysUntil < 0 ? 'critical' : daysUntil <= 30 ? 'critical' : daysUntil <= 60 ? 'warning' : 'info';
            const type = daysUntil < 0 ? 'expired' : 'expiring';
            
            await db('alerts').insert({
              agency_id: agency.id,
              type,
              severity,
              title: `${type === 'expired' ? 'Expired' : 'Expiring'}: ${item.supply_name}`,
              message: `${item.supply_name} ${type === 'expired' ? 'has expired' : `expires in ${daysUntil} days`}`,
              supply_id: item.supply_id,
              location_type: item.location_type,
              location_id: item.location_id,
              is_read: false,
              is_dismissed: false
            });
          }
        }
      }

      // Generate low stock alerts
      const lowStockItems = await db('inventory_records as ir')
        .join('supplies as s', 'ir.supply_id', 's.id')
        .where('ir.agency_id', agency.id)
        .whereRaw('ir.quantity < ir.par_level')
        .select('ir.*', 's.name as supply_name');

      for (const item of lowStockItems) {
        const existingAlert = await db('alerts')
          .where({
            agency_id: agency.id,
            supply_id: item.supply_id,
            location_type: item.location_type,
            location_id: item.location_id,
            type: item.quantity === 0 ? 'out_of_stock' : 'below_par'
          })
          .where('created_at', '>', new Date(Date.now() - 24 * 60 * 60 * 1000))
          .first();

        if (!existingAlert) {
          const type = item.quantity === 0 ? 'out_of_stock' : 'below_par';
          const severity = item.quantity === 0 ? 'critical' : 'warning';

          await db('alerts').insert({
            agency_id: agency.id,
            type,
            severity,
            title: `${type === 'out_of_stock' ? 'Out of Stock' : 'Below Par'}: ${item.supply_name}`,
            message: `${item.supply_name} is ${type === 'out_of_stock' ? 'out of stock' : `below par level (${item.quantity}/${item.par_level})`}`,
            supply_id: item.supply_id,
            location_type: item.location_type,
            location_id: item.location_id,
            is_read: false,
            is_dismissed: false
          });
        }
      }
    }

    logger.info('Expiring items alert job completed');
  } catch (error) {
    logger.error('Error in alert generation job:', error);
  }
}

/**
 * Schedule alert generation job to run daily at 6 AM
 */
function scheduleAlertJobs() {
  // Run every day at 6:00 AM
  cron.schedule('0 6 * * *', generateExpiringAlerts);
  
  logger.info('Alert generation job scheduled for 6:00 AM daily');
}

module.exports = {
  generateExpiringAlerts,
  scheduleAlertJobs
};
