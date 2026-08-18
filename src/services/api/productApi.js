import { authApi } from "./authApi.js";

export const productApi = authApi.injectEndpoints({
    endpoints: (build) => ({
        getProducts: build.query({
            query: () => ({
                url: '/api/products',
                method: 'GET',
            }),
            providesTags: ['Product'],
        }),
        createProduct: build.mutation({
            query: (body) => ({
                url: '/api/products',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Product'],
        }),
        updateProduct: build.mutation({
            query: ({ id, ...body }) => ({
                url: `/api/products/${id}`,
                method: 'PUT',
                body,
            }),
            invalidatesTags: ['Product'],
        }),
        deleteProduct: build.mutation({
            query: (id) => ({
                url: `/api/products/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Product'],
        }),
        uploadImage: build.mutation({
            query: (formData) => ({
                url: '/api/upload',
                method: 'POST',
                body: formData,
            }),
        }),
    }),
    overrideExisting: false,
});

export const {
    useGetProductsQuery,
    useCreateProductMutation,
    useUpdateProductMutation,
    useDeleteProductMutation,
    useUploadImageMutation
} = productApi;
