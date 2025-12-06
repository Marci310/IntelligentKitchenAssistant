import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../service/api.ts';
import { userSchema } from "../schemas/backendSchemas.ts";
import { profileFormSchema, loginFormSchema } from "../schemas/formSchemas.ts";
import { toast } from 'react-toastify';
import { z } from 'zod';
import { AxiosError } from 'axios';

export const useUser = () => {
    const queryClient = useQueryClient();

    const {data: user, isLoading, error} = useQuery({
        queryKey: ['user'],
        queryFn: async () => {
            const response = await apiClient.get('/user');
            const userData = userSchema.parse(response.data);
            sessionStorage.setItem('user', JSON.stringify(userData));
            return userData;
        },
        retry: false,
        enabled: !!sessionStorage.getItem('user'), // Enable if user data exists
        staleTime: 5 * 60 * 1000,
        initialData: () => {
            const stored = sessionStorage.getItem('user');
            if (stored) {
                try {
                    return JSON.parse(stored);
                } catch {
                    sessionStorage.removeItem('user');
                    return undefined;
                }
            }
            return undefined;
        }
    });

    const loginMutation = useMutation({
        mutationFn:async (user: z.infer<typeof loginFormSchema>) => {
            const response = await apiClient.post('/auth/login', user);
            return userSchema.parse(response.data.user);
        },
        onSuccess:(data) => {
            sessionStorage.setItem('user', JSON.stringify(data));
            queryClient.setQueryData(['user'], data); // Set user data directly
            toast.success('Login successful!');
        },
        onError:(error: AxiosError<{ message: string }>) => {
            const errorMessage = error?.response?.data?.message || error?.message || 'Login failed';
            toast.error(errorMessage);
        }
    });

    const registerMutation = useMutation({
        mutationFn:async ({
                              username,
                              fullName,
                              password,
                              dateOfBirth
                          }: {
            username: string;
            fullName: string;
            password: string;
            dateOfBirth: string;
        }) => {
            await apiClient.post('/auth/register', {username, fullName, password, dateOfBirth});
        },
        onSuccess:() => {
            toast.success('Registration successful! Please log in.');
        },
        onError:(error: AxiosError<{ message: string }>) => {
            const errorMessage = error?.response?.data?.message || error?.message || 'Registration failed';
            toast.error(errorMessage);
        }
    });

    const logoutMutation = useMutation({
        mutationFn:async () => {
            await apiClient.post('/auth/logout');
        },
        onSuccess:() => {
            sessionStorage.removeItem('user');
            queryClient.setQueryData(['user'], null);
            toast.success('Logged out successfully');
        },
        onError:(error: AxiosError<{ message: string }>) => {
            const errorMessage = error?.response?.data?.message || error?.message || 'Logout failed';
            toast.error(errorMessage);
        }
    });

    const updateUserMutation = useMutation({
        mutationFn:async (updatedUser: z.infer<typeof profileFormSchema >) => {
            const response = await apiClient.put('/user', updatedUser);
            return userSchema.parse(response.data);
        },
        onSuccess:() => {
            queryClient.invalidateQueries({queryKey:['user']});
            toast.success("User updated successfully!");
        },
        onError:(error: AxiosError<{ message: string }>) => {
            const errorMessage = error?.response?.data?.message || error?.message || "Failed to update user.";
            toast.error(errorMessage);
        }
    });

    return {
        user,
        isLoading,
        error,
        login:loginMutation.mutateAsync,
        register:registerMutation.mutateAsync,
        logout:logoutMutation.mutateAsync,
        updateUser:updateUserMutation.mutate,
        isLoginPending:loginMutation.isPending,
        isRegisterPending:registerMutation.isPending,
        isLogoutPending:logoutMutation.isPending,
    };
};