const axios = require('axios');

const isTelegramConfigured = Boolean(
  process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID
);

if (isTelegramConfigured) {
  console.log('📱 Telegram Bot notifications enabled.');
} else {
  console.log('ℹ️ Telegram credentials not set in .env. Order alerts will be logged to server console.');
}

/**
 * Sends a formatted order notification to Telegram
 * @param {Object} order
 * @returns {Promise<boolean>}
 */
async function sendTelegramOrderNotification(order) {
  const storeName = process.env.STORE_NAME || 'THE EVENT STORE';
  
  const itemsText = order.items
    .map((item, idx) => `${idx + 1}. *${item.name}* x ${item.quantity} — ₹${(item.priceAtOrder * item.quantity).toFixed(2)}`)
    .join('\n');

  const message = `
🎉 *NEW ORDER ENQUIRY!*
━━━━━━━━━━━━━━━━━━━━
🏬 *Store:* ${storeName}
🧾 *Order Ref:* \`${order.orderNumber || order._id}\`
👤 *Customer:* ${order.customerName}
📞 *Phone:* ${order.customerPhone}
📍 *Address:* ${order.customerAddress || 'Not provided'}
📅 *Date:* ${new Date(order.createdAt).toLocaleString()}

🛍️ *Items Ordered:*
${itemsText}

💰 *Total Estimated Amount:* *₹${order.totalAmount.toFixed(2)}*
⚡ *Status:* ${order.status.toUpperCase()}
━━━━━━━━━━━━━━━━━━━━
_Customer may also contact via WhatsApp wa.me link._
  `.trim();

  if (!isTelegramConfigured) {
    console.log('\n=========================================');
    console.log('📢 TELEGRAM ORDER NOTIFICATION (MOCK/LOCAL):');
    console.log(message);
    console.log('=========================================\n');
    return true;
  }

  try {
    const url = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;
    await axios.post(url, {
      chat_id: process.env.TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: 'Markdown',
    });
    console.log(`✅ Telegram order alert sent for order ${order.orderNumber}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to send Telegram notification:', error.response?.data || error.message);
    return false;
  }
}

module.exports = {
  sendTelegramOrderNotification,
  isTelegramConfigured,
};
