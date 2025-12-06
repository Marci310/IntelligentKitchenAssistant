import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../service/api.ts';
import { ingredientSchema } from "../schemas/backendSchemas.ts";
import { toast } from 'react-toastify';
import { z } from 'zod';
import { AxiosError } from 'axios';

export const useInventory = () => {
    const queryClient = useQueryClient();

    const {data:inventory, isLoading, error, refetch} = useQuery({
        queryKey:['inventory'],
        queryFn:async () => {
            const response = await apiClient.get('/ingredients');
            return response.data;
        },
    });

    const addIngredientMutation = useMutation({
        mutationFn:async (newIngredient: z.infer<typeof ingredientSchema>) => {
            const response = await apiClient.post('/ingredients', newIngredient);
            return response.data;
        },
        onSuccess:() => {
            queryClient.invalidateQueries({queryKey:['inventory']}).then(() =>
                toast.success("Ingredient added successfully!")
            );
        },
        onError:(error: AxiosError<{ message: string }>) => {
            const errorMessage = error?.response?.data?.message || error?.message || "Failed to add ingredient.";
            toast.error(errorMessage);
        }
    });

    const deleteIngredientMutation = useMutation({
        mutationFn:async (ingredientId: string) => {
            await apiClient.delete(`/ingredients/${ingredientId}`);
        },
        onSuccess:() => {
            queryClient.invalidateQueries({queryKey:['inventory']}).then(() => toast.success("Ingredient deleted successfully!"));
        },
        onError:(error: AxiosError<{ message: string }>) => {
            const errorMessage = error?.response?.data?.message || error?.message || "Failed to delete ingredient.";
            toast.error(errorMessage);
        }
    });

    return {
        inventory,
        isLoading,
        error,
        refetch,
        addIngredient:addIngredientMutation.mutate,
        deleteIngredient:deleteIngredientMutation.mutate,
    };
}