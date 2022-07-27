import React from 'react'
import HeaderBar from './HeaderBar'
import SideBar from './SideBar'

export default function Layout({ children }) {
  return (
    <div>
        <div className="flex-col">
        <HeaderBar/>
        </div>
        <div className="flex flew-row h-screen">
          <SideBar/>
          <main className="flex-1">{children}</main>        
      </div>
    </div>


  )
}
