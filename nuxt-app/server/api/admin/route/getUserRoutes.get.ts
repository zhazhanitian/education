// GET /api/admin/route/getUserRoutes — 动态路由（管理员菜单）

export default defineEventHandler(async (event) => {
  requireAuth(event)

  // 返回我们的自定义管理模块路由
  return {
    code: 0,
    data: {
      home: 'home',
      routes: [
        {
          name: 'cms',
          path: '/cms',
          component: 'layout.base',
          meta: {
            title: '内容管理',
            i18nKey: 'route.cms',
            icon: 'mdi:file-document-edit-outline',
            order: 2,
          },
          children: [
            {
              name: 'cms_nav',
              path: '/cms/nav',
              component: 'view.cms_nav',
              meta: {
                title: '导航菜单',
                i18nKey: 'route.cms_nav',
                icon: 'mdi:menu',
                order: 1,
              },
            },
            {
              name: 'cms_content',
              path: '/cms/content',
              component: 'view.cms_content',
              meta: {
                title: '内容页管理',
                i18nKey: 'route.cms_content',
                icon: 'mdi:file-document-outline',
                order: 2,
              },
            },
            {
              name: 'cms_news',
              path: '/cms/news',
              component: 'view.cms_news',
              meta: {
                title: '新闻管理',
                i18nKey: 'route.cms_news',
                icon: 'mdi:newspaper',
                order: 3,
              },
            },
          ],
        },
        {
          name: 'config',
          path: '/config',
          component: 'layout.base',
          meta: {
            title: '系统配置',
            i18nKey: 'route.config',
            icon: 'mdi:cog-outline',
            order: 3,
          },
          children: [
            {
              name: 'config_home',
              path: '/config/home',
              component: 'view.config_home',
              meta: {
                title: '首页配置',
                i18nKey: 'route.config_home',
                icon: 'mdi:home-edit-outline',
                order: 1,
              },
            },
            {
              name: 'config_files',
              path: '/config/files',
              component: 'view.config_files',
              meta: {
                title: '文件管理',
                i18nKey: 'route.config_files',
                icon: 'mdi:folder-multiple-outline',
                order: 2,
              },
            },
          ],
        },
      ],
    },
  }
})
