const { Client } = require("pg"); // Import the 'pg' module for PostgreSQL
const fs = require("fs"); // Import the 'fs' module for file system operations
const axios = require('axios');   // Axios for API calls

// Create a new client using the connection URL
const client = new Client({
    user: "postgres", // replace with your RDS username
    host: "insighthread-t3.c7gggeaaksad.us-east-1.rds.amazonaws.com", // replace with your RDS endpoint
    database: "postgres", // replace with your database name
    password: "aitoxradmin", // replace with your RDS password
    port: 5432, // default PostgreSQL port
    ssl: {
        rejectUnauthorized: false, // this will allow self-signed certificates
        ca: fs.readFileSync("rds-combined-ca-bundle.pem").toString(), // path to AWS RDS CA bundle
    },
});

// SEC API Token
const token = 'da174abf0837fbfc009d990ece801702b57e8af8510e5230e7aae3fea9c546d3'

// Function to fetch tickers from the database
async function fetchTickers() {
    try {
        console.log("script working...");
        // Connect to PostgreSQL
        await client
            .connect()
            .then(() => {
                console.log("db connected successfully");
            })
            .catch((err) => {
                console.error("Error executing query", err);
            });

        // Fetch data from your table
        const res = await client.query(
            "SELECT symbol FROM public.companies LIMIT 3"
        );

        // Extract tickers from the result
        const tickers = res.rows.map(row => row.symbol);

        console.log("Tickers fetched:", tickers);
        return tickers;
    } catch (err) {
        console.error("Error fetching tickers:", err);
        throw err;
    } finally {
        // Close the database connection
        await client.end();
    }
}

// Function to make the API call for each ticker and form type
async function makeApiCallsForTickersAndForms() {
    try {
        // Fetch tickers from the database
        const tickers = await fetchTickers();

        // const tickers = ['TSLA','IBM', 'AAPL']

        // Define the form types to loop over
        const formTypes = ["10-K", "10-Q", "8-k"];

        // Array to hold all filings
        const filingsArray = [];

        // Object to store all the results
        const results = {};

        // Loop through each ticker
        for (const ticker of tickers) {
            results[ticker] = {};

            // Loop through each form type
            for (const formType of formTypes) {
                const requestBody = {
                    query: `ticker:${ticker} AND formType:\"${formType}\"`, // Dynamically set ticker and form type
                    from: "0",
                    size: "5",
                    sort: [{ filedAt: { order: "desc" } }],
                };

                console.log(
                    `Making API call for Ticker: ${ticker}, Form Type: ${formType}`
                );

                // Make the API call using Axios
                const response = await axios.post(
                    `https://api.sec-api.io?token=${token}`,
                    requestBody
                );

                // Extract and structure the relevant filings information
                const filings = response.data.filings.map(filing => ({
                    ticker: filing.ticker,
                    formType: filing.formType,
                    accessionNo: filing.accessionNo,
                    cik: filing.cik,
                    linkToFilingDetails: filing.linkToFilingDetails,
                    description: filing.description,
                    linkToTxt: filing.linkToTxt,
                    periodOfReport: filing.periodOfReport
                }));
        
                // Add the filings to the array
                filingsArray.push(...filings);

                // Save the API response to the results object
                // results[ticker][formType] = response.data;
            }
        }

        // Convert the results object to JSON and save it to a file
        // const jsonData = JSON.stringify(results, null, 2);
        // fs.writeFileSync("api_responses.json", jsonData);

        const jsonData2 = JSON.stringify(filingsArray, null, 2);
        fs.writeFileSync("api_responses2.json", jsonData2);

        console.log("API responses saved to api_responses2.json");
    } catch (err) {
        console.error("Error during API call or file write:", err);
    }
}

// Run the function
makeApiCallsForTickersAndForms();
