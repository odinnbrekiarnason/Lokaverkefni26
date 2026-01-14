import express from 'express';
import { errorHandler } from './middleware/errorhandler.js';
//==================================ROUTES====================================
import loginRoute from './routes/authenticationNeededRoutes/loginSignupRoute.js';
import userRoute from './routes/authenticationNeededRoutes/userRoute.js';
import paymentRoute from './routes/authenticationNeededRoutes/paymentRoute.js';
import eventRoute from './routes/eventRelatedRoutes/eventRoute.js';
import venueRoute from './routes/eventRelatedRoutes/venueRoute.js';
import { getMyInfo } from './controllers/UserCtrl.js';
import { authenticateUser } from './middleware/authMiddleware.js';
//============================================================================
const app = express();
app.use(express.json());
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    switch (req.method) {
        case 'GET':
            console.log(req.method);
            console.log('Time of request', timestamp);
            console.log('Request originalUrl', req.originalUrl);
            console.log('Params:', req.params, 'Query:', req.query);
            break;
        case 'POST':
            console.log(req.method);
            console.log('Time of request', timestamp);
            console.log('Request originalUrl', req.originalUrl);
            console.log('Params:', req.params, 'Body:', req.body);
            break;
        case 'PUT':
            console.log(req.method);
            console.log('Time of request', timestamp);
            console.log('Request originalUrl', req.originalUrl);
            console.log("Params", req.params, 'Body', req.body);
            break;
        case 'DELETE':
            console.log(req.method);
            console.log('Time of request', timestamp);
            console.log('Request originalUrl', req.originalUrl);
            console.log('Params:', req.params, 'Query:', req.query, 'Body:', req.body);
            break;
    }
    next();
});
app.get('/debug-test', (req, res) => res.status(418).json({ ok: true, receivedBody: req.body }));
app.use('/api/me', authenticateUser, getMyInfo);
app.use('/api/register', loginRoute);
app.use('/api/user', authenticateUser, userRoute);
app.use('/api/payment', paymentRoute);
app.use('/api/events', eventRoute);
app.use('/api/venues', venueRoute);
app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'Server is running' });
});
app.use(errorHandler);
export default app;
