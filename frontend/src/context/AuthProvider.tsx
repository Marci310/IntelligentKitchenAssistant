import React, { createContext, useContext, type ReactNode } from 'react';
import { z } from 'zod';
import { userSchema } from '../schemas/backendSchemas';
import { useUser } from "../hooks/useUser.ts";

type User = z.infer<typeof userSchema>;

interface AuthContextType {
    user: User | null | undefined;
    login: (username: string, password: string) => Promise<void>;
    register: (username: string, fullName: string, password: string, dateOfBirth: string) => Promise<void>;
    logout: () => Promise<void>;
    isAuthenticated: boolean;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const { user, isLoading, login, register, logout } = useUser();

    const value = {
        user: user ?? null,
        login: async (username: string, password: string) => {
            await login({ username, password });
        },
        register: async (username: string, fullName: string, password: string, dateOfBirth: string) => {
            await register({ username, fullName, password, dateOfBirth });
        },
        logout,
        isAuthenticated: !!user,
        isLoading,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
