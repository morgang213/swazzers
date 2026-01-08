const bcrypt = require('bcryptjs');
const db = require('../config/database');

/**
 * List users (admin only)
 */
async function listUsers(req, res, next) {
  try {
    const agencyId = req.user.agencyId;
    
    const users = await db('users')
      .where({ agency_id: agencyId })
      .select(
        'id',
        'email',
        'first_name',
        'last_name',
        'role',
        'phone',
        'active',
        'created_at',
        'updated_at'
      )
      .orderBy('last_name');

    res.json({ users });
  } catch (error) {
    next(error);
  }
}

/**
 * Get user by ID
 */
async function getUser(req, res, next) {
  try {
    const { id } = req.params;
    const agencyId = req.user.agencyId;

    const user = await db('users')
      .where({ id, agency_id: agencyId })
      .select(
        'id',
        'email',
        'first_name',
        'last_name',
        'role',
        'phone',
        'active',
        'created_at',
        'updated_at'
      )
      .first();

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    next(error);
  }
}

/**
 * Create user (admin only)
 */
async function createUser(req, res, next) {
  try {
    const agencyId = req.user.agencyId;
    const { email, password, first_name, last_name, role, phone } = req.body;

    if (!email || !password || !first_name || !last_name || !role) {
      return res.status(400).json({ error: 'Required fields missing' });
    }

    // Validate password
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    const [userId] = await db('users')
      .insert({
        agency_id: agencyId,
        email: email.toLowerCase(),
        password_hash: passwordHash,
        first_name,
        last_name,
        role,
        phone,
        active: true
      })
      .returning('id');

    const user = await db('users')
      .where({ id: userId })
      .select(
        'id',
        'email',
        'first_name',
        'last_name',
        'role',
        'phone',
        'active',
        'created_at'
      )
      .first();

    res.status(201).json({ user });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Email already exists' });
    }
    next(error);
  }
}

/**
 * Update user
 */
async function updateUser(req, res, next) {
  try {
    const { id } = req.params;
    const agencyId = req.user.agencyId;
    const updateData = { ...req.body };

    // Remove fields that shouldn't be updated directly
    delete updateData.id;
    delete updateData.agency_id;
    delete updateData.password_hash;
    delete updateData.email; // Email changes should be handled separately

    // If password is being updated
    if (req.body.password) {
      if (req.body.password.length < 8) {
        return res.status(400).json({ error: 'Password must be at least 8 characters' });
      }
      updateData.password_hash = await bcrypt.hash(req.body.password, 12);
      delete updateData.password;
    }

    const updated = await db('users')
      .where({ id, agency_id: agencyId })
      .update({
        ...updateData,
        updated_at: db.fn.now()
      });

    if (!updated) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = await db('users')
      .where({ id })
      .select(
        'id',
        'email',
        'first_name',
        'last_name',
        'role',
        'phone',
        'active',
        'updated_at'
      )
      .first();

    res.json({ user });
  } catch (error) {
    next(error);
  }
}

/**
 * Deactivate user (admin only)
 */
async function deleteUser(req, res, next) {
  try {
    const { id } = req.params;
    const agencyId = req.user.agencyId;

    // Prevent self-deletion
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ error: 'Cannot deactivate your own account' });
    }

    const updated = await db('users')
      .where({ id, agency_id: agencyId })
      .update({ active: false, updated_at: db.fn.now() });

    if (!updated) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deactivated successfully' });
  } catch (error) {
    next(error);
  }
}

/**
 * Get current user profile
 */
async function getCurrentUser(req, res, next) {
  try {
    const user = await db('users')
      .where({ id: req.user.id })
      .select(
        'id',
        'email',
        'first_name',
        'last_name',
        'role',
        'phone',
        'active',
        'agency_id',
        'created_at'
      )
      .first();

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    next(error);
  }
}

/**
 * Update current user profile
 */
async function updateCurrentUser(req, res, next) {
  try {
    const updateData = {};
    
    // Only allow updating certain fields
    if (req.body.first_name) updateData.first_name = req.body.first_name;
    if (req.body.last_name) updateData.last_name = req.body.last_name;
    if (req.body.phone) updateData.phone = req.body.phone;
    
    // Handle password update
    if (req.body.password) {
      if (req.body.password.length < 8) {
        return res.status(400).json({ error: 'Password must be at least 8 characters' });
      }
      updateData.password_hash = await bcrypt.hash(req.body.password, 12);
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    await db('users')
      .where({ id: req.user.id })
      .update({
        ...updateData,
        updated_at: db.fn.now()
      });

    const user = await db('users')
      .where({ id: req.user.id })
      .select(
        'id',
        'email',
        'first_name',
        'last_name',
        'role',
        'phone',
        'active',
        'updated_at'
      )
      .first();

    res.json({ user });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getCurrentUser,
  updateCurrentUser
};
