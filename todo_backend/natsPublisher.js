const { connect, StringCodec } = require("nats");

const sc = StringCodec();

let nc;
async function getClient() {
  if (!nc) {
    nc = await connect({ servers: process.env.NATS_URL || "nats://nats:4222" });
  }
  return nc;
}

async function publishTodoEvent(event) {
  try {
    const client = await getClient();
    client.publish("todo.events", sc.encode(JSON.stringify(event)));
    console.log("Published event:", event);
  } catch (err) {
    console.error("Failed to publish to NATS:", err.message);
  }
}

module.exports = { publishTodoEvent };
