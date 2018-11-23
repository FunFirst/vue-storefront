import VueAnalytics from 'vue-analytics'

export function afterRegistration(Vue, config, store) {
  // Place the order. Payload is empty as we don't have any specific info to add for this payment method '{}'
  const placeOrder = function () {
    Vue.prototype.$bus.$emit('checkout-do-placeOrder', {})
  }

  if (!Vue.prototype.$isServer) {
    // Mount the info component when required.
    Vue.prototype.$bus.$on('checkout-payment-method-changed', (paymentMethodCode) => {
      if (store.state['payment-backend-methods'].methods.find(item => item.code === paymentMethodCode)) {
        // Register the handler for what happens when they click the place order button.
        Vue.prototype.$bus.$on('checkout-before-placeOrder', placeOrder)
      } else {
        // unregister the extensions placeorder handler
        Vue.prototype.$bus.$off('checkout-before-placeOrder', placeOrder)
      }
    })
  }
}


