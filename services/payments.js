// Заглушка под интеграцию ЮMoney. Здесь должны быть реальные запросы к API.
// Нужно заполнить переменные окружения и заменить createPayment на реальный вызов.

const createPayment = async ({ amount, description, metadata }) => {
  const { YOOMONEY_SHOP_ID, YOOMONEY_SECRET, PAYMENT_RETURN_URL = "/" } = process.env;

  if (!YOOMONEY_SHOP_ID || !YOOMONEY_SECRET) {
    console.warn("YOOMONEY credentials are not set. Returning mock URL.");
  }

  // TODO: заменить на реальный запрос к ЮMoney / ЮKassa.
  const confirmationUrl = `${PAYMENT_RETURN_URL}?mockPayment=true&desc=${encodeURIComponent(
    description
  )}`;

  return {
    providerId: "mock-payment-id",
    confirmationUrl,
    status: "pending",
  };
};

module.exports = {
  createPayment,
};
