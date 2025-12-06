import {
    Avatar,
    Dropdown,
    DropdownDivider,
    DropdownHeader,
    DropdownItem,
    Navbar,
    NavbarBrand,
    NavbarCollapse,
    NavbarLink,
    NavbarToggle,
} from "flowbite-react";
import { useUser } from "../hooks/useUser.ts";
import { useLocation, useNavigate } from "react-router-dom";

type NavbarProps = {
    name: string;
    email?: string;
}

export function NavBar(props: NavbarProps) {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout } = useUser();

    const monogram = (props.name || '')
        .split(' ')
        .map((n) => n[0] ?? '')
        .join('')
        .toUpperCase()
        .slice(0, 2);

    const logoutUser = async () => {
        await logout();
        navigate('/login');
    };
    return (
       <Navbar fluid rounded>
            <NavbarBrand href="/">
                <img src="/logo2.png" className="mr-3 h-8 sm:h-9" alt="IKA Logo"/>
                <span className="text-3xl self-center whitespace-nowrap font-semibold dark:text-white">Intelligent Chef</span>
            </NavbarBrand>
            <div className="flex md:order-2">
                <Dropdown
                    arrowIcon={false}
                    inline
                    label={
                        <Avatar placeholderInitials={monogram} rounded/>
                    }
                >
                    <DropdownHeader>
                        <span className="block text-sm">{props.name}</span>
                        <span className="block truncate text-sm font-medium">{props.email}</span>
                    </DropdownHeader>
                    <DropdownItem href="/profile">Profile</DropdownItem>
                    <DropdownDivider/>
                    <DropdownItem onClick={logoutUser}>Sign out</DropdownItem>
                </Dropdown>
                <NavbarToggle/>
            </div>
            <NavbarCollapse>
                <NavbarLink className="text-xl" href="/recipes" active={location.pathname.startsWith('/recipes')}>
                    Recipes
                </NavbarLink>
                <NavbarLink className="text-xl" href="/inventory" active={location.pathname === '/inventory'}>
                    Inventory
                </NavbarLink>
            </NavbarCollapse>
        </Navbar>
    );
}
