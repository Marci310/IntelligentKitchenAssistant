import { useQuery } from "@tanstack/react-query";
import apiClient from "../service/api.ts";
import { recipeSchema } from "../schemas/backendSchemas.ts";

import { AxiosError } from 'axios';

export const useRecipe = (recipeId: string | undefined) => {
    const { data: recipe, isLoading: recipeLoading, error: recipeError } = useQuery({
        queryKey: ['recipe', recipeId],
        queryFn: async () => {
            const response = await apiClient.get(`/recipes/${recipeId}`);
            return recipeSchema.parse(response.data);
        },
        enabled: !!recipeId,
        retry: (failureCount, error) => {
            if ((error as AxiosError)?.response?.status === 404) {
                return false;
            }
            return failureCount < 3;
        }
    });

    return {
        recipe,
        isLoading: recipeLoading,
        error: recipeError,
    };
};
