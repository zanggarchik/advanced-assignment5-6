import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  order_id: { type: Number, required: true, unique: true },
  customer_id: { type: Number, required: true },
  order_date: { type: Date, required: true },
  amount: { type: Number, required: true },
  status: { type: String, required: true },
});

// Индексы
orderSchema.index({ customer_id: 1 });
orderSchema.index({ customer_id: 1, status: 1 });

const Order = mongoose.model('Order', orderSchema);
export default Order;
