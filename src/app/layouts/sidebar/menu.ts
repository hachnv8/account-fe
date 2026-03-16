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
        id: 9,
        label: 'MENUITEMS.PROJECT_MANAGER.TEXT',
        icon: 'bx-briefcase-alt-2',
        link: '/project-manager'
    },
    {
        id: 10,
        label: 'MENUITEMS.NOTES.TEXT',
        icon: 'bx-notepad',
        subItems: [
            {
                id: 11,
                label: 'MENUITEMS.NOTES.LIST.CHANGE_REQUESTS',
                link: '/notes/change-requests',
                parentId: 10
            },
            {
                id: 12,
                label: 'MENUITEMS.NOTES.LIST.NOTES',
                link: '/notes/list',
                parentId: 10
            },
            {
                id: 13,
                label: 'MENUITEMS.NOTES.LIST.DICTIONARY',
                link: '/notes/dictionary',
                parentId: 10
            }
        ]
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