import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import "dotenv/config";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for Telegram Notification
  app.post("/api/telegram/notify", async (req, res) => {
    const { order } = req.body;
    
    // Use environment variables or fallback to provided credentials
    const botToken = process.env.TELEGRAM_BOT_TOKEN || "8533076744:AAGzlQ2c1H1IeymN7nPvzmzKelkwDMNDJ3o";
    const chatId = process.env.TELEGRAM_CHAT_ID || "5950963349";

    if (!botToken || !chatId) {
      console.error("Telegram credentials missing");
      return res.status(500).json({ error: "Telegram credentials missing" });
    }

    const itemsText = (order.items || []).map((item: any) => 
      `- ${item.name || 'Unknown'} (${item.size || 'N/A'}) x${item.quantity || 1} - Tk ${(item.price || 0) * (item.quantity || 1)}`
    ).join("\n");

    const message = `
🛍️ *New Order Received!*

👤 *Customer:* ${order.customerName || 'N/A'}
📞 *Phone:* ${order.customerPhone || 'N/A'}
📍 *Address:* ${order.customerAddress || 'N/A'}

📦 *Items:*
${itemsText || 'No items listed'}

💰 *Total Amount:* Tk ${order.totalAmount || 0}
🚚 *Shipping:* Tk ${order.deliveryCharge || 0}

⏰ *Ordered At:* ${order.createdAt ? new Date(order.createdAt).toLocaleString() : 'N/A'}
    `;

    try {
      const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: "Markdown",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Telegram API Error:", errorData);
        return res.status(500).json({ error: "Failed to send Telegram notification" });
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Error sending Telegram notification:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
