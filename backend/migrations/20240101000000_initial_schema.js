/**
 * Initial database schema migration
 * Creates all core tables for the EMS Supply Tracker application
 */

exports.up = async function(knex) {
  // Create agencies table
  await knex.schema.createTable('agencies', (table) => {
    table.increments('id').primary();
    table.string('name', 255).notNullable();
    table.string('address', 500);
    table.string('city', 100);
    table.string('state', 2);
    table.string('zip', 10);
    table.string('phone', 20);
    table.string('email', 255);
    table.jsonb('settings').defaultTo('{}');
    table.boolean('active').defaultTo(true);
    table.timestamps(true, true);
  });

  // Create users table
  await knex.schema.createTable('users', (table) => {
    table.increments('id').primary();
    table.integer('agency_id').unsigned().notNullable()
      .references('id').inTable('agencies').onDelete('CASCADE');
    table.string('email', 255).notNullable();
    table.string('password_hash', 255).notNullable();
    table.string('first_name', 100).notNullable();
    table.string('last_name', 100).notNullable();
    table.enum('role', ['admin', 'supervisor', 'medic']).notNullable();
    table.string('phone', 20);
    table.string('reset_token', 255);
    table.timestamp('reset_token_expires');
    table.boolean('active').defaultTo(true);
    table.timestamps(true, true);
    
    table.unique(['agency_id', 'email']);
  });

  // Create refresh_tokens table
  await knex.schema.createTable('refresh_tokens', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable()
      .references('id').inTable('users').onDelete('CASCADE');
    table.string('token', 500).notNullable().unique();
    table.timestamp('expires_at').notNullable();
    table.timestamps(true, true);
  });

  // Create stations table
  await knex.schema.createTable('stations', (table) => {
    table.increments('id').primary();
    table.integer('agency_id').unsigned().notNullable()
      .references('id').inTable('agencies').onDelete('CASCADE');
    table.string('name', 255).notNullable();
    table.string('address', 500);
    table.string('city', 100);
    table.string('state', 2);
    table.string('zip', 10);
    table.boolean('active').defaultTo(true);
    table.timestamps(true, true);
  });

  // Create units table
  await knex.schema.createTable('units', (table) => {
    table.increments('id').primary();
    table.integer('agency_id').unsigned().notNullable()
      .references('id').inTable('agencies').onDelete('CASCADE');
    table.integer('station_id').unsigned()
      .references('id').inTable('stations').onDelete('SET NULL');
    table.string('name', 100).notNullable();
    table.enum('type', ['als', 'bls', 'supervisor', 'fly_car', 'other']).notNullable();
    table.string('vehicle_id', 50);
    table.boolean('active').defaultTo(true);
    table.timestamps(true, true);
  });

  // Create supply_categories table
  await knex.schema.createTable('supply_categories', (table) => {
    table.increments('id').primary();
    table.integer('agency_id').unsigned().notNullable()
      .references('id').inTable('agencies').onDelete('CASCADE');
    table.string('name', 255).notNullable();
    table.text('description');
    table.boolean('active').defaultTo(true);
    table.timestamps(true, true);
  });

  // Create supplies table
  await knex.schema.createTable('supplies', (table) => {
    table.increments('id').primary();
    table.integer('agency_id').unsigned().notNullable()
      .references('id').inTable('agencies').onDelete('CASCADE');
    table.integer('category_id').unsigned()
      .references('id').inTable('supply_categories').onDelete('SET NULL');
    table.string('name', 255).notNullable();
    table.text('description');
    table.string('sku', 100);
    table.string('manufacturer', 255);
    table.string('unit_of_measure', 50).defaultTo('each');
    table.decimal('unit_cost', 10, 2).defaultTo(0);
    table.integer('default_par_level').defaultTo(0);
    table.boolean('tracks_expiration').defaultTo(false);
    table.boolean('active').defaultTo(true);
    table.timestamps(true, true);
  });

  // Create inventory_records table
  await knex.schema.createTable('inventory_records', (table) => {
    table.increments('id').primary();
    table.integer('agency_id').unsigned().notNullable()
      .references('id').inTable('agencies').onDelete('CASCADE');
    table.integer('supply_id').unsigned().notNullable()
      .references('id').inTable('supplies').onDelete('CASCADE');
    table.enum('location_type', ['unit', 'station']).notNullable();
    table.integer('location_id').unsigned().notNullable();
    table.integer('quantity').notNullable().defaultTo(0);
    table.integer('par_level').defaultTo(0);
    table.date('expiration_date');
    table.string('lot_number', 100);
    table.timestamps(true, true);
    
    table.index(['location_type', 'location_id']);
    table.index('supply_id');
  });

  // Create transactions table
  await knex.schema.createTable('transactions', (table) => {
    table.increments('id').primary();
    table.integer('agency_id').unsigned().notNullable()
      .references('id').inTable('agencies').onDelete('CASCADE');
    table.integer('supply_id').unsigned().notNullable()
      .references('id').inTable('supplies').onDelete('CASCADE');
    table.integer('user_id').unsigned()
      .references('id').inTable('users').onDelete('SET NULL');
    table.enum('transaction_type', ['usage', 'restock', 'waste', 'adjustment', 'transfer_out', 'transfer_in', 'receive', 'initial']).notNullable();
    table.integer('quantity').notNullable();
    table.enum('location_type', ['unit', 'station']).notNullable();
    table.integer('location_id').unsigned().notNullable();
    table.integer('from_location_id').unsigned();
    table.enum('from_location_type', ['unit', 'station']);
    table.enum('usage_type', ['patient_care', 'training', 'expired', 'damaged', 'lost', 'other']);
    table.string('incident_number', 100);
    table.text('notes');
    table.timestamp('transaction_date').defaultTo(knex.fn.now());
    table.timestamps(true, true);
    
    table.index(['location_type', 'location_id']);
    table.index('supply_id');
    table.index('transaction_date');
  });

  // Create orders table
  await knex.schema.createTable('orders', (table) => {
    table.increments('id').primary();
    table.integer('agency_id').unsigned().notNullable()
      .references('id').inTable('agencies').onDelete('CASCADE');
    table.string('order_number', 100).notNullable();
    table.enum('status', ['draft', 'submitted', 'approved', 'ordered', 'shipped', 'partial', 'received', 'cancelled']).notNullable().defaultTo('draft');
    table.integer('created_by').unsigned()
      .references('id').inTable('users').onDelete('SET NULL');
    table.integer('approved_by').unsigned()
      .references('id').inTable('users').onDelete('SET NULL');
    table.string('vendor', 255);
    table.decimal('total_cost', 10, 2).defaultTo(0);
    table.date('order_date');
    table.date('expected_delivery');
    table.date('received_date');
    table.text('notes');
    table.timestamps(true, true);
    
    table.unique(['agency_id', 'order_number']);
  });

  // Create order_items table
  await knex.schema.createTable('order_items', (table) => {
    table.increments('id').primary();
    table.integer('order_id').unsigned().notNullable()
      .references('id').inTable('orders').onDelete('CASCADE');
    table.integer('supply_id').unsigned().notNullable()
      .references('id').inTable('supplies').onDelete('CASCADE');
    table.integer('quantity_ordered').notNullable();
    table.integer('quantity_received').defaultTo(0);
    table.decimal('unit_cost', 10, 2).defaultTo(0);
    table.decimal('total_cost', 10, 2).defaultTo(0);
    table.timestamps(true, true);
  });

  // Create alerts table
  await knex.schema.createTable('alerts', (table) => {
    table.increments('id').primary();
    table.integer('agency_id').unsigned().notNullable()
      .references('id').inTable('agencies').onDelete('CASCADE');
    table.enum('type', ['expiring', 'expired', 'below_par', 'out_of_stock', 'order_received', 'system']).notNullable();
    table.enum('severity', ['info', 'warning', 'critical']).notNullable();
    table.string('title', 255).notNullable();
    table.text('message').notNullable();
    table.integer('supply_id').unsigned()
      .references('id').inTable('supplies').onDelete('CASCADE');
    table.integer('location_id').unsigned();
    table.enum('location_type', ['unit', 'station']);
    table.boolean('is_read').defaultTo(false);
    table.boolean('is_dismissed').defaultTo(false);
    table.timestamps(true, true);
    
    table.index(['agency_id', 'is_read', 'is_dismissed']);
  });
};

exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('alerts');
  await knex.schema.dropTableIfExists('order_items');
  await knex.schema.dropTableIfExists('orders');
  await knex.schema.dropTableIfExists('transactions');
  await knex.schema.dropTableIfExists('inventory_records');
  await knex.schema.dropTableIfExists('supplies');
  await knex.schema.dropTableIfExists('supply_categories');
  await knex.schema.dropTableIfExists('units');
  await knex.schema.dropTableIfExists('stations');
  await knex.schema.dropTableIfExists('refresh_tokens');
  await knex.schema.dropTableIfExists('users');
  await knex.schema.dropTableIfExists('agencies');
};
