import React from "react"
import { TopNav } from '~/modules/avl-components/src'
import { Link } from '@remix-run/react'
import TigUserMenu from './TigUserMenu'
// import { Link } from 'react-router-dom'


const TigNav = ({user}) => {
    const userMenu = user ? 
        <TigUserMenu user={user} /> : 
        <div className='flex h-12 flex-col md:flex-row'>
            <a className='p-4 h-full bg-tigGray-200 my-2 md:my-0 md:mr-2 text-[13px] font-bold '>Welcome!</a>
            <a href={'/signup'} className='p-4 h-full hover:bg-tigGray-50 hover:text-yellow-500 hover:cursor-pointer bg-tigGray-200 mt-2 md:my-0 md:mr-2 text-[13px] font-light'>Sign up</a>
            <a href={'/login'} className='p-4 h-full hover:bg-tigGray-50 hover:text-yellow-500 hover:cursor-pointer bg-tigGray-200 text-[13px] font-light md:mr-2'>Login</a>
        </div>
                     
    return (
        <div className='z-50'>
            <TopNav
                leftMenu={(
                    <a href='/' className={' hover:bg-tigGray-50 h-12'}>
                        <img alt='NYMTC Logo' className={'bg-tigGray-200 hover:bg-tigGray-50'} style={{height:50}} src='/images/nymtc_logo.svg'/>
                    </a>)
                }
                rightMenu={userMenu }
            />
        </div>
    )
}

export default TigNav