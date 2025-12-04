import { useInventory } from "../hooks/useInventory.ts";
import { z } from "zod";
import { IngredientCard } from "../components/IngredientCard";
import { ingredientSchema } from "../schemas/backendSchemas";

type Ingredient = z.infer<typeof ingredientSchema>;

export function Ingredients() {
    const {inventory, isLoading, error} = useInventory();

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error loading inventory.</div>;
    }

    return (
        <>
            <h2>Inventory</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-6">
                {inventory?.map((ingredient: Ingredient) => (
                    <IngredientCard
                        key={ingredient.id.toString()}
                        {...ingredient}
                    />
                ))}
            </div>
        </>
    );
}