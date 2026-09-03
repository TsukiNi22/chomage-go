import 'dotenv/config';
import {createApp} from "./app";

const PORT = process.env.PORT_BACKEND ? Number(process.env.PORT_BACKEND) : 4000;

const app = createApp();

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
