import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

import { Bell, Menu, Search, CircleUser } from "lucide-react";
import { Button } from "@ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@ui/dropdown-menu";
import { Input } from "@ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@ui/sheet";

import { Sidebar } from "./extra/sidebar";
import Logout from "./layout/Logout";

export const description =
  "A products dashboard with a sidebar navigation and a main content area. The dashboard has a header with a search input and a user menu. The sidebar has a logo, navigation links, and a card with a call to action. The main content area shows an empty state with a call to action.";

export const iframeHeight = "800px";

export const containerClassName = "w-full h-full";

const TopbarHome = () => {
  return (
    <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
      <Link href="/" className="flex items-center gap-1 font-semibold">
        {/* <Package2 className="h-6 w-6" /> */}
        <img src={"/nt-logo.png"} className="h-6" alt="NT-Logo" />
        <span className="ml-1 hidden font-bold sm:inline-block">nTrac</span>
        <span className="hidden font-normal sm:inline-block">Admin</span>
      </Link>
      <Button variant="outline" size="icon" className="ml-auto h-8 w-8">
        <Bell className="h-4 w-4" />
        <span className="sr-only">Toggle notifications</span>
      </Button>
    </div>
  );
};

export default function BlockLayout({ children }) {
  const location = useLocation();
  useEffect(() => setCurrentRoute(location.pathname), [location]);
  const [currentRoute, setCurrentRoute] = useState("");
  // const [isCollapsed, setIsCollapsed] = useState(false);
  const isCollapsed = false;
  const [open, setOpen] = useState(false);

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      {/* Sidebar */}
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <TopbarHome />
          <Sidebar />
        </div>
      </div>
      {/*  */}
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
          <Sheet open={open} onOpenChange={() => setOpen(!open)}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 md:hidden"
                onClick={() => setOpen(!open)}
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col">
              <TopbarHome />
              <Sidebar open={open} setOpen={setOpen} />
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1">
            <form>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search anything..."
                  className="w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-1/3"
                />
              </div>
            </form>
          </div>
          <Logout />
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
