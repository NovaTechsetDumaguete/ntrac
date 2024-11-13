import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import FormAlert from "./form-alert";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useStateContext } from "@/context/ContextProvider";
import axiosClient from "@/lib/axios-client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ui/select";

import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormLabel,
  FormMessage,
} from "@ui/form";
import { Input } from "@ui/input";

import {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogFooter,
} from "@ui/alert-dialog";

const FormSchema = z.object({
  team: z.string().min(1, {
    message: "Team name is required",
  }),
});

const FormContents = ({ setDialogOpen }) => {
  const form = useForm({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      team: "",
    },
  });
  const onSubmit = (data) => {
    setDialogOpen(false);
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-4 px-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <FormField
                control={form.control}
                name="team"
                render={({ field }) => (
                  <>
                    <FormItem className="col-span-4">
                      <FormLabel
                        htmlFor="name"
                        className="text-right font-bold"
                      >
                        Name
                      </FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Team name" />
                      </FormControl>
                      <FormMessage className="float-right" />
                    </FormItem>
                  </>
                )}
              />
            </div>
          </div>
        </form>
      </Form>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogAction onClick={form.handleSubmit(onSubmit)}>
          Submit
        </AlertDialogAction>
      </AlertDialogFooter>
    </>
  );
};

export function TeamSwitcher({ isCollapsed }) {
  const getTeams = async () => {
    const { data } = await axiosClient.get("/teams");
    return data.data;
  };

  const { setCurrentTeam, setTeams, teams, currentTeam } = useStateContext();
  const [selectedAccount, setSelectedAccount] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleAddTeam = () => {
    setDialogOpen(true);
  };

  const handleOnChange = (value) => {
    if (value === "new") {
      handleAddTeam();
      value = selectedAccount;
    }

    let teamId = teams.find((team) => team.name === value).id;
    setCurrentTeam(parseInt(teamId));
    localStorage.setItem("currentTeam", teamId);
    setSelectedAccount(value);
  };

  useEffect(() => {
    getTeams().then((data) => {
      let value = !currentTeam ? data[0].id : currentTeam;
      let team = data.find((team) => team.id === value);
      setSelectedAccount(team.name);
      setTeams(data);
      if (!currentTeam) {
        setCurrentTeam(team.id);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Select
        defaultValue={selectedAccount}
        value={selectedAccount}
        onValueChange={handleOnChange}
      >
        <SelectTrigger
          className={cn(
            "flex items-center gap-2 [&>span]:line-clamp-1 [&>span]:flex [&>span]:w-full [&>span]:items-center [&>span]:gap-1 [&>span]:truncate [&_svg]:h-4 [&_svg]:w-4 [&_svg]:shrink-0",
            isCollapsed &&
            "flex h-9 w-9 shrink-0 items-center justify-center p-0 [&>span]:w-auto [&>svg]:hidden"
          )}
          aria-label="Select team"
        >
          <SelectValue placeholder="Select a team">
            <span className={cn("ml-2", isCollapsed && "hidden")}>
              {selectedAccount}
            </span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {teams.map((team) => (
            <SelectItem key={team.id} value={team.name}>
              <div className="cursor-pointer flex items-center gap-3 [&_svg]:h-4 [&_svg]:w-4 [&_svg]:shrink-0 [&_svg]:text-foreground">
                {team.name}
              </div>
            </SelectItem>
          ))}
          <SelectItem
            onClick={handleAddTeam}
            className="cursor-pointer"
            value="new"
          >
            Add Team
          </SelectItem>
        </SelectContent>
      </Select>
      <FormAlert
        open={dialogOpen}
        title={"Add Team"}
        setDialogOpen={setDialogOpen}
      >
        <FormContents setDialogOpen={setDialogOpen} />
      </FormAlert>
    </>
  );
}
