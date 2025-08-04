const db = require("../db/config");

async function logActivity({
  action,
  description,
  item_id = null,
  item_type = null,
}) {
  await db("activity_logs").insert({
    action,
    description,
    item_id,
    item_type,
    created_at: db.fn.now(),
  });
}

module.exports = logActivity;
