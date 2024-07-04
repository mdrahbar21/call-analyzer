"use client"

import React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { IoMdClose } from 'react-icons/io';
import { logo } from "@/assets"
import { links } from '@/data/dummy';
import { AppStateContext } from '@/components/contexts/contextProvider';



const Sidebar = () => {
  const { currentColor, activeMenu, setActiveMenu, screenSize, toggleActiveMenu } = AppStateContext();
  const router = useRouter();

  const formatName = (name:string) => {
    const formattedName = name.replace(/([A-Z])/g, ' $1').trim();
    return formattedName;
  };

  const handleCloseSideBar = () => {
    if (activeMenu !== undefined && screenSize <= 900) {
      toggleActiveMenu();
    }
  };
  const pathname = usePathname()


  const activeLink = 'flex items-center gap-5 pl-4 pt-3 pb-2.5 rounded-lg text-black text-md m-2';
  const normalLink = 'flex items-center gap-5 pl-4 pt-3 pb-2.5 rounded-lg text-md hover:bg-white hover:text-black m-2';

  return (
    <div className="h-screen md:overflow-hidden overflow-auto md:hover:overflow-auto lg:hover:overflow-auto pb-10 lg:overflow-hidden" style={{ backgroundColor: '#000', color: '#fff' }}>
      {activeMenu && (
        <>
          <div className="flex justify-between items-center">
            <Link href="/" passHref legacyBehavior>
              <a className="items-center gap-3 ml-3 mt-4 flex text-xl font-extrabold tracking-tight text-white" onClick={handleCloseSideBar}>
                <img src={logo.src} /> <span>HoomanLabs</span>
              </a>
            </Link>
            <button
              onClick={() => setActiveMenu(!activeMenu)}
              className="p-3 hover:bg-gray-200 mr-3 mt-4"
              aria-label="Close sidebar"
            >
              {/* <IoMdClose size={24} color="white" /> */}
            </button>
          </div>
          <div className="mt-10">
            {links.map((item) => (
              <div key={item.title}>
                <p className="text-gray-400 m-3 mt-4 ">
                  {item.title}
                </p>
                {item.links.map((link) => (
                  <Link href={`/${link.address}`} key={link.name} passHref legacyBehavior>
                    <a
                      onClick={handleCloseSideBar}
                      className={pathname === `/${link.address}` ? activeLink : normalLink}
                      style={{ backgroundColor: pathname === `/${link.address}` ? currentColor : undefined }}
                    >
                      <span className="capitalize">{formatName(link.name)}</span>
                    </a>
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Sidebar;
