import express from "express";

// Routes import
import authRoutes from "routes/auth/controller"; // Uncomment when auth routes are implemented
import userRoutes from "routes/user/controller";
import categoryRoutes from "routes/category/controller";
import thirdPartyRoutes from "./routes/third-party/controller";
import accountRoutes from "routes/account/controller";

// Middlewares import
import { jsonErrorHandler } from "./middlewares/json-errors";
import { notFoundHandler } from "./middlewares/not-found";
import { errorHandler } from "./middlewares/errors";

// Server setup
const app = express();
const port = 3000;

// Start server
try {

	// Setup middlewares
	app.use(express.json());
	app.use(jsonErrorHandler);

	// Setup routes
	app.use("/auth", authRoutes); // Uncomment when auth routes are implemented
	app.use("/user", userRoutes);
	app.use("/third-party", thirdPartyRoutes);
	app.use("/category", categoryRoutes);
	app.use("/account", accountRoutes);
	app.use(notFoundHandler);

	app.use(errorHandler);

	// Start the server
	app.listen(port, () => {
		console.log(`Server is running at http://localhost:${port}`);
	});
} catch (error) {
	console.error("Error starting the server:", error);
	process.exit(1);
}
