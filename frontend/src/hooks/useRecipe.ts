import { useQuery } from "@tanstack/react-query";
import apiClient from "../service/api.ts";
import { recipeSchema } from "../schemas/backendSchemas.ts";

export const useRecipe = (recipeId: string | undefined) => {
    const { data: recipe, isLoading: recipeLoading, error: recipeError } = useQuery({
        queryKey: ['recipe', recipeId],
        queryFn: async () => {
            const response = await apiClient.get(`/recipes/${recipeId}`);
            return recipeSchema.parse(response.data);
        },
        enabled: !!recipeId,
    });

    return {
        recipe,
        isLoading: recipeLoading,
        error: recipeError,
    };
};