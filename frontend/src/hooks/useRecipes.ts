import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import apiClient from '../service/api.ts';
import {recipeSchema} from "../schemas/backendSchemas.ts";
import {toast} from 'react-toastify';
import { z } from 'zod';

export const useRecipes = () => {
    const queryClient = useQueryClient();

    const {data: recipes, isLoading, error} = useQuery({
        queryKey: ['recipes'],
        queryFn: async () => {
            const response = await apiClient.get('/recipes');
            return response.data;
        },
    });

    const addRecipeMutation = useMutation({
        mutationFn: async (newRecipe: z.infer<typeof recipeSchema>) => {
            const response = await apiClient.post('/recipes', newRecipe);
            return recipeSchema.parse(response.data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['recipes']}).then(() => toast.success("Recipe added successfully!"));
        },
        onError: (error) => {
            toast.error(error?.message || "Failed to add recipe.");
        }
    });

    const deleteRecipeMutation = useMutation({
        mutationFn: async (recipeId: bigint) => {
            await apiClient.delete(`/recipes/${recipeId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['recipes']}).then(() => toast.success("Recipe deleted successfully!"));
        },
        onError: (error) => {
            toast.error(error?.message || "Failed to delete recipe.");
        }
    });

    return {
        recipes,
        isLoading,
        error,
        addRecipe: addRecipeMutation.mutate,
        deleteRecipe: deleteRecipeMutation.mutate,
    };
}