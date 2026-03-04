import { MenuItem } from './menu.model';

export const MENU: MenuItem[] = [

    {
        id: 2,
        label: 'MENUITEMS.DASHBOARDS.TEXT',
        icon: 'bx-home-circle',
        link: '/dashboard'
    },
    {
        id: 8,
        isLayout: true
    },
    {
        id: 3,
        label: 'MENUITEMS.ACCOUNT_MANAGER.TEXT',
        icon: 'bxs-user-detail',
        subItems: [
            {
                id: 5,
                label: 'MENUITEMS.ACCOUNT_MANAGER.LIST.ACCOUNT_LIST',
                link: '/account-manager/list',
                parentId: 3
            }
        ]
    },
];