import { useRecipe } from '../hooks/useRecipe';
import { useParams } from "react-router-dom";

export default function Recipe() {
    const { id } = useParams<{ id: string }>();
    const { recipe, isLoading, error } = useRecipe(id);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error loading recipe.</div>;
    }

    if (!recipe) {
        return <div>Recipe not found.</div>;
    }

    return (
        <div>
            <h1>{recipe.title}</h1>
            <div className="grid grid-flow-cols-1 md:grid-flow-cols-2">
                <img className="recipe-image" src={recipe.imageUrl} alt={`${recipe.title} image`} />
                <p>{recipe.shortDescription}</p>
            </div>
            <h2>Ingredients</h2>
            <ul>
                {recipe.ingredients.map((ingredient, index) => (
                    <li key={index}>{ingredient.quantity} {ingredient.unit} - {ingredient.name}</li>
                ))}
            </ul>
            <div>
                <h2>Instructions</h2>
                <p>{recipe.instructions}</p>
            </div>
        </div>

    )
}