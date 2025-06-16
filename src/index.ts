import express from 'express';

// Routes import
import authRoutes from './routes/auth/controller'; // Uncomment when auth routes are implemented
import userRoutes from './routes/user/controller';

// Middlewares import
import { jsonErrorHandler } from './middlewares/json-errors';
import { notFoundHandler } from './middlewares/not-found';
import { errorHandler } from './middlewares/errors';

// Server setup
const app = express();
const port = 3000;

// Start server
try {

    // Setup middlewares
    app.use(express.json());
    app.use(jsonErrorHandler);

    // Setup routes
    app.use('/auth', authRoutes); // Uncomment when auth routes are implemented
    app.use('/user', userRoutes);
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
