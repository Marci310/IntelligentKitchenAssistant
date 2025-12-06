import {Card} from "flowbite-react";
import {LoginForm} from "../components/LoginForm";
import {RegisterForm} from "../components/RegisterForm";

type LoginRegisterProps = {
    isLoginMode: boolean;
}

export function LoginRegister(props: LoginRegisterProps) {
    return (
        <div className="flex justify-center items-center">
            <Card className="max-w-md w-full">
                {props.isLoginMode ? <LoginForm/> : <RegisterForm/>}
            </Card>
        </div>
    );
}