import { authLayoutRoute } from './_layout/route';
import { signInRoute } from './signIn/route';
import { signUpRoute } from './signUp/route';

export const authRoutes = [authLayoutRoute, signUpRoute, signInRoute];
