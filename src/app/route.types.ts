import type { ComponentType } from 'react';

export type AppRouteComponent = ComponentType;

export type AppRoute = {
  path: string;
  component: AppRouteComponent;
};

export const withPaths = (component: AppRouteComponent, ...paths: readonly string[]): AppRoute[] =>
  paths.map((path) => ({ path, component }));

export const mergeRoutes = (...groups: ReadonlyArray<readonly AppRoute[]>): AppRoute[] =>
  groups.flatMap((group) => [...group]);
