import { mergeRoutes, type AppRoute } from './route.types';
import { authRoutes } from '../features/auth/routes';
import { publicRoutes } from '../core/public/routes';
import { adminRoutes } from '../features/admin/routes';
import { instructorRoutes } from '../features/instructor/routes';
import { learnerRoutes } from '../features/learner/routes';

export const coreRoutes: AppRoute[] = mergeRoutes(publicRoutes, authRoutes);

export const featureRoutes: AppRoute[] = mergeRoutes(adminRoutes, instructorRoutes, learnerRoutes);

export const appRoutes: AppRoute[] = mergeRoutes(coreRoutes, featureRoutes);
