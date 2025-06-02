import express from 'express';

// Routes import

// Middlewares import

// Server setup
const app = express();
const port = 3000;




// Start server
try {
    app.get('/', (req, res) => {
        res.send('Hello World!');
    });
    
    app.listen(port, () => {
        console.log(`Server is running at http://localhost:${port}`);
    });
}catch (error) {
    console.error('Error starting the server:', error);
    process.exit(1);
}