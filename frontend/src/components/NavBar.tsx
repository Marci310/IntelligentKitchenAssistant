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

type NavbarProps = {
    name: string;
    email?: string;
}

export function NavBar(props: NavbarProps) {
const monogram = (props.name || '')
            .split(' ')
            .map((n) => n[0] ?? '')
            .join('')
            .toUpperCase()
            .slice(0, 2);
    return (
        <Navbar fluid rounded>
            <NavbarBrand href="/">
                <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white">Intelligent Kitchen Assistant</span>
            </NavbarBrand>
            <div className="flex md:order-2">
                <Dropdown
                    arrowIcon={false}
                    inline
                    label={
                        <Avatar placeholderInitials={monogram} rounded />
                    }
                >
                    <DropdownHeader>
                        <span className="block text-sm">{props.name}</span>
                        <span className="block truncate text-sm font-medium">{props.email}</span>
                    </DropdownHeader>
                    <DropdownItem href="/profile">Profile</DropdownItem>
                    <DropdownDivider />
                    <DropdownItem href="/logout">Sign out</DropdownItem>
                </Dropdown>
                <NavbarToggle />
            </div>
            <NavbarCollapse>
                <NavbarLink href="/recipes" active>
                    Recipes
                </NavbarLink>
                <NavbarLink href="/inventory">Inventory</NavbarLink>
            </NavbarCollapse>
        </Navbar>
    );
}
