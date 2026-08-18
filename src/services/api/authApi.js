import {createApi} from "@reduxjs/toolkit/query/react";
import customFetchBase from "./customFetchBase.js";
import {setAccessToken, setUser} from "../auth/authSlice.js";
import {toast} from "../../components/ui/use-toast.tsx";

export const authApi = createApi({
    reducerPath: 'authApi',
    baseQuery: customFetchBase,
    tagTypes: ['User', 'Patients', 'Appointments', 'History', 'Professionals', 'Specialties', 'WhatsApp', 'Templates', 'MedicalRecords', 'Balance', 'Availability', 'Properties', 'Units', 'Tenants', 'Leases', 'Payments', 'Expenses', 'Maintenance', 'UserList', 'Product', 'Category'],
    endpoints: (build) => ({
        login: build.mutation({
            query: (credentials) => ({
                url: '/login',
                method: 'POST',
                body: credentials,
            }),
            // API returns back the updated user, so we can use that to update the cache
            async onQueryStarted(arg, { dispatch, queryFulfilled }) {
                queryFulfilled
                    .then((data) => {
                        const token = data?.data?.accessToken || data?.data?.token;
                        if (token) {
                            dispatch(setAccessToken(token));
                            if (data?.data?.refreshToken) {
                                localStorage.setItem('refreshToken', data.data.refreshToken);
                            }
                        }
                        if (data?.data?.user) {
                            dispatch(setUser(data.data.user));
                        }
                        toast({
                            title: "Success",
                            description: "Logged in successfully",
                            variant: "success",
                        });
                        return data;
                    })
                    .catch((error) => {
                        toast({
                            title: "Uh oh! Something went wrong.",
                            description: "There was a problem with your login",
                            variant: "error",
                        });
                    })
            }
        }),
        register: build.mutation({
            query: (credentials) => ({
                url: '/createuser',
                method: 'POST',
                body: credentials,
            }),
            async onQueryStarted(arg, { queryFulfilled }) {
                queryFulfilled
                    .then(() => {
                        toast({
                            title: "¡Éxito!",
                            description: "Usuario creado correctamente",
                            variant: "success",
                        });
                    })
                    .catch((error) => {
                        let errorMessage = "Ocurrió un problema al crear tu cuenta";
                        if (error?.error?.status === 409) {
                            errorMessage = "Este correo electrónico ya está registrado";
                        }
                        toast({
                            title: "Error de registro",
                            description: errorMessage,
                            variant: "error",
                        });
                    })
            }
        }),
        logout: build.mutation({
            query: () => ({
                url: '/logout',
                method: 'POST',
            }),
        }),
        refresh: build.mutation({
            query: () => ({
                url: '/refresh',
                method: 'POST',
                body: {
                    refreshToken: localStorage.getItem('refreshToken'),
                }
            }),
            async onQueryStarted(arg, { dispatch, queryFulfilled }) {
                const { data } = await queryFulfilled;
                dispatch(setAccessToken(data.accessToken));
                localStorage.setItem('refreshToken', data.refreshToken)
            }
        }),
    }),
})

export const {
    useLoginMutation,
    useRegisterMutation,
    useRefreshMutation,
    useLazyRefreshQuery,
    useLogoutMutation,
    useUsersQuery,
    usePrefetch,
} = authApi;