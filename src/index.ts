import express from 'express';

// Routes import
import authRoutes from './routes/auth/controller'; // Uncomment when auth routes are implemented

// Middlewares import
import { jsonErrorHandler } from './middlewares/JSONErrors';
import { notFoundHandler } from './middlewares/notFound';
import { errorHandler } from './middlewares/errors';
import { headersHandler } from './middlewares/headers';

// Server setup
const app = express();
const port = 3000;

// Start server
try {

    // Setup middlewares
    app.use(express.json());
    app.use(jsonErrorHandler);
    app.use(headersHandler);

    // Setup routes
    app.use('/auth', authRoutes);

    // Setup error handling middlewares
    app.use(notFoundHandler);
    app.use(errorHandler);

    // Start the server
    app.listen(port, () => {
        console.log(`Server is running at http://localhost:${port}`);
    });
} catch (error) {
    console.error('Error starting the server:', error);
    process.exit(1);
}
