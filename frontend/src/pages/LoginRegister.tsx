import {Card} from "flowbite-react";
import {LoginForm} from "../components/LoginForm";
import {RegisterForm} from "../components/RegisterForm";

type LoginRegisterProps = {
    isLoginMode: boolean;
}

export function LoginRegister(props: LoginRegisterProps) {
    return (
        <div className="flex flex-col md:flex-row justify-center items-center gap-8 p-8">
            <Card className="max-w-md w-full">
                {props.isLoginMode ? <RegisterForm/> : <LoginForm/>}
            </Card>
        </div>
    );
}