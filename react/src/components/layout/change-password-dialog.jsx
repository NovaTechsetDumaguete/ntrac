import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@ui/dialog";
import { Button } from "@ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@ui/form";

import { PasswordInput } from "@ui/password-input";
import axiosClient from "@/lib/axios-client";

const formSchema = z
  .object({
    currentPassword: z.string().min(1, {
      message: "Current password is required",
    }),
    newPassword: z
      .string()
      .min(6, { message: "Must be at least 6 characters" }),
    confirmPassword: z
      .string()
      .min(6, { message: "Must be at least 6 characters" }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const ChangePasswordDiaglog = ({ open, setDialogOpen }) => {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (data) => {
    setDialogOpen(false);
    console.log(data, "data");

    const promise = () =>
      new Promise((resolve, reject) => {
        axiosClient
          .post("/reset-password", {
            email: localStorage.getItem("SESSION_EMAIL"),
            password: data.currentPassword,
            new_password: data.newPassword,
            token: localStorage.getItem("ACCESS_TOKEN"),
          })
          .then((resp) => resolve(resp.data.message))
          .catch((err) => reject(err));
        // resolve("success");
        // reject("error");
      });

    toast.promise(promise, {
      loading: "Changing password...",
      success: (resp) => {
        return `Password changed`;
      },
      error: (err) => console.log(err),
      action: {
        label: "Close",
        onClick: () => console.log("Event has been created"),
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setDialogOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
          <DialogDescription>
            Change your password to secure your account.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-4 py-4">
              <div className="grid items-center gap-4 mx-5">
                <FormField
                  control={form.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Password</FormLabel>
                      <FormControl>
                        <PasswordInput
                          tabIndex="1"
                          placeholder="******"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid items-center gap-4 mx-5">
                <FormField
                  control={form.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <PasswordInput
                          tabIndex="2"
                          placeholder="******"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid items-center gap-4 mx-5">
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <PasswordInput
                          tabIndex="3"
                          placeholder="******"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <DialogFooter>
              <Button tabIndex="4" type="submit">
                Save changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
