import {
  Outlet,
  NavLink,
  useLoaderData
} from "@remix-run/react";

import TigMenu from '~/modules/tig/TigMenu'

import { checkAuth } from "~/utils/session.server";

import AuthMenu from '~/modules/auth/AuthMenu'

export async function loader ({ request }) {
  return await checkAuth(request)
}

export default function Index() {
  const user = useLoaderData()
  return (
    <div className={''}>
      <div className='xl:max-w-[1170px] lg:max-w-[970px] max-w-[750px] px-[15px] mx-auto min-h-screen flex flex-col z-10'>
        <TigMenu user={user}/>
        <div className=''>
          <div className='w-full border-b p-2'>breadcrumbs</div>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
