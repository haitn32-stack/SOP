import {instance} from '../utils/axios';

let cachedPublicKeyPem = null;

async function getPublicKey() {
    if (cachedPublicKeyPem) return cachedPublicKeyPem;
    const res = await instance.get('/pubkey', {responseType: 'text'});
    cachedPublicKeyPem = res.data;
    return cachedPublicKeyPem;
}

async function encryptToBase64RSAOAEP(plainText) {
    const pem = await getPublicKey();
    // Convert PEM to CryptoKey
    const pemHeader = '-----BEGIN PUBLIC KEY-----\n';
    const pemFooter = '\n-----END PUBLIC KEY-----\n';
    const b64 = pem.replace(pemHeader, '').replace(pemFooter, '').replace(/\n/g, '');
    const binaryDer = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
    const key = await window.crypto.subtle.importKey(
        'spki',
        binaryDer.buffer,
        {name: 'RSA-OAEP', hash: 'SHA-256'},
        false,
        ['encrypt']
    );
    const encoded = new TextEncoder().encode(plainText);
    const ciphertext = await window.crypto.subtle.encrypt({name: 'RSA-OAEP'}, key, encoded);
    const bytes = new Uint8Array(ciphertext);
    let binary = '';
    bytes.forEach(b => binary += String.fromCharCode(b));
    return btoa(String.fromCharCode.apply(null, new Uint8Array(ciphertext)));
}

class AuthService {
    // Login with username and password
    login = async (credentials) => {
        try {
            const {userName, password} = credentials;

            // Mã hóa mật khẩu
            const encryptedPassword = await encryptToBase64RSAOAEP(password);

            const response = await instance.post('/login', {
                userName,
                password: encryptedPassword // Sử dụng mật khẩu đã mã hóa
            }, {
                headers: {'X-Enc': 'rsa'} // Thêm header để báo hiệu cho Back-end
            });
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Register new user
    register = async (userData) => {
        try {
            const {password, confirmPassword, ...rest} = userData;

            // Mã hóa cả hai trường mật khẩu
            const encryptedPassword = await encryptToBase64RSAOAEP(password);
            const encryptedConfirmPassword = await encryptToBase64RSAOAEP(confirmPassword);

            const response = await instance.post('/register', {
                ...rest,
                password: encryptedPassword,
                confirmPassword: encryptedConfirmPassword
            }, {
                headers: {'X-Enc': 'rsa'} // Thêm header
            });
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Verify token
    async verifyToken(token) {
        try {
            const response = await instance.get('/verify', {
                headers: {Authorization: `Bearer ${token}`}
            });
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Logout
    async logout(token) {
        try {
            const response = await instance.post('/logout', {}, {
                headers: {Authorization: `Bearer ${token}`}
            });
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Handle API errors
    handleError(error) {
        console.error('Full API Error:', error);
        console.error('Response data:', error.response?.data);

        if (error.response) {
            const errorData = error.response.data;
            const errorMessage = errorData?.message ||
                errorData?.error ||
                errorData?.msg ||
                JSON.stringify(errorData) ||
                `Server error: ${error.response.status}`;

            return {
                message: errorMessage,
                status: error.response.status,
                data: error.response.data
            };
        } else if (error.request) {
            return {
                message: 'Lỗi mạng! Không nhận được phản hồi từ máy chủ.',
                status: 0,
                data: null
            };
        } else {
            return {
                message: error.message,
                status: 0,
                data: null
            };
        }
    }
}

export default new AuthService();