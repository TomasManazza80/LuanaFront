import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    userInfo: JSON.parse(localStorage.getItem('userInfo') || '{}'), // for user object
    accessToken: localStorage.getItem('accessToken') || null,
    error: null,
    success: false, // for monitoring the registration process.
}

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setAccessToken: (state, action) => {
            state.accessToken = action.payload
            if (action.payload) {
                localStorage.setItem('accessToken', action.payload)
            } else {
                localStorage.removeItem('accessToken')
            }
        },
        setUser: (state, action) => {
            state.userInfo = action.payload
            localStorage.setItem('userInfo', JSON.stringify(action.payload))
        },
        logout: () => {
            localStorage.removeItem('accessToken')
            localStorage.removeItem('userInfo')
            return {
                userInfo: {},
                accessToken: null,
                error: null,
                success: false,
            }
        },
    },
})



export const { logout, setAccessToken, setUser } = authSlice.actions
export default authSlice.reducer

export const selectCurrentUser = (state) => state.auth.user
