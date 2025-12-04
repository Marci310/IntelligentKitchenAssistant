import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import apiClient from '../service/api.ts';
import {userSchema} from "../schemas/backendSchemas.ts";
import {toast} from 'react-toastify';
import {z} from 'zod';

type User = z.infer<typeof userSchema>;

export const useUser = () => {
    const queryClient = useQueryClient();

    const {data: user, isLoading, error} = useQuery({
        queryKey: ['user'],
        queryFn: async () => {
            const response = await apiClient.get('/user');
            return userSchema.parse(response.data);
        },
        retry: false,
    });

    const loginMutation = useMutation({
        mutationFn: async ({username, password}: { username: string; password: string }) => {
            const response = await apiClient.post('/auth/login', {username, password});
            return userSchema.parse(response.data.user);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['user']});
            toast.success('Login successful!');
        },
        onError: (error) => {
            const errorMessage = error?.message || 'Login failed';
            toast.error(errorMessage);
        }
    });

    const registerMutation = useMutation({
        mutationFn: async ({
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
        onSuccess: () => {
            toast.success('Registration successful! Please log in.');
        },
        onError: (error) => {
            const errorMessage = error?.message || 'Registration failed';
            toast.error(errorMessage);

        }
    });

    const logoutMutation = useMutation({
        mutationFn: async () => {
            await apiClient.post('/auth/logout');
        },
        onSuccess: () => {
            queryClient.setQueryData(['user'], null);
            toast.success('Logged out successfully');
        },
        onError: (error) => {
            const errorMessage = error?.message || 'Logout failed';
            toast.error(errorMessage);
        }
    });

    const updateUserMutation = useMutation({
        mutationFn: async (updatedUser: User) => {
            const response = await apiClient.put('/user', updatedUser);
            return userSchema.parse(response.data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['user']});
            toast.success("User updated successfully!");
        },
        onError: (error) => {
            toast.error(error?.message || "Failed to update user.");
        }
    });

    return {
        user,
        isLoading,
        error,
        login: loginMutation.mutateAsync,
        register: registerMutation.mutateAsync,
        logout: logoutMutation.mutateAsync,
        updateUser: updateUserMutation.mutate,
        isLoginPending: loginMutation.isPending,
        isRegisterPending: registerMutation.isPending,
        isLogoutPending: logoutMutation.isPending,
    };
};