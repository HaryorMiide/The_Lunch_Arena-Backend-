/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {};

exports.up = function (knex) {
  return knex.schema.createTable("users", (table) => {
    table.increments("id").primary(); // Auto-incrementing ID
    table.string("email").unique().notNullable(); // Unique email (required)
    table.string("password").notNullable(); // Hashed password (required)
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("users");
};
