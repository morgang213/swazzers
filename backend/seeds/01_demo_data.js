const bcrypt = require('bcryptjs');

/**
 * Seed database with demo data
 */
exports.seed = async function(knex) {
  // Clean existing data
  await knex('alerts').del();
  await knex('order_items').del();
  await knex('orders').del();
  await knex('transactions').del();
  await knex('inventory_records').del();
  await knex('supplies').del();
  await knex('supply_categories').del();
  await knex('units').del();
  await knex('stations').del();
  await knex('refresh_tokens').del();
  await knex('users').del();
  await knex('agencies').del();

  // Create demo agency
  const [agencyId] = await knex('agencies').insert({
    name: 'Demo EMS Agency',
    address: '123 Main Street',
    city: 'Springfield',
    state: 'IL',
    zip: '62701',
    phone: '555-0100',
    email: 'admin@demoems.com',
    settings: JSON.stringify({
      alert_expiring_days: [30, 60, 90],
      timezone: 'America/Chicago'
    }),
    active: true
  }).returning('id');

  const agency_id = agencyId;

  // Create users
  const hashedPassword = await bcrypt.hash('Password123!', 12);
  
  await knex('users').insert([
    {
      agency_id,
      email: 'admin@demoems.com',
      password_hash: hashedPassword,
      first_name: 'Admin',
      last_name: 'User',
      role: 'admin',
      phone: '555-0101',
      active: true
    },
    {
      agency_id,
      email: 'supervisor@demoems.com',
      password_hash: hashedPassword,
      first_name: 'Sarah',
      last_name: 'Supervisor',
      role: 'supervisor',
      phone: '555-0102',
      active: true
    },
    {
      agency_id,
      email: 'medic@demoems.com',
      password_hash: hashedPassword,
      first_name: 'Mike',
      last_name: 'Medic',
      role: 'medic',
      phone: '555-0103',
      active: true
    }
  ]);

  // Create stations
  const [station1Id] = await knex('stations').insert({
    agency_id,
    name: 'Station 1 - Main',
    address: '100 First Street',
    city: 'Springfield',
    state: 'IL',
    zip: '62701',
    active: true
  }).returning('id');

  const [station2Id] = await knex('stations').insert({
    agency_id,
    name: 'Station 2 - North',
    address: '200 North Avenue',
    city: 'Springfield',
    state: 'IL',
    zip: '62702',
    active: true
  }).returning('id');

  // Create units
  await knex('units').insert([
    {
      agency_id,
      station_id: station1Id,
      name: 'Medic 1',
      type: 'als',
      vehicle_id: 'M1-2023',
      active: true
    },
    {
      agency_id,
      station_id: station1Id,
      name: 'Medic 2',
      type: 'als',
      vehicle_id: 'M2-2023',
      active: true
    },
    {
      agency_id,
      station_id: station2Id,
      name: 'Medic 3',
      type: 'als',
      vehicle_id: 'M3-2022',
      active: true
    },
    {
      agency_id,
      station_id: station2Id,
      name: 'BLS 1',
      type: 'bls',
      vehicle_id: 'B1-2021',
      active: true
    }
  ]);

  // Create supply categories
  const categoryIds = {};
  const categories = [
    { name: 'Medications', description: 'Pharmaceuticals and drugs' },
    { name: 'Airway', description: 'Airway management supplies' },
    { name: 'Cardiac', description: 'Cardiac monitoring and treatment' },
    { name: 'IV/Vascular', description: 'Intravenous and vascular access' },
    { name: 'Trauma', description: 'Trauma and bleeding control' },
    { name: 'PPE', description: 'Personal protective equipment' },
    { name: 'Consumables', description: 'General consumable items' },
    { name: 'Equipment', description: 'Medical equipment' }
  ];

  for (const category of categories) {
    const [id] = await knex('supply_categories').insert({
      agency_id,
      ...category,
      active: true
    }).returning('id');
    categoryIds[category.name] = id;
  }

  // Create supplies
  const supplies = [
    // Medications
    { category: 'Medications', name: 'Epinephrine 1:1000 1mg/mL', sku: 'EPI-1000', manufacturer: 'Hospira', unit_cost: 15.50, par: 10, expiration: true },
    { category: 'Medications', name: 'Narcan (Naloxone) 4mg Nasal Spray', sku: 'NAR-4MG', manufacturer: 'Emergent', unit_cost: 37.50, par: 8, expiration: true },
    { category: 'Medications', name: 'Aspirin 325mg Chewable', sku: 'ASA-325', manufacturer: 'Generic', unit_cost: 0.50, par: 50, expiration: true },
    { category: 'Medications', name: 'Nitroglycerin 0.4mg Sublingual', sku: 'NTG-04', manufacturer: 'Pfizer', unit_cost: 2.25, par: 25, expiration: true },
    
    // Airway
    { category: 'Airway', name: 'ET Tube 7.5mm', sku: 'ETT-75', manufacturer: 'Medline', unit_cost: 4.25, par: 5, expiration: false },
    { category: 'Airway', name: 'BVM Adult', sku: 'BVM-ADT', manufacturer: 'Ambu', unit_cost: 22.00, par: 2, expiration: false },
    { category: 'Airway', name: 'King LT-D Airway Size 4', sku: 'KLT-4', manufacturer: 'King', unit_cost: 18.50, par: 3, expiration: false },
    { category: 'Airway', name: 'Oropharyngeal Airway 80mm', sku: 'OPA-80', manufacturer: 'Generic', unit_cost: 1.50, par: 10, expiration: false },
    
    // Cardiac
    { category: 'Cardiac', name: 'ECG Electrodes (pkg of 10)', sku: 'ECG-10', manufacturer: '3M', unit_cost: 8.75, par: 20, expiration: true },
    { category: 'Cardiac', name: 'Defibrillation Pads', sku: 'DEFIB-PAD', manufacturer: 'Zoll', unit_cost: 35.00, par: 4, expiration: true },
    
    // IV/Vascular
    { category: 'IV/Vascular', name: 'IV Catheter 18ga', sku: 'IVC-18', manufacturer: 'BD', unit_cost: 2.50, par: 20, expiration: false },
    { category: 'IV/Vascular', name: 'IV Catheter 20ga', sku: 'IVC-20', manufacturer: 'BD', unit_cost: 2.25, par: 25, expiration: false },
    { category: 'IV/Vascular', name: 'Normal Saline 1000mL', sku: 'NS-1000', manufacturer: 'Baxter', unit_cost: 3.50, par: 15, expiration: true },
    { category: 'IV/Vascular', name: 'IV Administration Set', sku: 'IV-SET', manufacturer: 'Hospira', unit_cost: 2.75, par: 20, expiration: false },
    
    // Trauma
    { category: 'Trauma', name: 'Gauze 4x4 (pkg of 10)', sku: 'GZ-4X4', manufacturer: 'Medline', unit_cost: 3.25, par: 30, expiration: false },
    { category: 'Trauma', name: 'CAT Tourniquet', sku: 'CAT-TQ', manufacturer: 'NAR', unit_cost: 28.50, par: 6, expiration: false },
    { category: 'Trauma', name: 'QuikClot Combat Gauze', sku: 'QC-CG', manufacturer: 'Z-Medica', unit_cost: 42.00, par: 4, expiration: true },
    { category: 'Trauma', name: 'Trauma Dressing 10x30', sku: 'TD-1030', manufacturer: 'H&H', unit_cost: 8.50, par: 10, expiration: false },
    
    // PPE
    { category: 'PPE', name: 'Nitrile Gloves Large (box of 100)', sku: 'GLV-L', manufacturer: 'Microflex', unit_cost: 12.50, par: 10, expiration: false },
    { category: 'PPE', name: 'N95 Respirator Mask', sku: 'N95-MASK', manufacturer: '3M', unit_cost: 1.85, par: 50, expiration: true },
    { category: 'PPE', name: 'Eye Protection Goggles', sku: 'EYE-GGL', manufacturer: 'Generic', unit_cost: 3.50, par: 10, expiration: false },
    
    // Consumables
    { category: 'Consumables', name: 'Alcohol Prep Pads (box of 100)', sku: 'ALC-PREP', manufacturer: 'PDI', unit_cost: 4.25, par: 15, expiration: true },
    { category: 'Consumables', name: 'Tape 1" Medical', sku: 'TAPE-1', manufacturer: '3M', unit_cost: 2.50, par: 20, expiration: false },
    { category: 'Consumables', name: 'Sharps Container 1qt', sku: 'SHRP-1QT', manufacturer: 'BD', unit_cost: 6.75, par: 5, expiration: false }
  ];

  const supplyRecords = [];
  for (const supply of supplies) {
    supplyRecords.push({
      agency_id,
      category_id: categoryIds[supply.category],
      name: supply.name,
      sku: supply.sku,
      manufacturer: supply.manufacturer,
      unit_cost: supply.unit_cost,
      default_par_level: supply.par,
      tracks_expiration: supply.expiration,
      active: true
    });
  }

  await knex('supplies').insert(supplyRecords);

  // Get all supply IDs and unit IDs for inventory creation
  const allSupplies = await knex('supplies').where({ agency_id }).select('id', 'default_par_level', 'tracks_expiration');
  const allUnits = await knex('units').where({ agency_id }).select('id');
  const allStations = await knex('stations').where({ agency_id }).select('id');

  // Create inventory records for units
  const inventoryRecords = [];
  const today = new Date();
  
  for (const unit of allUnits) {
    for (const supply of allSupplies) {
      const quantity = Math.floor(supply.default_par_level * (0.6 + Math.random() * 0.8));
      const expirationDate = supply.tracks_expiration 
        ? new Date(today.getTime() + (Math.random() * 365 + 30) * 24 * 60 * 60 * 1000)
        : null;
      
      inventoryRecords.push({
        agency_id,
        supply_id: supply.id,
        location_type: 'unit',
        location_id: unit.id,
        quantity,
        par_level: supply.default_par_level,
        expiration_date: expirationDate
      });
    }
  }

  // Create inventory records for stations (with higher quantities)
  for (const station of allStations) {
    for (const supply of allSupplies) {
      const quantity = Math.floor(supply.default_par_level * (2 + Math.random() * 3));
      const expirationDate = supply.tracks_expiration 
        ? new Date(today.getTime() + (Math.random() * 365 + 60) * 24 * 60 * 60 * 1000)
        : null;
      
      inventoryRecords.push({
        agency_id,
        supply_id: supply.id,
        location_type: 'station',
        location_id: station.id,
        quantity,
        par_level: supply.default_par_level * 3,
        expiration_date: expirationDate
      });
    }
  }

  await knex('inventory_records').insert(inventoryRecords);

  console.log('✅ Seed data created successfully!');
  console.log('\n📧 Demo Login Credentials:');
  console.log('Admin:      admin@demoems.com / Password123!');
  console.log('Supervisor: supervisor@demoems.com / Password123!');
  console.log('Medic:      medic@demoems.com / Password123!\n');
};
