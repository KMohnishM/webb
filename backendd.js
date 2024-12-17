const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Initialize the app
const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Use express.json() instead of body-parser

// MongoDB connection
mongoose
    .connect(process.env.MONGO_URI || 'mongodb://localhost:27017/investmentsDB', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log('Connected to MongoDB'))
    .catch((error) => console.error('Error connecting to MongoDB:', error));

// Investment Schema and Model
const investmentSchema = new mongoose.Schema(
    {
        username: { type: String, required: true },
        totalAmountInvested: { type: Number, required: true },
        companies: [
            {
                companyName: { type: String, required: true },
                amountInvested: { type: Number, required: true },
                numberOfStocks: { type: Number, required: true },
            },
        ],
    },
    { timestamps: true }
);

const Investment = mongoose.model('Investment', investmentSchema);

// Utility function to normalize strings
const normalize = (str) => str.trim().toLowerCase();

// Routes

// Add or update an investment
app.post('/api/add-investment', async (req, res) => {
    try {
        const { username, companies } = req.body;

        // Normalize the username
        const normalizedUsername = normalize(username);

        // Find existing investment for the user
        let existingInvestment = await Investment.findOne({ username: normalizedUsername });

        if (existingInvestment) {
            // If the user exists, check each company and either update or add
            companies.forEach((newCompany) => {
                const normalizedCompanyName = normalize(newCompany.companyName);

                // Find the company in the user's existing investment list
                const existingCompany = existingInvestment.companies.find(
                    (company) => normalize(company.companyName) === normalizedCompanyName
                );

                if (existingCompany) {
                    // If the company exists, update the investment and stock count
                    existingCompany.amountInvested += newCompany.amountInvested;
                    existingCompany.numberOfStocks += newCompany.numberOfStocks;
                } else {
                    // If the company doesn't exist, add a new entry
                    existingInvestment.companies.push({
                        companyName: normalizedCompanyName,
                        amountInvested: newCompany.amountInvested,
                        numberOfStocks: newCompany.numberOfStocks,
                    });
                }
            });

            // Recalculate the total investment
            existingInvestment.totalAmountInvested = existingInvestment.companies.reduce(
                (total, company) => total + company.amountInvested,
                0
            );

            // Save the updated investment
            await existingInvestment.save();

            return res.status(200).json({ message: 'Investment updated successfully!', investment: existingInvestment });
        } else {
            // If the user doesn't exist, create a new investment record
            const newInvestment = new Investment({
                username: normalizedUsername,
                companies: companies.map((company) => ({
                    companyName: normalize(company.companyName),
                    amountInvested: company.amountInvested,
                    numberOfStocks: company.numberOfStocks,
                })),
            });

            // Calculate the totalAmountInvested for the new investment
            newInvestment.totalAmountInvested = newInvestment.companies.reduce(
                (total, company) => total + company.amountInvested,
                0
            );

            // Save the new investment
            await newInvestment.save();

            return res.status(201).json({ message: 'Investment added successfully!', investment: newInvestment });
        }
    } catch (error) {
        console.error('Error adding/updating investment:', error);
        res.status(500).json({ error: 'Error adding or updating investment data', details: error.message });
    }
});

// Fetch all investments
app.get('/api/investments', async (req, res) => {
    try {
        const investments = await Investment.find();
        res.json(investments);
    } catch (error) {
        console.error('Error fetching investments:', error);
        res.status(500).json({ error: 'Error fetching investments', details: error.message });
    }
});

// Fetch investment by username
app.get('/api/investments/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const investment = await Investment.findOne({ username });

        if (!investment) {
            return res.status(404).json({ message: 'No investment found for this user.' });
        }

        res.json(investment);
    } catch (error) {
        console.error('Error fetching investment data:', error);
        res.status(500).json({ error: 'Error fetching investment data', details: error.message });
    }
});

// Update an investment (by ID)
app.put('/api/update-investment/:id', async (req, res) => {
    try {
        const { username, totalAmountInvested, companies } = req.body;
        const { id } = req.params;

        // Find the investment by ID and update it
        const updatedInvestment = await Investment.findByIdAndUpdate(
            id,
            { username, totalAmountInvested, companies },
            { new: true } // Return the updated document
        );

        if (!updatedInvestment) {
            return res.status(404).json({ message: 'Investment not found' });
        }

        res.status(200).json({ message: 'Investment updated successfully!', investment: updatedInvestment });
    } catch (error) {
        console.error('Error updating investment data:', error);
        res.status(500).json({ error: 'Error updating investment data', details: error.message });
    }
});

// Delete an investment (by ID)
app.delete('/api/delete-investment/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const deletedInvestment = await Investment.findByIdAndDelete(id);

        if (!deletedInvestment) {
            return res.status(404).json({ message: 'Investment not found' });
        }

        res.json({ message: 'Investment deleted successfully' });
    } catch (error) {
        console.error('Error deleting investment:', error);
        res.status(500).json({ error: 'Error deleting investment', details: error.message });
    }
});

// Start the server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
