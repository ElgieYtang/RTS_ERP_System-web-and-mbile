import { request } from '@/lib/api'

function fetchQuotations() {
  return request('/quotations').then((payload) => payload.data ?? [])
}

function fetchQuotation(id) {
  return request(`/quotations/${encodeURIComponent(id)}`).then((payload) => payload.data)
}

function createQuotation(data) {
  return request('/quotations', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

function updateQuotation(id, data) {
  return request(`/quotations/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

function cancelQuotation(id) {
  return request(`/quotations/${encodeURIComponent(id)}/cancel`, {
    method: 'POST',
  })
}

function convertQuotationToPo(id, data) {
  return request(`/quotations/${encodeURIComponent(id)}/convert-to-po`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

function fetchPurchaseOrders() {
  return request('/purchase-orders').then((payload) => payload.data ?? [])
}

function fetchPurchaseOrder(id) {
  return request(`/purchase-orders/${encodeURIComponent(id)}`).then((payload) => payload.data)
}

function createReceivingFromPo(poId, data = {}) {
  return request(`/purchase-orders/${encodeURIComponent(poId)}/receivings`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

function fetchReceivings() {
  return request('/receivings').then((payload) => payload.data ?? [])
}

function confirmReceiving(id) {
  return request(`/receivings/${encodeURIComponent(id)}/confirm`, {
    method: 'POST',
  })
}

function fetchOutslips() {
  return request('/outslips').then((payload) => payload.data ?? [])
}

function createOutslip(data) {
  return request('/outslips', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

function approveOutslip(id) {
  return request(`/outslips/${encodeURIComponent(id)}/approve`, {
    method: 'POST',
  })
}

function dispatchOutslip(id) {
  return request(`/outslips/${encodeURIComponent(id)}/dispatch`, {
    method: 'POST',
  })
}

function fetchDeliveryReceipts() {
  return request('/delivery-receipts').then((payload) => payload.data ?? [])
}

function createDeliveryReceipt(data) {
  return request('/delivery-receipts', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

function updateDeliveryStatus(id, status) {
  return request(`/delivery-receipts/${encodeURIComponent(id)}/status`, {
    method: 'POST',
    body: JSON.stringify({ status }),
  })
}

function fetchBillings() {
  return request('/billings').then((payload) => payload.data ?? [])
}

function createBilling(data) {
  return request('/billings', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

function recordBillingPayment(id, data) {
  return request(`/billings/${encodeURIComponent(id)}/payments`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export {
  approveOutslip,
  cancelQuotation,
  confirmReceiving,
  convertQuotationToPo,
  createBilling,
  createDeliveryReceipt,
  createOutslip,
  createQuotation,
  createReceivingFromPo,
  dispatchOutslip,
  fetchBillings,
  fetchDeliveryReceipts,
  fetchOutslips,
  fetchPurchaseOrder,
  fetchPurchaseOrders,
  fetchQuotation,
  fetchQuotations,
  fetchReceivings,
  recordBillingPayment,
  updateDeliveryStatus,
  updateQuotation,
}
