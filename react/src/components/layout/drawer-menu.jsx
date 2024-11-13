import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Sidebar } from "../extra/sidebar";
import { useEffect, useState } from "react";
import { useMediaQuery } from "@/lib/media-query";

export function DrawerMenu({ children, openDrawer }) {
  const [open, setOpen] = useState(openDrawer);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const onOpenChange = (open) => {
    // if (!open) setOpen(open);
  };

  useEffect(() => {
    setOpen((prevValue) => !prevValue);
    if (isDesktop) {
      setOpen(false);
    }
  }, [isDesktop, openDrawer]);

  return (
    <Drawer direction="left" open={false} onOpenChange={onOpenChange}>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent
        className="h-full w-3/4 mt-0"
        style={{ height: "100% !important" }}
      >
        <div className="h-full max-h-sm">
          <div className="p-0 m-0">
            <Sidebar open={open} setOpen={setOpen} />
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
