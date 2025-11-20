import {sequelize} from "../config/database.js";

import User from "./userModel.js";
import Role from "./roleModel.js";
import Location from "./locationModel.js";
import Department from "./departmentModel.js";

// ASSOCIATIONS
// User - Role
User.belongsTo(Role, {foreignKey: 'roleId', as: 'role'});
Role.hasMany(User, {foreignKey: 'roleId', as: 'users'});

// User - Location
User.belongsTo(Location, {foreignKey: 'locationId', as: 'location'});
Location.hasMany(User, {foreignKey: 'locationId', as: 'users'});

// User - Department
User.belongsTo(Department, {foreignKey: 'parentDepartmentId', as: 'parentDepartment'});
User.belongsTo(Department, {foreignKey: 'childDepartment1Id', as: 'childDepartment1'});
User.belongsTo(Department, {foreignKey: 'childDepartment2Id', as: 'childDepartment2'});
Department.hasMany(User, {foreignKey: 'parentDepartmentId'}); // Một Department có thể có nhiều Users

// User - Supervisor
User.belongsTo(User, {as: 'supervisor', foreignKey: 'supervisorId'}); // Một User có một Supervisor
User.hasMany(User, {as: 'subordinates', foreignKey: 'supervisorId'}); // Một User (là supervisor) có nhiều cấp dưới

export {
    User,
    Role,
    Location,
    Department,
    sequelize
};