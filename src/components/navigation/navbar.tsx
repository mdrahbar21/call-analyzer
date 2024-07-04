import { useEffect } from "react";
import { useSession, signIn, signOut } from 'next-auth/react';
import Link from "next/link";
import { AppStateContext } from "@/components/contexts/contextProvider";
// import { logout } from "@/lib/firebase";
// import { NavigationMenuDemo } from "./navMenu";
// import { AiOutlineMenu } from 'react-icons/ai';
import Tippy from "@tippyjs/react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import Image from "next/image";


const NavButton = ({ title, customFunc, icon}: { title: string, customFunc: () => void, icon: any}) => (
  <Tippy content={title} >
    <button
      type="button"
      onClick={() => customFunc()}
      className="relative text-xl rounded-full p-3 hover:bg-light-gray"
    >
      <span
        className="absolute inline-flex rounded-full h-2 w-2 right-2 top-2"
      />
      {icon}
    </button>
  </Tippy>
);

export default function Navbar() {
  const { data: session, status } = useSession();
  const {activeMenu, setActiveMenu, screenSize}=AppStateContext();
  
  useEffect(() => {
    if (screenSize <= 900) {
      setActiveMenu(false);
    } else {
      setActiveMenu(true);
    }
  }, [screenSize]);

  // const handleActiveMenu = () => setActiveMenu(!activeMenu);

  return (
    <div className="flex justify-between p-2 md:ml-1 md:mr-1 relative ">
      {/* <NavButton title="Menu" customFunc={handleActiveMenu} icon={<AiOutlineMenu color="white"/>} /> */}
      <nav className="flex items-center justify-between w-full px-4 py-2 bg-black border-gray-200">
        <Link href="https://hoomanlabs.com" className="text-lg font-semibold text-white text-white-900">HoomanLabs</Link>
        {/* <NavigationMenuDemo /> */}
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="overflow-hidden rounded-full"
              >
                <Image
                  src={session?.user?.image || "/placeholder.jpg"}
                  width={36}
                  height={36}
                  alt="Avatar"
                  className="overflow-hidden rounded-full"
                />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
            <DropdownMenuLabel asChild>
              <a href="https://hoomanlabs.com">HoomanLabs Home</a>
            </DropdownMenuLabel>
              {/* <DropdownMenuSeparator /> */}
              {/* <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem>Support</DropdownMenuItem> */}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut()}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
      </nav>
    </div>
  )
}