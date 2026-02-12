import { mergeRoutes, type AppRoute } from './route.types';
import { authRoutes } from '../core/auth/routes';
import { publicRoutes } from '../core/public/routes';
import { systemRoutes } from '../core/system/routes';
import { adminRoutes } from '../roles/admin/routes';
import { instructorRoutes } from '../roles/instructor/routes';
import { learnerRoutes } from '../roles/learner/routes';

export const coreRoutes: AppRoute[] = mergeRoutes(publicRoutes, authRoutes, systemRoutes);

export const roleRoutes: AppRoute[] = mergeRoutes(adminRoutes, instructorRoutes, learnerRoutes);

export const appRoutes: AppRoute[] = mergeRoutes(coreRoutes, roleRoutes);
