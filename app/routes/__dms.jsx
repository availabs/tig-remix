import {
  Outlet,
  NavLink,
  useLoaderData
} from "@remix-run/react";

import { checkAuth } from "~/utils/session.server";

import AuthMenu from '~/modules/auth/AuthMenu'

export async function loader ({ request }) {
  return await checkAuth(request)
}

export default function Index() {
  const user = useLoaderData()
  return (
    <div className={'max-w-5xl mx-auto'}>
      <div className='bg-gray-100 px-4 text-gray-500 min-h-screen'>
        <Outlet />
      </div>
    </div>
  );
}

