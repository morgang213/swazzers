# Medical Supply Inventory Seed Data

This directory contains SQL seed data files for populating the medical supply inventory system with complete data.

## Files

### 01_categories.sql
Creates 13 supply categories:
1. **Airway Management** - Airway management equipment and supplies
2. **IV/Vascular Access** - IV and vascular access supplies
3. **IO Access** - Intraosseous access equipment
4. **Cardiac/Monitoring** - Cardiac and patient monitoring supplies
5. **Wound Care/Bandaging** - Wound care and bandaging supplies
6. **Obstetrics** - Obstetric supplies and equipment
7. **Splinting/Immobilization** - Splinting and immobilization equipment
8. **Patient Care** - General patient care supplies
9. **PPE** - Personal protective equipment
10. **Cleaning/Sanitation** - Cleaning and sanitation supplies
11. **Documentation** - Documentation and administrative supplies
12. **Glucose Testing** - Glucose testing supplies
13. **Miscellaneous** - Miscellaneous supplies

### 02_supplies.sql
Creates 156 medical supply items with the following attributes:
- Unique ID
- Name/description
- Category assignment
- Unit of measure
- Default par level
- Expiration tracking flag
- Active status
- Agency association

**Items that track expiration:**
- All IV fluids (NS, LR, D5W bags)
- Medications
- Glucometer strips
- Defibrillation pads
- ECG electrodes
- N95 masks
- Surgical masks
- Nitrile gloves
- Alcohol prep pads
- Chlorhexidine preps

**Items that do NOT track expiration:**
- Equipment (BVMs, stylets, splints, collars)
- Documentation supplies
- Bandaging/dressing supplies
- Patient care items
- Cleaning supplies
- Miscellaneous items

### 03_inventory_records.sql
Creates 624 inventory records (156 supplies × 4 units):
- Each ambulance unit is fully stocked at par level
- All quantities match the par levels
- Location type is set to 'unit'

**Ambulance Units:**
- **Medic 1:** `66666666-6666-6666-6666-666666666661`
- **Medic 2:** `66666666-6666-6666-6666-666666666662`
- **Medic 3:** `66666666-6666-6666-6666-666666666663`
- **BLS 1:** `66666666-6666-6666-6666-666666666664`

## Database Schema Requirements

These seed files assume the following database structure:

### supply_categories
- `id` (UUID, primary key)
- `name` (text)
- `color` (text, hex color code)
- `description` (text)
- `agency_id` (UUID, foreign key)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### supplies
- `id` (UUID, primary key)
- `name` (text)
- `category_id` (UUID, foreign key to supply_categories)
- `unit_of_measure` (text)
- `default_par_level` (integer)
- `tracks_expiration` (boolean)
- `is_active` (boolean)
- `agency_id` (UUID, foreign key)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### inventory_records
- `id` (UUID, primary key)
- `supply_id` (UUID, foreign key to supplies)
- `unit_id` (UUID, foreign key to units)
- `quantity` (integer)
- `par_level` (integer)
- `location_type` (text, e.g., 'unit', 'station')
- `created_at` (timestamp)
- `updated_at` (timestamp)

## Usage

Run these files in order to populate the database:

```sql
-- 1. Create categories
\i 01_categories.sql

-- 2. Create supplies
\i 02_supplies.sql

-- 3. Create inventory records
\i 03_inventory_records.sql
```

## Notes

- All UUIDs are pre-generated for consistency
- Demo agency ID used: `11111111-1111-1111-1111-111111111111`
- All records use `ON CONFLICT DO NOTHING` to allow re-running without errors
- Timestamps use `NOW()` function for current time
