'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('users', 'verified', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    });

    // Add index for verified field
    await queryInterface.addIndex('users', ['verified'], {
      name: 'users_verified_index'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('users', 'users_verified_index');
    await queryInterface.removeColumn('users', 'verified');
  }
};
