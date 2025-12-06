import { Card } from "flowbite-react";

type RecipeProps = {
    id?: string;
    title: string;
    shortDescription: string | undefined;
    imageUrl: string | undefined;
}

export function RecipeCard(props: RecipeProps) {
    return (
        <Card
            className="max-w-sm"
            imgAlt="Recipe Image"
            imgSrc={props.imageUrl}
            href={`/recipes/${props.id}`}
        >
            <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                {props.title}
            </h5>
            <p className="font-normal text-gray-700 dark:text-gray-400">
                {props.shortDescription}
            </p>
        </Card>
    );
}
