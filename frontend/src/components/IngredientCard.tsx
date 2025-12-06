import { useState } from "react";
import { ingredientFormSchema } from "../schemas/formSchemas.ts";
import { Button, Label, TextInput, HelperText, Select } from "flowbite-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useInventory } from "../hooks/useInventory.ts";
import { AssignIcon } from "../utils/AssignIcon.tsx";

type Ingredient = z.infer<typeof ingredientFormSchema>;

export function IngredientCard(ingredient: Ingredient) {
    const [editMode, setEditMode] = useState(false);
    const {addIngredient, deleteIngredient} = useInventory();
    const {register, handleSubmit, formState:{errors, isSubmitting}} = useForm<Ingredient>({
        resolver:zodResolver(ingredientFormSchema),
        defaultValues:{
            id:ingredient?.id ?? "0",
            name:ingredient?.name ?? "",
            quantity:ingredient?.quantity ?? 0,
            unit:ingredient?.unit ?? "",
            category:ingredient?.category ?? "Other",
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
        <div className="border rounded-lg p-4 shadow-md w-full">
            {editMode ? (
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="flex flex-wrap items-start gap-4">
                        <div className="flex flex-wrap md:flex-nowrap gap-4 w-full">
                            <div className="flex-1 min-w-[150px]">
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
                            <div className="flex-1 min-w-[150px]">
                                <Label htmlFor="quantity">Quantity</Label>
                                <TextInput
                                    id="quantity"
                                    type="number"
                                    step={0.0001}
                                    {...register("quantity", {valueAsNumber:true})}
                                    color={errors.quantity ? "failure" : undefined}
                                />
                                {errors.quantity?.message && <HelperText>
                                    <span className="font-medium">{errors.quantity?.message}</span>
                                </HelperText>}
                            </div>
                            <div className="flex-1 min-w-[150px]">
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
                            <div className="flex-1 min-w-[150px]">
                                <Label htmlFor="category">Category</Label>
                                <Select
                                    id="category"
                                    {...register("category")}
                                >
                                    <option value="Vegetables">Vegetables</option>
                                    <option value="Fruits">Fruits</option>
                                    <option value="Dairies">Dairies</option>
                                    <option value="Meats">Meats</option>
                                    <option value="Pastries">Pastries</option>
                                    <option value="Spices">Spices</option>
                                    <option value="Cans">Cans</option>
                                    <option value="Other">Other</option>
                                </Select>
                                {errors.category?.message && <HelperText>
                                    <span className="font-medium">{errors.category?.message}</span>
                                </HelperText>}
                            </div>
                        </div>
                        <div className="flex gap-2 pt-2 md:pt-6 w-full md:w-auto justify-end">
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? "Saving..." : "Save"}
                            </Button>
                            <Button color="gray" onClick={() => setEditMode(false)}>
                                Cancel
                            </Button>
                        </div>
                    </div>
                </form>
            ) : (
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-5">
                        {ingredient.id != "0" ?
                            (<>
                                <h3 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">{ingredient.name}</h3>
                                <p className="text-gray-600 dark:text-gray-400">Quantity: {ingredient.quantity} {ingredient.unit}</p>
                                <AssignIcon category={ingredient.category}/>
                            </>)
                            :
                            (<h3 className="text-xl font-semibold text-gray-500 dark:text-gray-400 ">Add New
                                Ingredient</h3>)}
                    </div>
                    <div className="flex gap-2 self-end md:self-center">
                        {ingredient.id != "0" ?
                            (<>
                                <Button onClick={() => setEditMode(true)}>
                                    Edit
                                </Button>
                                <Button
                                    onClick={(ingredient.id) ? () => deleteIngredient(ingredient.id) : undefined}
                                    color="red">
                                    Delete
                                </Button>
                            </>)
                            :
                            <Button onClick={() => setEditMode(true)}>
                                Add
                            </Button>
                        }
                    </div>
                </div>
            )}
        </div>
    );
}