import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

class TokenService {

    generateTokens(user) {
        const payload = {
            userId: user.userId,
            userName: user.userName,
            role: user.roleName || user.role?.name,
            permissions: user.permissions || []
        };

        const accessToken = jwt.sign(
            payload,
            process.env.JWT_SECRET,
            {expiresIn: process.env.JWT_EXPIRES_IN || '1h'}
        );

        const refreshToken = jwt.sign(
            {userId: user.userId},
            process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
            {expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'}
        );

        return {
            accessToken,
            refreshToken
        };
    }

    verifyAccessToken(token) {
        return jwt.verify(token, process.env.JWT_SECRET);
    }

    verifyRefreshToken(token) {
        return jwt.verify(token, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
    }

    extractTokenFromHeader(authHeader) {
        if (!authHeader) return null;

        const parts = authHeader.split(' ');
        if (parts.length === 2 && parts[0] === 'Bearer') {
            return parts[1];
        }

        return null;
    }

    getTokenExpiry() {
        return process.env.JWT_EXPIRES_IN || '1h';
    }

    getRefreshTokenExpiry() {
        return process.env.JWT_REFRESH_EXPIRES_IN || '7d';
    }
}

export default new TokenService();