import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import Order from "./models/Order.js";

dotenv.config();
const app = express();

app.use(cors({
  origin: 'http://98.81.148.41:8080',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));

app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("✅ MongoDB Connected"))
.catch(err => console.error("❌ MongoDB Error:", err));

// Создание нового заказа
//app.post("/api/orders", async (req, res) => {
  //try {
    //const order = new Order(req.body);
    //await order.save();
    //res.status(201).send(order);
  //} catch (error) {
    //console.error("❌ Error creating order:", error);
    //res.status(400).send({ message: 'Error creating order' });
  //}
//});
app.post('/api/orders', async (req, res) => {
    const { order_id, customer_id, order_date, amount, status } = req.body;

    try {
        const existingOrder = await Order.findOne({ order_id });
        if (existingOrder) {
            return res.status(400).json({ message: 'Order ID already exists' });
        }

        const order = new Order({ order_id, customer_id, order_date, amount, status });
        await order.save();
        res.status(201).json(order);
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
// Чтение всех заказов
app.get("/api/orders", async (req, res) => {
  try {
    const orders = await Order.find();
    res.send(orders);
  } catch (error) {
    console.error("❌ Error fetching orders:", error);
    res.status(400).send({ message: 'Error fetching orders' });
  }
});

// Поиск по customer_id и статусу
app.post("/api/search", async (req, res) => {
  try {
    const { customer_id, status } = req.body;
    const query = {};
    if (customer_id) query.customer_id = customer_id;
    if (status) query.status = status;

    const result = await Order.find(query);
    res.send(result);
  } catch (error) {
    console.error("❌ Error searching orders:", error);
    res.status(400).send({ message: 'Error searching orders' });
  }
});

// Обновление заказа по order_id
app.put("/api/orders/:order_id", async (req, res) => {
  try {
    const { order_id } = req.params;

    if (!order_id) {
      return res.status(400).send({ message: 'Invalid order_id' });
    }

    const order = await Order.findOneAndUpdate({ order_id }, req.body, { new: true });

    if (!order) {
      return res.status(404).send({ message: 'Order not found' });
    }

    res.send(order);
  } catch (error) {
    console.error("❌ Error updating order:", error);
    res.status(500).send({ message: 'Server error while updating order' });
  }
});

// Удаление заказа по ID
app.delete("/api/orders/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send({ message: 'Invalid ObjectId' });
    }

    const orderId = new mongoose.Types.ObjectId(id);
    const deletedOrder = await Order.findByIdAndDelete(orderId);

    if (!deletedOrder) {
      return res.status(404).send({ message: 'Order not found' });
    }

    res.send({ success: true });
  } catch (error) {
    console.error("❌ Error deleting order:", error);
    res.status(400).send({ message: 'Error deleting order' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => console.log(`🚀 Server running at http://0.0.0.0:${PORT}`));
