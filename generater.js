const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker'); // Ensure you are using the correct import

// MongoDB connection string (replace with your actual connection string)
const MONGO_URI = 'mongodb://localhost:27017/startupdb'; // Replace 'startupdb' with your desired database name
mongoose.connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Error connecting to MongoDB:', err));

// Define Schema and Model for Company
const CompanySchema = new mongoose.Schema({
  name: { type: String, required: true },
  logo: { type: String }, // URL or file path to the logo
  currentValuation: { type: Number, required: true },
  founderName: { type: String, required: true },
  sector: { type: String, required: true },
  marketSize: { type: String, required: true },
  targetAudience: { type: String, required: true },
  companyPitchDesk: {
    image: { type: String }, // URL or file path to the image
    text: { type: String }
  },
  companyEquityStructure: { type: String }, // Detailed description
  numberOfSharesToSell: { type: Number, required: true },
  minimumQuantity: { type: Number, required: true },
  pricePerShare: { type: Number, required: true }
});
const Company = mongoose.model('Company', CompanySchema);

// Function to generate random companies and save to the database
async function generateRandomCompanies(num) {
  for (let i = 0; i < num; i++) {
    const company = new Company({
      name: faker.company.name(),
      logo: `https://picsum.photos/200/200?random=${faker.number.int({ min: 100000, max: 999999 })}`, // Use faker.number.int for random number generation
      currentValuation: faker.number.int({ min: 1000000, max: 100000000 }), // Use faker.number.int() for generating random numbers
      founderName: faker.person.fullName(),
      sector: faker.commerce.department(),
      marketSize: faker.commerce.productName(),
      targetAudience: faker.helpers.arrayElement(['B2B', 'B2C', 'B2G']),
      companyPitchDesk: {
        image: `https://picsum.photos/200/200?random=${faker.number.int({ min: 100000, max: 999999 })}`, // Use faker.number.int for random number generation
        text: faker.lorem.paragraph(),
      },
      companyEquityStructure: faker.lorem.sentence(),
      numberOfSharesToSell: faker.number.int({ min: 1000, max: 10000 }),
      minimumQuantity: faker.number.int({ min: 10, max: 100 }),
      pricePerShare: faker.number.int({ min: 100, max: 1000 }),
    });

    try {
      await company.save();
      console.log(`Company ${company.name} added to the database.`);
    } catch (err) {
      console.error('Error adding company:', err);
    }
  }
}

// Generate 50 random companies for example
generateRandomCompanies(50).then(() => {
  mongoose.connection.close(); // Close the connection when done
});
