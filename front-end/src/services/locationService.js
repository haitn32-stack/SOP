import {instance} from '../utils/axios';

export const getAllLocations = async () => {
    try {
        const response = await instance.get('/locations');
        return response.data.locations;
    } catch (error) {
        console.error('Failed to fetch locations:', error);
        throw new Error('Không thể tải danh sách địa điểm.');
    }
};