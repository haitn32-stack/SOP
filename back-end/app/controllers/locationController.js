import locationRepository from '../repositories/locationRepository.js';
import Logger from '../utils/logger.js';

class LocationController {
    getAllLocations = async (req, res) => {
        try {
            const locations = await locationRepository.findAll();
            res.status(200).json({success: true, locations});
        } catch (err) {
            Logger.error('Get all locations error:', {message: err.message, stack: err.stack});
            res.status(500).json({success: false, error: 'Lỗi hệ thống'});
        }
    }
}

export default new LocationController();