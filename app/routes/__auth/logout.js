import { redirect } from "@remix-run/node";

import { logout } from "~/utils/session.server";

export const action = async ({
  request,
}) => {
  return logout(request);
 };

export const loader = async ({request}) => {
  const pathname = new URL(request.url).pathname
  return logout(request);
};