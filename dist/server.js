import dotenv from 'dotenv';
import app from './app.js';
dotenv.config();
const PORT = process.env.PORT || 3000;
console.log('Registered routes:');
app._router.stack.filter((r) => r.route).forEach((r) => console.log(`${Object.keys(r.route.methods)[0].toUpperCase()} ${r.route.path}`));
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
