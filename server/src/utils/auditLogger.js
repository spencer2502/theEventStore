const AuditLog = require('../models/AuditLog');

/**
 * Logs an administrative action to the AuditLog collection
 */
async function logAction({ action, entity, entityId, performedBy, details }) {
  try {
    await AuditLog.create({
      action,
      entity,
      entityId: entityId ? String(entityId) : '',
      performedBy: performedBy._id,
      performedByName: performedBy.name,
      performedByRole: performedBy.role,
      details: details || {},
    });
  } catch (err) {
    console.error('Failed to write audit log:', err.message);
  }
}

module.exports = { logAction };
