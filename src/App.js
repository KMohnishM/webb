import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

const App = () => {
  const [companyName, setCompanyName] = useState(""); // Input state for company name
  const [companyDetails, setCompanyDetails] = useState(null); // State to store company details
  const [loading, setLoading] = useState(false); // Loading indicator
  const [error, setError] = useState(""); // Error message

  const [companies, setCompanies] = useState([{ amountInvested: "", numberOfStocks: "" }]); // For investment form
  const [data, setData] = useState([]); // Investment data

  // Handle company input change
  const handleCompanyChange = (index, field, value) => {
    const updatedCompanies = [...companies];
    updatedCompanies[index][field] = value;
    setCompanies(updatedCompanies);
  };

  // Calculate the total amount invested
  const calculateTotalAmountInvested = () => {
    return companies.reduce(
      (total, company) => total + (parseFloat(company.amountInvested) || 0),
      0
    );
  };

  // Fetch company details
  const fetchCompanyDetails = async () => {
    if (!companyName.trim()) {
      setError("Please enter a valid company name.");
      return;
    }

    setLoading(true);
    setError("");
    setCompanyDetails(null);

    try {
      const response = await axios.get(
        `http://localhost:5000/api/company/name/${encodeURIComponent(companyName)}`
      );

      if (response.data) {
        setCompanyDetails(response.data); // Assuming the response is an object
      } else {
        setError("No details found for the entered company.");
      }
    } catch (error) {
      console.error("Error fetching company details:", error.response || error);
      setError("Failed to fetch company details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission for investment details
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const totalAmountInvested = calculateTotalAmountInvested();
      const response = await axios.post(
        "http://localhost:5001/api/add-investment",
        { totalAmountInvested, companies }
      );
      alert(response.data.message);
      setCompanies([{ amountInvested: "", numberOfStocks: "" }]);
      fetchInvestments();
    } catch (error) {
      console.error("Error saving investment data:", error);
    }
  };

  // Fetch investment data
  const fetchInvestments = async () => {
    try {
      const response = await axios.get("http://localhost:5001/api/investments");
      setData(response.data);
    } catch (error) {
      console.error("Error fetching investment data:", error);
    }
  };

  // Handle the "Buy Shares" button click to update investments
  const handleBuyShares = async () => {
    try {
      // Update investment state after buying shares (just a simple logic for now)
      const totalAmountInvested = calculateTotalAmountInvested();
      const updatedData = [...data, { totalAmountInvested, companies }];
      setData(updatedData); // Update the local investment data

      // Optionally, you could save this to the backend here as well:
      await axios.post("http://localhost:5001/api/add-investment", {
        totalAmountInvested,
        companies,
      });
      alert("Shares bought successfully! Investments updated.");
      setCompanies([{ amountInvested: "", numberOfStocks: "" }]); // Reset the form
    } catch (error) {
      console.error("Error updating investments:", error);
    }
  };

  useEffect(() => {
    fetchInvestments();
  }, []);

  return (
    <div style={{ padding: "20px", maxWidth: "1000px", margin: "auto" }}>
      <h1>Khata by Vyapaar.ai</h1>
      <h2>Powered by Web3.0</h2>

      {/* Company Details and Search Section */}
      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Enter company name"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          style={{
            padding: "10px",
            width: "80%",
            maxWidth: "300px",
            marginRight: "10px",
            borderRadius: "4px",
            border: "1px solid #ccc",
          }}
        />
        <button
          onClick={fetchCompanyDetails}
          style={{
            padding: "10px",
            borderRadius: "4px",
            backgroundColor: "#007BFF",
            color: "white",
            border: "none",
            cursor: "pointer",
          }}
        >
          Search
        </button>
      </div>

      {/* Error Message */}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Loading Indicator */}
      {loading && <p>Loading company details...</p>}

      {/* Company Details and Investment Form in a Flex Layout */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "20px" }}>
        {/* Company Details Section */}
        <div
          className="company-details-container"
          style={{
            width: "70%",
            border: "1px solid #ccc",
            padding: "20px",
            borderRadius: "8px",
            backgroundColor: "#f9f9f9",
          }}
        >
          <h3>{companyDetails ? companyDetails.name : "Company Name"}</h3>
          <div style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
            {companyDetails?.logo && (
              <div style={{ marginRight: "20px" }}>
                <img
                  src={companyDetails.logo}
                  alt={`${companyDetails.name} Logo`}
                  style={{
                    width: "150px",
                    height: "150px",
                    objectFit: "contain",
                    borderRadius: "8px",
                  }}
                />
              </div>
            )}
            <div>
              <p><strong>Sector:</strong> {companyDetails?.sector}</p>
              <p><strong>Founder:</strong> {companyDetails?.founderName}</p>
              <p><strong>Valuation:</strong> ₹{companyDetails?.currentValuation}</p>
              <p><strong>Market Size:</strong> {companyDetails?.marketSize}</p>
              <p><strong>Target Audience:</strong> {companyDetails?.targetAudience}</p>
              <p><strong>Shares to Sell:</strong> {companyDetails?.numberOfSharesToSell}</p>
              <p><strong>Minimum Quantity:</strong> {companyDetails?.minimumQuantity}</p>
              <p><strong>Price per Share:</strong> ₹{companyDetails?.pricePerShare}</p>
            </div>
          </div>
        </div>

        {/* Investment Form Section */}
        <div
          className="investment-form-container"
          style={{
            width: "28%",
            border: "1px solid #ccc",
            padding: "20px",
            borderRadius: "8px",
            backgroundColor: "#f9f9f9",
            marginLeft: "20px",
          }}
        >
          <h3>Invest in Companies:</h3>
          <form onSubmit={handleSubmit}>
            {companies.map((company, index) => (
              <div key={index} style={{ marginBottom: "10px" }}>
                <label>Amount Invested:</label>
                <input
                  type="number"
                  value={company.amountInvested}
                  onChange={(e) =>
                    handleCompanyChange(index, "amountInvested", e.target.value)
                  }
                  required
                  placeholder="0"
                  style={{ padding: "8px", width: "100px", marginRight: "10px" }}
                />
                <label>Number of Stocks:</label>
                <input
                  type="number"
                  value={company.numberOfStocks}
                  onChange={(e) =>
                    handleCompanyChange(index, "numberOfStocks", e.target.value)
                  }
                  required
                  placeholder="0"
                  style={{ padding: "8px", width: "100px" }}
                />
              </div>
            ))}
            <div className="marg">
              <strong>Total Amount Invested: ₹{calculateTotalAmountInvested()}</strong>
            </div>
            <button type="submit" style={{ marginTop: "10px" }}>
              Submit Investment
            </button>
          </form>
        </div>
      </div>

      {/* Buy Option */}
      <div style={{ marginTop: "20px", textAlign: "center" }}>
        <button
          onClick={handleBuyShares} // Trigger investment update on buy
          style={{
            padding: "10px 20px",
            borderRadius: "8px",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          Buy Shares
        </button>
      </div>

      {/* Investment Data Display */}
      <h2 style={{ marginTop: "40px" }}>Investments</h2>
      <ul>
        {data.map((item) => (
          <li key={item._id}>
            <strong>Total Investment:</strong> ₹{item.totalAmountInvested}
            <ul>
              {item.companies.map((company, idx) => (
                <li key={idx}>
                  ₹{company.amountInvested} ({company.numberOfStocks} stocks)
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default App;
