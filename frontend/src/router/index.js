import { createRouter, createWebHistory } from 'vue-router'
import CustomersPage from '@/views/CustomersPage.vue'
import QuotationsPage from '@/views/QuotationsPage.vue'
import QuotationView from '@/views/QuotationView.vue'
import QuotationBuilder from '@/components/quotations/QuotationBuilder.vue'

const routes = [
  {
    path: '/',
    redirect: '/customers'
  },
  {
    path: '/customers',
    name: 'Customers',
    component: CustomersPage,
    meta: {
      title: 'Customers - WIF Japan ERP'
    }
  },
  {
    path: '/quotations',
    name: 'Quotations',
    component: QuotationsPage,
    meta: {
      title: 'Quotations - WIF Japan ERP'
    }
  },
  {
    path: '/quotations/create',
    name: 'CreateQuotation',
    component: () => import('@/views/CreateQuotationPage.vue'),
    meta: {
      title: 'Create Quotation - WIF Japan ERP'
    }
  },
  {
    path: '/quotations/:id',
    name: 'QuotationDetail',
    component: QuotationView,
    meta: {
      title: 'Quotation Details - WIF Japan ERP'
    }
  },
  {
    path: '/quotations/:id/edit',
    name: 'EditQuotation',
    component: () => import('@/views/EditQuotationPage.vue'),
    meta: {
      title: 'Edit Quotation - WIF Japan ERP'
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Update page title based on route meta
router.beforeEach((to, from, next) => {
  document.title = to.meta.title || 'WIF Japan ERP'
  next()
})

export default router