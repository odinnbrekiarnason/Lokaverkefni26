import express from 'express';
import { errorHandler } from './middleware/errorhandler.js';
//==================================ROUTES====================================
import loginRoute from './routes/authenticationNeededRoutes/loginSignupRoute.js';
import eventRoute from './routes/eventRelatedRoutes/eventRoute.js';
import venueRoute from './routes/eventRelatedRoutes/venueRoute.js';
import meRoute from './routes/authenticationNeededRoutes/meRoute.js'
//============================================================================

const app = express();

app.use(express.json());

app.use('/api/me', meRoute);
app.use('/api/register', loginRoute);
app.use('/api/events', eventRoute);
app.use('/api/venues', venueRoute);

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'Server is running' });
});

app.use(errorHandler);

export default app;

