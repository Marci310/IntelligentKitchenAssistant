import { Button, Label, TextInput, HelperText } from "flowbite-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "../hooks/useAuth";
import { loginFormSchema } from "../schemas/formSchemas";
import { useNavigate } from "react-router-dom";

type LoginFormData = z.infer<typeof loginFormSchema>;

export function LoginForm() {
    const {login} = useAuth();
    const navigate = useNavigate();
    const {register, handleSubmit, formState:{errors, isSubmitting}} = useForm<LoginFormData>({
        resolver:zodResolver(loginFormSchema),
    });

    const onSubmit = async (data: LoginFormData) => {
        try {
            await login(data.username, data.password);
            navigate('/recipes');
        } catch (error) {
            console.error("Login failed:", error);
        }
    };

    return (
        <>
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Login</h2>
            <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
                <div>
                    <div className="mb-2 block">
                        <Label htmlFor="username">Username</Label>
                    </div>
                    <TextInput
                        id="username"
                        placeholder="username"
                        {...register("username")}
                        color={errors.username ? "failure" : undefined}
                    />
                    {errors.username?.message && <HelperText>
                        <span className="font-medium">{errors.username?.message}</span>
                    </HelperText>}
                </div>
                <div>
                    <div className="mb-2 block">
                        <Label htmlFor="password1">Your password</Label>
                    </div>
                    <TextInput
                        id="password1"
                        type="password"
                        {...register("password")}
                        color={errors.password ? "failure" : undefined}
                    />
                    {errors.password?.message && <HelperText>
                        <span className="font-medium">{errors.password?.message}</span>
                    </HelperText>}
                </div>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Logging in..." : "Login"}
                </Button>
                <a href="/register" className="text-center text-sm text-blue-600 hover:underline dark:text-blue-500">
                    Don't have an account? Register here.
                </a>
            </form>
        </>
    );
}
