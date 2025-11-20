import axios from "axios";

// URL cơ sở của API backend
const baseURL = "http://localhost:3000/api";

// Tạo một instance của Axios
export const instance = axios.create({
    baseURL: baseURL
});

// Config Interceptor để tự động thêm token vào header của mỗi request
instance.interceptors.request.use(
    (config) => {
        // Lấy token từ localStorage (được lưu sau khi đăng nhập thành công)
        const token = localStorage.getItem("token");

        // Nếu có token, thêm vào header Authorization
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Trả về config đã được chỉnh sửa để request được tiếp tục
        return config;
    },
    (error) => {
        // Xử lý lỗi nếu có
        return Promise.reject(error);
    }
);