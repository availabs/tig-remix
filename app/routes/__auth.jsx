import {
  Outlet,
  NavLink,
  Link,
  useLoaderData
} from "@remix-run/react";

import { checkAuth } from "~/utils/session.server";

export async function loader ({ request }) {
  return await checkAuth(request)
}

export default function Index() {
  const user = useLoaderData()
  return (
    <div className={'max-w-5xl mx-auto'}>
      <div className='bg-gray-100 px-4 text-gray-500 min-h-screen'>
        <div className='flex p-2 text-gray-800 border-b w-full'>
          <NavLink to='/' className='p-4'>Home</NavLink>
          <div className='flex flex-1 justify-end '>
            <div className='p-4'>
            {user ? 
              (<div className='flex'> 
                <div className='px-4'> {user.id} </div>  
                <form action="/logout" method="post">
                  <button type="submit" className="">
                    Logout
                  </button>
                </form> 
                </div>
              ) : 
              (<Link to='/login'>Login</Link>)
            }</div>

          </div>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
