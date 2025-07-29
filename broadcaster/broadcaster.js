const { connect, StringCodec } = require("nats");
const axios = require("axios");
const fs = require("fs");

const WEBHOOK_URL = process.env.WEBHOOK_URL;

(async () => {
  const sc = StringCodec();
  const nc = await connect({ servers: process.env.NATS_URL || "nats://nats:4222" });

  const sub = nc.subscribe("todo.events", { queue: "broadcaster" });

  console.log("Broadcaster listening to todo.events...");
  fs.writeFileSync("/tmp/ready", "ok");

  for await (const msg of sub) {
    const event = JSON.parse(sc.decode(msg.data));

    try {
      await axios.post(WEBHOOK_URL, {
        user: "bot",
        message: `A todo was ${event.type} - ${event.text || "id " + event.id}`,
      });

      console.log("Sent message to external service:", event);
    } catch (err) {
      console.error("Failed to send message to external service:", err.message);
    }
  }
})();
