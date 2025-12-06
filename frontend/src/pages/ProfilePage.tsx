import { Button, Label, TextInput, HelperText, Avatar } from "flowbite-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUser } from "../hooks/useUser";
import { useEffect } from "react";
import { profileFormSchema } from "../schemas/formSchemas";
import { useNavigate } from "react-router-dom";

type ProfileFormData = z.infer<typeof profileFormSchema>;

export function ProfilePage() {
    const { user, isLoading, updateUser } = useUser();
    const { logout } = useUser();
    const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<ProfileFormData>({
        resolver: zodResolver(profileFormSchema),
    });
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            reset({
                username: user.username,
                fullName: user.fullName,
                dateOfBirth: new Date(user.dateOfBirth).toISOString().split('T')[0]
            });
        }
    }, [user, reset]);

    const logoutUser = async () => {
        await logout();
        navigate('/login');
    };

    const onSubmit = async (data: ProfileFormData) => {
        updateUser(data);
    };

    if (isLoading) {
        return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
    }

    if (!user) {
        return <div className="flex justify-center items-center min-h-screen">Please log in to view your profile</div>;
    }
    const monogram = (user.fullName || '')
        .split(' ')
        .map((n: string) => n[0] ?? '')
        .join('')
        .toUpperCase()
        .slice(0, 2);

    return (
        <div className="flex justify-center min-h-screen">

            <div className="w-full max-w-md p-6">
                <Avatar size="md" placeholderInitials={monogram} rounded/>
                <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white mb-6">Profile</h2>
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
                            <span className="font-medium">{errors.username.message}</span>
                        </HelperText>}
                    </div>
                    <div>
                        <div className="mb-2 block">
                            <Label htmlFor="fullName">Full name</Label>
                        </div>
                        <TextInput
                            id="fullName"
                            placeholder="Full Name"
                            {...register("fullName")}
                            color={errors.fullName ? "failure" : undefined}
                        />
                        {errors.fullName?.message && <HelperText>
                            <span className="font-medium">{errors.fullName.message}</span>
                        </HelperText>}
                    </div>
                    <div>
                        <div className="mb-2 block">
                            <Label htmlFor="dateOfBirth">Date of Birth</Label>
                        </div>
                        <TextInput
                            id="dateOfBirth"
                            type="date"
                            {...register("dateOfBirth")}
                            color={errors.dateOfBirth ? "failure" : undefined}
                        />
                        {errors.dateOfBirth?.message && <HelperText>
                            <span className="font-medium">{errors.dateOfBirth.message}</span>
                        </HelperText>}
                    </div>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Updating..." : "Update Profile"}
                    </Button>
                    <Button color="gray" onClick={logoutUser} disabled={isSubmitting}>
                        Logout
                    </Button>
                </form>
            </div>
        </div>
    );
}