import type { WorkspacesPopoverProps } from './components/workspaces-popover';
import { assetPath } from '../constants';

// ----------------------------------------------------------------------

export const _workspaces: WorkspacesPopoverProps['data'] = [
  {
    id: 'bem-fst',
    name: 'BEM FST UNISA',
    plan: 'Admin',
    logo: assetPath('assets/icons/workspaces/logo-1.webp'),
  },
];
