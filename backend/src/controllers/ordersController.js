const db = require('../config/database');

/**
 * List orders
 */
async function listOrders(req, res, next) {
  try {
    const agencyId = req.user.agencyId;
    const { status } = req.query;

    let query = db('orders as o')
      .leftJoin('users as u', 'o.created_by', 'u.id')
      .where('o.agency_id', agencyId)
      .select(
        'o.*',
        'u.first_name as created_by_first_name',
        'u.last_name as created_by_last_name'
      )
      .orderBy('o.created_at', 'desc');

    if (status) {
      query = query.where('o.status', status);
    }

    const orders = await query;

    res.json({ orders });
  } catch (error) {
    next(error);
  }
}

/**
 * Get order by ID with items
 */
async function getOrder(req, res, next) {
  try {
    const { id } = req.params;
    const agencyId = req.user.agencyId;

    const order = await db('orders')
      .where({ id, agency_id: agencyId })
      .first();

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const items = await db('order_items as oi')
      .join('supplies as s', 'oi.supply_id', 's.id')
      .where('oi.order_id', id)
      .select(
        'oi.*',
        's.name as supply_name',
        's.sku',
        's.unit_of_measure'
      );

    res.json({ 
      order: {
        ...order,
        items
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Create order
 */
async function createOrder(req, res, next) {
  try {
    const agencyId = req.user.agencyId;
    const userId = req.user.id;
    const { vendor, notes, items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Order must have at least one item' });
    }

    const result = await db.transaction(async (trx) => {
      // Generate order number
      const orderCount = await trx('orders')
        .where('agency_id', agencyId)
        .count('* as count')
        .first();
      
      const orderNumber = `ORD-${new Date().getFullYear()}-${String(parseInt(orderCount.count) + 1).padStart(5, '0')}`;

      // Create order
      const [orderId] = await trx('orders')
        .insert({
          agency_id: agencyId,
          order_number: orderNumber,
          status: 'draft',
          created_by: userId,
          vendor,
          notes,
          total_cost: 0
        })
        .returning('id');

      // Add order items and calculate total
      let totalCost = 0;
      for (const item of items) {
        const { supply_id, quantity_ordered, unit_cost } = item;
        const itemTotal = quantity_ordered * (unit_cost || 0);
        totalCost += itemTotal;

        await trx('order_items').insert({
          order_id: orderId,
          supply_id,
          quantity_ordered,
          quantity_received: 0,
          unit_cost: unit_cost || 0,
          total_cost: itemTotal
        });
      }

      // Update order total
      await trx('orders')
        .where({ id: orderId })
        .update({ total_cost: totalCost });

      return orderId;
    });

    const order = await db('orders')
      .where({ id: result })
      .first();

    res.status(201).json({ order });
  } catch (error) {
    next(error);
  }
}

/**
 * Update order
 */
async function updateOrder(req, res, next) {
  try {
    const { id } = req.params;
    const agencyId = req.user.agencyId;
    const updateData = { ...req.body };

    delete updateData.id;
    delete updateData.agency_id;
    delete updateData.order_number;

    const updated = await db('orders')
      .where({ id, agency_id: agencyId, status: 'draft' })
      .update({
        ...updateData,
        updated_at: db.fn.now()
      });

    if (!updated) {
      return res.status(404).json({ error: 'Order not found or cannot be updated' });
    }

    const order = await db('orders')
      .where({ id })
      .first();

    res.json({ order });
  } catch (error) {
    next(error);
  }
}

/**
 * Submit order for approval
 */
async function submitOrder(req, res, next) {
  try {
    const { id } = req.params;
    const agencyId = req.user.agencyId;

    const updated = await db('orders')
      .where({ id, agency_id: agencyId, status: 'draft' })
      .update({
        status: 'submitted',
        order_date: new Date(),
        updated_at: db.fn.now()
      });

    if (!updated) {
      return res.status(404).json({ error: 'Order not found or already submitted' });
    }

    const order = await db('orders')
      .where({ id })
      .first();

    res.json({ order });
  } catch (error) {
    next(error);
  }
}

/**
 * Approve order (admin only)
 */
async function approveOrder(req, res, next) {
  try {
    const { id } = req.params;
    const agencyId = req.user.agencyId;
    const userId = req.user.id;

    const updated = await db('orders')
      .where({ id, agency_id: agencyId, status: 'submitted' })
      .update({
        status: 'approved',
        approved_by: userId,
        updated_at: db.fn.now()
      });

    if (!updated) {
      return res.status(404).json({ error: 'Order not found or not in submitted status' });
    }

    const order = await db('orders')
      .where({ id })
      .first();

    res.json({ order });
  } catch (error) {
    next(error);
  }
}

/**
 * Receive order items
 */
async function receiveOrder(req, res, next) {
  try {
    const { id } = req.params;
    const agencyId = req.user.agencyId;
    const userId = req.user.id;
    const { items, location_type, location_id } = req.body;

    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ error: 'Items array is required' });
    }

    if (!location_type || !location_id) {
      return res.status(400).json({ error: 'Receiving location is required' });
    }

    await db.transaction(async (trx) => {
      const order = await trx('orders')
        .where({ id, agency_id: agencyId })
        .first();

      if (!order) {
        throw new Error('Order not found');
      }

      for (const item of items) {
        const { order_item_id, quantity_received } = item;

        if (!order_item_id || !quantity_received || quantity_received <= 0) {
          throw new Error('Invalid item data');
        }

        // Update order item
        const orderItem = await trx('order_items')
          .where({ id: order_item_id, order_id: id })
          .first();

        if (!orderItem) {
          throw new Error(`Order item ${order_item_id} not found`);
        }

        const newQuantityReceived = orderItem.quantity_received + quantity_received;

        await trx('order_items')
          .where({ id: order_item_id })
          .update({
            quantity_received: newQuantityReceived,
            updated_at: trx.fn.now()
          });

        // Update inventory
        const inventoryRecord = await trx('inventory_records')
          .where({
            agency_id: agencyId,
            supply_id: orderItem.supply_id,
            location_type,
            location_id
          })
          .first();

        if (inventoryRecord) {
          await trx('inventory_records')
            .where({ id: inventoryRecord.id })
            .update({
              quantity: inventoryRecord.quantity + quantity_received,
              updated_at: trx.fn.now()
            });
        } else {
          await trx('inventory_records').insert({
            agency_id: agencyId,
            supply_id: orderItem.supply_id,
            location_type,
            location_id,
            quantity: quantity_received,
            par_level: 0
          });
        }

        // Record transaction
        await trx('transactions').insert({
          agency_id: agencyId,
          supply_id: orderItem.supply_id,
          user_id: userId,
          transaction_type: 'receive',
          quantity: quantity_received,
          location_type,
          location_id,
          notes: `Received from order ${order.order_number}`
        });
      }

      // Check if order is fully received
      const allItems = await trx('order_items')
        .where({ order_id: id })
        .select('quantity_ordered', 'quantity_received');

      const fullyReceived = allItems.every(
        item => item.quantity_received >= item.quantity_ordered
      );

      const partiallyReceived = allItems.some(
        item => item.quantity_received > 0
      );

      let newStatus = order.status;
      if (fullyReceived) {
        newStatus = 'received';
      } else if (partiallyReceived) {
        newStatus = 'partial';
      }

      await trx('orders')
        .where({ id })
        .update({
          status: newStatus,
          received_date: fullyReceived ? new Date() : null,
          updated_at: trx.fn.now()
        });
    });

    const order = await db('orders')
      .where({ id })
      .first();

    res.json({ order });
  } catch (error) {
    next(error);
  }
}

/**
 * Cancel order
 */
async function cancelOrder(req, res, next) {
  try {
    const { id } = req.params;
    const agencyId = req.user.agencyId;

    const updated = await db('orders')
      .where({ id, agency_id: agencyId })
      .whereIn('status', ['draft', 'submitted'])
      .update({
        status: 'cancelled',
        updated_at: db.fn.now()
      });

    if (!updated) {
      return res.status(404).json({ error: 'Order not found or cannot be cancelled' });
    }

    res.json({ message: 'Order cancelled successfully' });
  } catch (error) {
    next(error);
  }
}

/**
 * Generate reorder list based on items below par
 */
async function getReorderList(req, res, next) {
  try {
    const agencyId = req.user.agencyId;

    const belowPar = await db('inventory_records as ir')
      .join('supplies as s', 'ir.supply_id', 's.id')
      .where('ir.agency_id', agencyId)
      .whereRaw('ir.quantity < ir.par_level')
      .select(
        's.id as supply_id',
        's.name as supply_name',
        's.sku',
        's.unit_cost',
        db.raw('SUM(ir.par_level - ir.quantity) as total_needed'),
        db.raw('SUM(ir.par_level - ir.quantity) * s.unit_cost as estimated_cost')
      )
      .groupBy('s.id', 's.name', 's.sku', 's.unit_cost')
      .orderBy('estimated_cost', 'desc');

    const totalEstimatedCost = belowPar.reduce((sum, item) => sum + parseFloat(item.estimated_cost || 0), 0);

    res.json({
      items: belowPar,
      total_estimated_cost: totalEstimatedCost
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listOrders,
  getOrder,
  createOrder,
  updateOrder,
  submitOrder,
  approveOrder,
  receiveOrder,
  cancelOrder,
  getReorderList
};
