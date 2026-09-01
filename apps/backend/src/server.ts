import 'dotenv/config';
import express from 'express';

const app = express();

const PORT: number = Number(process.env.PORT) || 4000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
