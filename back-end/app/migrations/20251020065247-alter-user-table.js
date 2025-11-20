export default {
    async up(queryInterface, Sequelize) {
        const transaction = await queryInterface.sequelize.transaction();
        try {
            await queryInterface.addColumn('Users', 'supervisor_id', {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: {
                    model: 'Users',
                    key: 'user_id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL',
            }, {transaction});

            await queryInterface.addColumn('Users', 'location_id', {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: {
                    model: 'Locations',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL',
            }, {transaction});

            await queryInterface.removeColumn('Users', 'supervisor', {transaction});
            await queryInterface.removeColumn('Users', 'location', {transaction});

            await transaction.commit();
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    },

    async down(queryInterface, Sequelize) {
        const transaction = await queryInterface.sequelize.transaction();
        try {
            await queryInterface.addColumn('Users', 'supervisor', {
                type: Sequelize.STRING(100),
                allowNull: true,
            }, {transaction});

            await queryInterface.addColumn('Users', 'location', {
                type: Sequelize.STRING(100),
                allowNull: true,
            }, {transaction});

            await queryInterface.removeColumn('Users', 'supervisor_id', {transaction});

            await queryInterface.removeColumn('Users', 'location_id', {transaction});

            await transaction.commit();
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    }
};