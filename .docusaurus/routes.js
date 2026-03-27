import React from 'react';
import ComponentCreator from '@docusaurus/ComponentCreator';

export default [
  {
    path: '/tsr-spec/',
    component: ComponentCreator('/tsr-spec/', '9d5'),
    routes: [
      {
        path: '/tsr-spec/',
        component: ComponentCreator('/tsr-spec/', '454'),
        routes: [
          {
            path: '/tsr-spec/',
            component: ComponentCreator('/tsr-spec/', '976'),
            routes: [
              {
                path: '/tsr-spec/actions',
                component: ComponentCreator('/tsr-spec/actions', 'c34'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/tsr-spec/conformance',
                component: ComponentCreator('/tsr-spec/conformance', '93f'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/tsr-spec/core-concepts',
                component: ComponentCreator('/tsr-spec/core-concepts', 'b09'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/tsr-spec/entities',
                component: ComponentCreator('/tsr-spec/entities', '84a'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/tsr-spec/events',
                component: ComponentCreator('/tsr-spec/events', '99d'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/tsr-spec/examples',
                component: ComponentCreator('/tsr-spec/examples', 'da0'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/tsr-spec/host-contract',
                component: ComponentCreator('/tsr-spec/host-contract', '08d'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/tsr-spec/integration',
                component: ComponentCreator('/tsr-spec/integration', 'a2f'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/tsr-spec/introduction',
                component: ComponentCreator('/tsr-spec/introduction', 'ead'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/tsr-spec/patches',
                component: ComponentCreator('/tsr-spec/patches', 'e94'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/tsr-spec/runtime-behavior',
                component: ComponentCreator('/tsr-spec/runtime-behavior', '7c1'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/tsr-spec/security-model',
                component: ComponentCreator('/tsr-spec/security-model', '8ba'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/tsr-spec/surface-model',
                component: ComponentCreator('/tsr-spec/surface-model', 'c0a'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/tsr-spec/views',
                component: ComponentCreator('/tsr-spec/views', 'a38'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/tsr-spec/',
                component: ComponentCreator('/tsr-spec/', '632'),
                exact: true,
                sidebar: "docs"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    path: '*',
    component: ComponentCreator('*'),
  },
];
