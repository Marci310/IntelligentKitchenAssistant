import {Button, Label, TextInput, HelperText} from "flowbite-react";
import {useForm} from "react-hook-form";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {useAuth} from "../context/AuthProvider";
import {registerFormSchema} from "../schemas/formSchemas";

type RegisterFormData = z.infer<typeof registerFormSchema>;

export function RegisterForm() {
    const {register: registerUser} = useAuth();
    const {register, handleSubmit, formState: {errors, isSubmitting}} = useForm<RegisterFormData>({
        resolver: zodResolver(registerFormSchema),
    });

    const onSubmit = async (data: RegisterFormData) => {
        try {
            await registerUser(data.username, data.fullName, data.password, data.dateOfBirth);
        } catch (error) {
            console.error("Registration failed:", error);
        }
    };

    return (
        <>
            <h2>Register</h2>
            <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
                <div>
                    <div className="mb-2 block">
                        <Label htmlFor="username1">Username</Label>
                    </div>
                    <TextInput
                        id="username1"
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
                        <Label htmlFor="name">Full name</Label>
                    </div>
                    <TextInput
                        id="name"
                        placeholder="Full Name"
                        {...register("fullName")}
                        color={errors.fullName ? "failure" : undefined}
                    />
                    {errors.fullName?.message && <HelperText>
                        <span className="font-medium">{errors.fullName?.message}</span>
                    </HelperText>}
                </div>
                <div>
                    <div className="mb-2 block">
                        <Label htmlFor="password1">Password</Label>
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
                <div>
                    <div className="mb-2 block">
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                    </div>
                    <TextInput
                        id="confirmPassword"
                        type="password"
                        {...register("confirmPassword")}
                        color={errors.confirmPassword ? "failure" : undefined}
                    />
                    {errors.confirmPassword?.message && <HelperText>
                        <span className="font-medium">{errors.confirmPassword?.message}</span>
                    </HelperText>}
                </div>
                <div>
                    <div className="mb-2 block">
                        <Label htmlFor="date1">Date of Birth</Label>
                    </div>
                    <TextInput
                        id="date1"
                        type="date"
                        {...register("dateOfBirth")}
                        color={errors.dateOfBirth ? "failure" : undefined}
                    />
                    {errors.dateOfBirth?.message && <HelperText>
                        <span className="font-medium">{errors.dateOfBirth?.message}</span>
                    </HelperText>}
                </div>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Submit"}
                </Button>
            </form>
        </>
    );
}