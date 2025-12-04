import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import apiClient from '../service/api.ts';
import {ingredientSchema} from "../schemas/backendSchemas.ts";
import {toast} from 'react-toastify';
import { z } from 'zod';

export const useInventory = () => {
    const queryClient = useQueryClient();

    const {data: inventory, isLoading, error} = useQuery({
        queryKey: ['inventory'],
        queryFn: async () => {
            const response = await apiClient.get('/ingredients');
            return response.data;
        },
    });

    const addIngredientMutation = useMutation({
        mutationFn: async (newIngredient: z.infer<typeof ingredientSchema>) => {
            const response = await apiClient.post('/ingredients', newIngredient);
            return ingredientSchema.parse(response.data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['inventory']}).then(() => toast.success("Ingredients added successfully!"));
        },
        onError: (error) => {
            toast.error(error?.message || "Failed to add ingredient.");
        }
    });

    const deleteIngredientMutation = useMutation({
        mutationFn: async (ingredientId: bigint) => {
            await apiClient.delete(`/ingredients/${ingredientId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['inventory']}).then(() => toast.success("Ingredient deleted successfully!"));
        },
        onError: (error) => {
            toast.error(error?.message || "Failed to delete ingredient.");
        }
    });

    return {
        inventory,
        isLoading,
        error,
        addIngredient: addIngredientMutation.mutate,
        deleteIngredient: deleteIngredientMutation.mutate,
    };
}