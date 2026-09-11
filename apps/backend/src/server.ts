import 'dotenv/config';
import "./cron.ts";
import {createApp} from "./app.ts";

const PORT = process.env.PORT_BACKEND ? Number(process.env.PORT_BACKEND) : 4000;

const app = createApp();

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
