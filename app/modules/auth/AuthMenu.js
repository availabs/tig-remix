import React from "react"
import { useTheme, Dropdown } from '~/modules/avl-components/src'
import { Link, useFetcher } from '@remix-run/react'

const UserMenu = ({user}) => {
    // const theme = useTheme()
    return (
        <div className={`flex justify-column align-middle py-1 px-4`}>
            <div className='pt-[4px]'>
                <span className={`rounded-full border-2 border-blue-400
                    inline-flex items-center justify-center 
                    h-6 w-6 sm:h-8 sm:w-8 ring-white text-white 
                    bg-blue-500 overflow-hidden`}>
                    <i className="fa-duotone fa-user fa-fw pt-2 text-2xl" aria-hidden="true"></i>
                </span>
            </div>
            
            <span className='pl-2'>
                <div className='text-md font-thin tracking-tighter  text-left text-blue-600 group-hover:text-white '>{user.email ? user.email : ''}</div>
                <div className='text-xs font-medium -mt-1 tracking-widest text-left text-gray-500 group-hover:text-gray-200'>{user.groups[0] ? user.groups[0] : ''}</div>
            </span>
        </div>
    )
}

export const Item = (to, icon, span, condition) => (
    condition === undefined || condition ?
        <Link to={ to } >
            <div className='px-6 py-2 bg-blue-500 text-white hover:text-blue-100'>
                <div className='hover:translate-x-2 transition duration-100 ease-out hover:ease-in'>
                    <i className={`${icon} `} />
                    <span className='pl-2'>{span}</span>
                </div>
            </div>
        </Link>
    : null
)


export default ({ user, items=[] }) => {
   
    const theme = useTheme()
    const fetcher = useFetcher();
    const logout = (e) => {
        fetcher.submit({},
            { 
                method: "post", 
                action: "/logout" 
            }
        );
    }

    return (
        <div className="h-full w-full">
            {!user ?
                <Link className={`${theme.topnav({}).navitemTop}`} to="/login">Login</Link> :
                <Dropdown control={<UserMenu user={user}/>} className={`hover:bg-blue-500 group `} >
                    <div className='p-1 bg-blue-500'>
                        {items
                            .filter((item => !item.auth || user.authLevel ))
                            .map((item,i) =>
                                <div className='py-1' key={i}> 
                                    {Item(item.to,item.icon, item.text)}
                                </div>
                            )}
                        <div className='border-t border-blue-400'> 
                            <form action="/logout" method="post">
                                <button type="submit"  onClick={logout} className='px-6 py-2 bg-blue-500 text-white hover:text-blue-100'>
                                    <div className='hover:translate-x-2 transition duration-100 ease-out hover:ease-in'>
                                        <i className={`fad fa-sign-out-alt pb-2`} />
                                        <span className='pl-2'>Logout</span>
                                    </div>
                                </button>
                            </form>
                        </div>
                    </div>
                       
                </Dropdown>
            }
        </div>
    )
}
