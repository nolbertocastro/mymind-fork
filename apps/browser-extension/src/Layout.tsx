import { Outlet, useNavigate } from "react-router-dom";

import usePluginSettings from "./utils/settings";

/**
 * Root layout for the popup save flow.
 *
 * Deliberately chrome-less — no header, no footer buttons, no card shell.
 * The popup renders the mymind-style save card edge-to-edge; nesting it
 * inside another gray container would break the "the popup IS the card"
 * feel. Errors and configuration prompts get their own padding.
 */
export default function Layout() {
  const navigate = useNavigate();
  const { settings, isPending: isInit } = usePluginSettings();
  if (!isInit) {
    return <div className="p-4">Loading ... </div>;
  }

  if (!settings.apiKey || !settings.address) {
    navigate("/notconfigured");
    return;
  }

  return <Outlet />;
}
