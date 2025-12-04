import { useState } from "react";
import { ingredientSchema } from "../schemas/backendSchemas.ts";
import { Button, Label, TextInput, HelperText } from "flowbite-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useInventory } from "../hooks/useInventory.ts";

type Ingredient = z.infer<typeof ingredientSchema>;

export function IngredientCard(ingredient: Ingredient) {
    const [editMode, setEditMode] = useState(false);
    const {addIngredient, deleteIngredient} = useInventory();
    const {register, handleSubmit, formState:{errors, isSubmitting}} = useForm<Ingredient>({
        resolver:zodResolver(ingredientSchema),
        defaultValues:{
            id:ingredient.id,
            name:ingredient.name,
            quantity:ingredient.quantity,
            unit:ingredient.unit,
        }
    });

    const onSubmit = async (data: Ingredient) => {
        try {
            addIngredient(data);
            setEditMode(false);
        } catch (error) {
            console.error("Failed to update ingredient:", error);
        }
    };

    return (
        <div className="border rounded-lg p-4 shadow-md">
            {editMode ? (
                <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
                    <div>
                        <Label htmlFor="name">Name</Label>
                        <TextInput
                            id="name"
                            {...register("name")}
                            color={errors.name ? "failure" : undefined}
                        />
                        {errors.name?.message && <HelperText>
                            <span className="font-medium">{errors.name?.message}</span>
                        </HelperText>}
                    </div>
                    <div>
                        <Label htmlFor="quantity">Quantity</Label>
                        <TextInput
                            id="quantity"
                            type="number"
                            {...register("quantity", {valueAsNumber:true})}
                            color={errors.quantity ? "failure" : undefined}
                        />
                        {errors.quantity?.message && <HelperText>
                            <span className="font-medium">{errors.quantity?.message}</span>
                        </HelperText>}
                    </div>
                    <div>
                        <Label htmlFor="unit">Unit</Label>
                        <TextInput
                            id="unit"
                            {...register("unit")}
                            color={errors.unit ? "failure" : undefined}
                        />
                        {errors.unit?.message && <HelperText>
                            <span className="font-medium">{errors.unit?.message}</span>
                        </HelperText>}
                    </div>
                    <div className="flex gap-2">
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Saving..." : "Save"}
                        </Button>
                        <Button color="gray" onClick={() => setEditMode(false)}>
                            Cancel
                        </Button>
                    </div>
                </form>
            ) : (
                <div>
                    <h3 className="text-xl font-semibold mb-2">{ingredient.name}</h3>
                    <p className="text-gray-600">Quantity: {ingredient.quantity} {ingredient.unit}</p>
                    <Button onClick={() => setEditMode(true)}>Edit</Button>
                    <Button onClick={(ingredient.id) ? () => deleteIngredient(ingredient.id) : undefined} color="red" className="ml-2">
                        Delete
                    </Button>
                </div>
            )}
        </div>
    );
}