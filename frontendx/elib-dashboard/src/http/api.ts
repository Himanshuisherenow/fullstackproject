import axios from 'axios';
import useTokenStore from '@/store';

const api = axios.create({
    // todo: move this value to env variable.
    baseURL: 'http://localhost:7000',
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    const token = useTokenStore.getState().token;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}); 

export const login = async (data: { email: string; password: string }) =>
    api.post('/api/users/login', data);

export const register = async (data: { name: string; email: string; password: string }) =>
    api.post('/api/users/register', data);

export const getBooks = async () => api.get('/api/books');

export const createBook = async (data: FormData) =>{
   return api.post('/api/books', data, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });}
    export const updateBook = async ({ id, data }: { id: string, data: FormData }) =>{
    
      return   api.patch(`/api/books/${id}`, data, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });}
    export const deleteBook = async (bookId:string)=>{ return api.delete(`/api/books/${bookId}`)}
    export const getBook = async (id:string) => api.get(`/api/books/${id}`);