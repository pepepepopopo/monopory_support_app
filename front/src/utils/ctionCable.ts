import { createConsumer, Consumer } from "@rails/actioncable";

const API_WS_URL = "ws://localhost:3000/cable";

const GameConsumer: Consumer = createConsumer(API_WS_URL);

export default GameConsumer;