import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/views/layout/Layout'

export const constantRouterMap = [
  {
    path: '/redirect',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '/redirect/:path*',
        component: () => import('@/views/redirect/index')
      }
    ]
  },
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },
  {
    path: '/auth-redirect',
    component: () => import('@/views/login/authredirect'),
    hidden: true
  },
  {
    path: '/servicedetails',
    component: () => import('@/views/servicedetails/index'),
    hidden: true
  },
  {
    path: '/404',
    component: () => import('@/views/errorPage/404'),
    hidden: true
  },
  {
    path: '',
    component: Layout,
    redirect: 'dashboard',
    children: [
      {
        path: 'dashboard',
        component: () => import('@/views/dashboard/index'),
        name: 'Dashboard',
        meta: {
          title: 'dashboard',
          icon: 'fa fa-book',
          noCache: true
        }
      }
    ]
  },
  {
    path: '/register',
    component: Layout,
    redirect: 'register',
    children: [
      {
        path: '',
        component: () => import('@/views/register/index'),
        name: 'register',
        meta: {
          title: 'register',
          icon: 'fa el-icon-edit-outline',
          noCache: true
        }
      }
    ]
  },
  {
    path: '/dataBaseManage',
    component: Layout,
    redirect: 'dataBaseManage',
    children: [
      {
        path: '',
        component: () => import('@/views/dataBaseManage/index'),
        name: 'dataBaseManage',
        meta: {
          title: 'dataBaseManage',
          icon: 'fa fa-database',
          noCache: true
        }
      }
    ]
  },
  {
    path: '/file',
    component: Layout,
    redirect: 'file',
    children: [
      {
        path: '',
        component: () => import('@/views/file/index'),
        name: 'file',
        meta: {
          title: 'file',
          icon: 'fa fa-file',
          noCache: true
        }
      }
    ]
  },
  {
    path: '/publish',
    component: Layout,
    redirect: 'publish',
    children: [
      {
        path: '',
        component: () => import('@/views/publish/index'),
        name: 'publish',
        meta: {
          title: 'publish',
          icon: 'fa fa-paper-plane-o',
          noCache: true
        }
      }
    ]
  },
  {
    path: '/detail',
    component: Layout,
    redirect: 'detail',
    children: [
      {
        path: '',
        component: () => import('@/views/publish/detail'),
        name: 'detail',
        meta: {
          title: 'detail',
          icon: 'fa fa-paper-plane-o',
          noCache: true
        }
      }
    ]
  }
  //  {
  //      path: '/servicedetails',
  //      component: Layout,
  //      redirect: 'servicedetails',
  //      children: [{
  //          path: '',
  //          component: () =>
  //              import('@/views/servicedetails/index'),
  //          name: 'servicedetails',
  //          meta: {
  //              title: 'servicedetails',
  //              icon: 'fa fa-paper-plane-o',
  //              noCache: true
  //          }
  //      }],
  //      hidden: true
  //  },
]

export default new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({
    y: 0
  }),
  routes: constantRouterMap
})
