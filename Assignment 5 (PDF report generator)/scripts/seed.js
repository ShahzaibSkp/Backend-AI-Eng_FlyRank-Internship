const { connectDatabase, closeDatabase, getDatabase } = require("../src/db");

async function seed() {
  await connectDatabase();
  const orders = [
    { category: "Software", quantity: 2, unitPrice: 99, createdAt: new Date() },
    { category: "Training", quantity: 1, unitPrice: 250, createdAt: new Date() },
    { category: "Software", quantity: 3, unitPrice: 79, createdAt: new Date() }
  ];
  await getDatabase().collection("orders").insertMany(orders);
  console.log(`Inserted ${orders.length} sample orders`);
  await closeDatabase();
}

seed().catch(async (error) => {
  console.error(error);
  await closeDatabase();
  process.exitCode = 1;
});
