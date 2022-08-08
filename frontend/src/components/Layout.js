import React from 'react'
import HeaderBar from './HeaderBar'
import SideBar from './SideBar'

export default function Layout({ children }) {

  return (
    <div>
      <div className="flex flex-col">
        <HeaderBar />
      </div>
      <div className="flex flex-row h-screen">
        <SideBar />
        <main className="w-full">{children}</main>
      </div>
    </div>


  )
}
