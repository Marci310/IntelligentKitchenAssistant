import {Button, Label, TextInput, HelperText} from "flowbite-react";
import {useForm} from "react-hook-form";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {useAuth} from "../context/AuthProvider";
import {loginFormSchema} from "../schemas/formSchemas";

type LoginFormData = z.infer<typeof loginFormSchema>;

export function LoginForm() {
    const {login} = useAuth();
    const {register, handleSubmit, formState: {errors, isSubmitting}} = useForm<LoginFormData>({
        resolver: zodResolver(loginFormSchema),
    });

    const onSubmit = async (data: LoginFormData) => {
        try {
            await login(data.username, data.password);
        } catch (error) {
            console.error("Login failed:", error);
        }
    };

    return (
        <>
            <h2>Login</h2>
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
                    {isSubmitting ? "Logging in..." : "Submit"}
                </Button>
            </form>
        </>
    );
}
