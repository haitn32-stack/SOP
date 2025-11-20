import {Location} from '../models/index.js';

class LocationRepository {
    async findAll() {
        return await Location.findAll({
            attributes: ['id', 'name'],
            order: [['name', 'ASC']]
        });
    }
}

export default new LocationRepository();