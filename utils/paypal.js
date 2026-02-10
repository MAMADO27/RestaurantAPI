const paypal = require('@paypal/checkout-server-sdk');
const environment = new paypal.core.SandboxEnvironment(
  process.env.PAYPAL_CLIENT_ID,
  process.env.PAYPAL_SECRET_KEY
);
exports.paypal_client = new paypal.core.PayPalHttpClient(environment);
exports.create_paypal_order = async (totalPrice, orderId) => {
  const request = new paypal.orders.OrdersCreateRequest();
  request.prefer('return=representation');

  request.requestBody({
    intent: 'CAPTURE',
    purchase_units: [
      {
        reference_id: orderId.toString(),
        amount: {
          currency_code: 'USD',
          value: Number(totalPrice).toFixed(2)
        }
      }
    ],
    application_context: {
      brand_name: 'Restaurant',
      landing_page: 'LOGIN',
      user_action: 'PAY_NOW',
      shipping_preference: 'NO_SHIPPING',
      return_url: `http://localhost:5000/api/payment/paypal/return?order_id=${orderId}`,
      cancel_url: `http://localhost:5000/api/payment/paypal/cancel?order_id=${orderId}`
    }
  });

  const response = await exports.paypal_client.execute(request);
  return response.result;
};
exports.capture_paypal_order = async (paypal_order_id) => {
  const request = new paypal.orders.OrdersCaptureRequest(paypal_order_id);
  request.requestBody({});
  const response = await exports.paypal_client.execute(request);
  return response.result;
};
