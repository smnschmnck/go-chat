import { Route } from '@tanstack/react-router';
import { SignInPage } from './SignInPage';
import { authLayoutRoute } from '../_layout/route';

export const signInRoute = new Route({
  getParentRoute: () => authLayoutRoute,
  path: '/sign-in',
  component: SignInPage,
});
