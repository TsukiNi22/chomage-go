import 'dotenv/config';
import "./cron.js";
import {createApp} from "./app.js";

const PORT = process.env.PORT_BACKEND ? Number(process.env.PORT_BACKEND) : 4000;

const app = createApp();

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
