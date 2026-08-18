import {logout} from "./authSlice.js";
import {store} from "../store/store.js";

export function logoutUser() {
    store.dispatch(logout());
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userInfo');

    // Si el usuario no está ya en login o signup, redirigir a login
    const publicRoutes = ['/login', '/signup', '/signup-admin', '/'];
    if (!publicRoutes.includes(window.location.pathname)) {
        window.location.href = '/login';
    }
}