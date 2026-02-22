import { SvgColor } from 'src/components/svg-color';

// ----------------------------------------------------------------------

const icon = (name: string) => <SvgColor src={`/assets/icons/navbar/${name}.svg`} />;

export type NavItem = {
  title: string;
  path: string;
  icon: React.ReactNode;
  info?: React.ReactNode;
};

export const navData = [
  {
    title: 'Dashboard',
    path: '/admin',
    icon: icon('ic-analytics'),
  },
  {
    title: 'Berita & Event',
    path: '/admin/posts',
    icon: icon('ic-blog'),
  },
  {
    title: 'Anggota Kabinet',
    path: '/admin/cabinet',
    icon: icon('ic-user'),
  },
];
