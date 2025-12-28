import React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CgProfile } from "react-icons/cg";

const Header = () => {
  return (
    <header className="sticky -top-3 z-50 w-7xl bg-white border-b shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Left Section */}
          <h1 className="text-lg sm:text-xl font-semibold text-gray-900">
            User Dashboard
          </h1>
          {/* Right Section */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full h-9 w-9"
              >
                <CgProfile className="h-5 w-5 text-gray-700" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              className="w-56 mt-2"
              align="end"
              sideOffset={8}
            >
              <DropdownMenuLabel className="text-xs text-gray-500">
                My Account
              </DropdownMenuLabel>

              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <div className="flex flex-col">
                    <span className="font-medium">User Name</span>
                    <span className="text-xs text-gray-500">LC ID: 000123</span>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuGroup>

              <DropdownMenuSeparator />

              <DropdownMenuItem className="text-red-600 focus:text-red-600">
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
