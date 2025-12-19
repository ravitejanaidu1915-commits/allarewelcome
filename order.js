app.post("/api/order", async (req, res) => {
  const { name, phone, items, latitude, longitude } = req.body;

  const products = loadProducts();
  let total = 0;

  items.forEach(i => {
    const product = products.find(p => p.name === i.name);
    if (product) total += product.price * i.qty;
  });

  const order = {
    name,
    phone,
    items,
    total,
    location: `${latitude}, ${longitude}`,
    date: new Date().toLocaleString(),
  };

  saveOrder(order);

  const messageBody =
`📦 New Order
👤 ${name}
📞 ${phone}
🛒 ${items.map(i => `${i.name} x ${i.qty}`).join(", ")}
💰 ₹${total}
📍 https://www.google.com/maps?q=${latitude},${longitude}`;

  try {
    await client.messages.create({
      body: messageBody,
      from: twilioPhone,
      to: adminPhone,
    });
    res.json({ message: "✅ Order placed & SMS sent" });
  } catch (err) {
    console.error(err);
    res.json({ message: "⚠️ Order placed, SMS failed" });
  }
});
