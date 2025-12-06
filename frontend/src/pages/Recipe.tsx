import { useRecipe } from '../hooks/useRecipe';
import { useRecipes } from "../hooks/useRecipes";
import { useNavigate, useParams } from "react-router-dom";

export default function Recipe() {
    const {id} = useParams<{ id: string }>();
    const {recipe, isLoading, error} = useRecipe(id);
    const {deleteRecipe} = useRecipes();
    const navigate = useNavigate();

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error loading recipe.</div>;
    }

    if (!recipe) {
        return <div>Recipe not found.</div>;
    }

    const deleteRecipeAndNavigate = (id: string) => {
        deleteRecipe(id);
        navigate('/recipes');
    }

    return (
        <div className="flex justify-center overflow-hidden">
            <div className="w-full max-w-7xl px-6 pb-16">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
                        {recipe.title}
                    </h1>
                    <svg onClick={() => deleteRecipeAndNavigate(recipe?.id)}
                         className="w-6 h-6 text-red-600 ml-6 dark:text-red-500 cursor-pointer hover:text-red-700 dark:hover:text-red-400 transition-colors"
                         aria-hidden="true"
                         xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                              d="M5 7h14m-9 3v8m4-8v8M10 3h4a1 1 0 0 1 1 1v3H9V4a1 1 0 0 1 1-1ZM6 7h12v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7Z"/>
                    </svg>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <p className="text-gray-700 dark:text-gray-400">
                        {recipe.shortDescription}
                    </p>
                    <img
                        className="rounded-lg shadow-md w-full h-auto object-cover"
                        src={recipe.imageUrl}
                        alt={`${recipe.title} image`}
                    />
                </div>
                <div className="mb-6">
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white mb-4">
                        Ingredients
                    </h2>
                    <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-400">
                        {recipe.ingredients.map((ingredient, index) => (
                            <li key={index}>
                                {ingredient.quantity} {ingredient.unit} - {ingredient.name}
                            </li>
                        ))}
                    </ul>
                </div>
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white mb-4">
                        Instructions
                    </h2>
                    <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-400">
                        {recipe.instructions.map((step, index) => (
                            <li key={index}>{step}</li>
                        ))}
                    </ol>
                </div>
            </div>
        </div>

    )
}