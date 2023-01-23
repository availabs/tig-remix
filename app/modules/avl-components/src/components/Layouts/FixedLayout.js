import React from 'react';

import SideNav from '../Nav/Side'
import TopNav from '../Nav/Top'
import { useTheme } from "../../wrappers/with-theme"
// import { useComponents } from "../index"

import get from "lodash.get"


const FixedLayout = ({ headerBar = true,
                        navPosition, navBar = "side",
                        userMenu = "header",
                        menus = [], menuItems, ...props }) => {
  const [open, setOpen] = React.useState(false),
    toggle = React.useCallback(e => {
      setOpen(open => !open);
    }, []);

  const theme = useTheme();
  
  navBar = navPosition === undefined ? navBar : navPosition;
  menuItems = menuItems === undefined ? menus : menuItems;

  return (
    <div className={ `
      ${ theme.bg } ${ theme.text }
      min-h-screen w-full flex flex-col
    ` }>
      { navBar !== 'top' ? null : (
          <div className={ `fixed left-0 top-0 right-0 z-10` }>
            <TopNav { ...props }
              menuItems={ menuItems }
              open={ open }
              toggle={ toggle }
              rightMenu={ '' }/>
          </div>
        )
      }

      { navBar !== 'side' ? null : (
        <div className='fixed'>
          <SideNav { ...props }
            menuItems={ menuItems }
            open={ open }
            toggle={ toggle }
            bottomMenu={ '' }/>
          
        </div>
      )}

      <div className={ `
        flex-1 flex
        ${ headerBar || (navBar === "top") ?
          `pt-${ theme.topNavHeight }` : ''
        }
        ${ navBar === 'side' ? `md:pl-${ theme.sidebarW }` : '' }
      ` } style={ { alignItems: "stretch", justifyContent: "stretch" } }>
        <div className="w-full">
          <div className="w-full h-full">
            { props.children }
          </div>
        </div>
      </div>

    </div>
  )
}
export default FixedLayout
