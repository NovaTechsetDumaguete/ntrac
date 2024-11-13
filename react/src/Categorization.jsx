import { DashboardContextProvider } from "@/context/DashboardContextProvider";
// import { Separator } from "@ui/separator";
//<<<<<<<<< Temporary merge branch 1
//import { columns } from "@/components/extra/categories/columns";
//import { DataTable } from "@/components/extra/categories/data-table";
//=========
import { columns } from "@/components/extra/categorization/columns";
import { DataTable } from "@/components/extra/categorization/data-table";
// import { useEffect, useState } from "react";
import axiosClient from "./lib/axios-client";
import moment from "moment";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import TabContents from "./components/extra/uncategorized/tab-contents";
// import { DateRangePicker } from "./components/extra/date-range-picker";
import { DatePicker } from "./components/extra/date-picker";
import { useQuery } from "@tanstack/react-query";
// import { useEffect } from 'react';
// import { Button } from "@/components/ui/button";

import Echo from 'laravel-echo';

import Pusher from 'pusher-js';
window.Pusher = Pusher;

window.Echo = new Echo({
  broadcaster: 'reverb',
  key: import.meta.env.VITE_REVERB_APP_KEY,
  wsHost: import.meta.env.VITE_REVERB_HOST,
  wsPort: import.meta.env.VITE_REVERB_PORT ?? 80,
  wssPort: import.meta.env.VITE_REVERB_PORT ?? 443,
  forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'https') === 'https',
  enabledTransports: ['ws', 'wss'],
  withoutInterceptors: true,
});



const Categorization = () => {
  const { isLoading, isError, data } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await axiosClient.get("/categories");
      let tmpData = [];
      await res.data.data.forEach((item) => {
        tmpData.push({
          id: item.id,
          name: item.name,
          description: item.description,
          is_productive: item.is_productive,
          header_name: item.header_name,
          icon: item.icon,
          abbreviation: item.abbreviation,
          priority_id: item.priority_id,
          updated_at:
            item.updated_at ??
            moment(item.updated_at).format("YYYY-MM-DD HH:mm:ss"),
          created_at: item.created_at
            ? moment(item.created_at).format("YYYY-MM-DD HH:mm:ss")
            : null,
        });
      });
      return tmpData;
    },
  });

  return (
    <DashboardContextProvider>
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <div className="space-y-1">
            <h2 className="text-3xl font-bold tracking-tight">
              Categorization
            </h2>
          </div>
        </div>
        <Tabs defaultValue="uncategorized" className="h-full space-y-6">
          <div className="space-between flex items-center justify-between">
            <div className="space-x-2">
              <TabsList>
                <TabsTrigger value="uncategorized" className="relative">
                  Uncategorized / Neutral
                </TabsTrigger>
                <TabsTrigger value="categories">Categories</TabsTrigger>
              </TabsList>
            </div>
            <div className="space-x-2">
              <DatePicker />
            </div>
          </div>
          <TabsContent value="uncategorized">
            <TabContents />
          </TabsContent>
          <TabsContent value="categories">
            <DataTable
              data={data}
              isLoading={isLoading}
              isError={isError}
              columns={columns}
            />
          </TabsContent>
        </Tabs>

        {/* <Separator className="my-4" /> */}
        <div className="relative"></div>
      </div>
    </DashboardContextProvider>
  );
};

export default Categorization;
