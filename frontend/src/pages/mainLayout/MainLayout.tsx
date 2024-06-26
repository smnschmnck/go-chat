import { Link, Outlet } from '@tanstack/react-router';
import emyhtLogo from '@assets/images/emyht-logo.svg';
import { FC } from 'react';

export const MainLayout: FC = () => (
  <div className="flex h-full flex-col px-12 py-8">
    <Link to="/" className="w-fit">
      <img className="w-24" src={emyhtLogo} alt="emyht" />
    </Link>
    <Outlet />
  </div>
);
