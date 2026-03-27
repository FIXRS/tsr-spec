/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  docs: [
    'intro',
    {
      type: 'category',
      label: 'Introduction',
      items: ['introduction/introduction'],
    },
    {
      type: 'category',
      label: 'Core Concepts',
      items: ['core-concepts/core-concepts'],
    },
    {
      type: 'category',
      label: 'Surface Model',
      items: ['surface-model/surface-model'],
    },
    {
      type: 'category',
      label: 'Host Contract',
      items: ['host-contract/host-contract'],
    },
    {
      type: 'category',
      label: 'Entities',
      items: ['entities/entities'],
    },
    {
      type: 'category',
      label: 'Views',
      items: ['views/views'],
    },
    {
      type: 'category',
      label: 'Actions',
      items: ['actions/actions'],
    },
    {
      type: 'category',
      label: 'Events',
      items: ['events/events'],
    },
    {
      type: 'category',
      label: 'Patches',
      items: ['patches/patches'],
    },
    {
      type: 'category',
      label: 'Runtime Behavior',
      items: ['runtime-behavior/runtime-behavior'],
    },
    {
      type: 'category',
      label: 'Security Model',
      items: ['security-model/security-model'],
    },
    {
      type: 'category',
      label: 'Conformance',
      items: ['conformance/conformance'],
    },
    {
      type: 'category',
      label: 'Examples',
      items: ['examples/examples'],
    },
    {
      type: 'category',
      label: 'Integration',
      items: ['integration/integration'],
    },
  ],
};

module.exports = sidebars;
