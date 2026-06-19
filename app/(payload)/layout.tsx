import { RootLayout } from "@payloadcms/next/layouts";
import "@payloadcms/next/css";
import "./som-admin.css";
import React from "react";
import { importMap } from "./admin/importMap";
import { handleServerFunctions } from "./actions";

type Args = {
  children: React.ReactNode;
};

const configPromise = import("@payload-config").then((m) => m.default);

const Layout = ({ children }: Args) => (
  <RootLayout
    config={configPromise}
    importMap={importMap}
    serverFunction={handleServerFunctions as any}
  >
    {children}
  </RootLayout>
);

export default Layout;
