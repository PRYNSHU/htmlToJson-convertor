const fs = require("fs"); // Import the 'fs' module for file system operations
const axios = require('axios');   // Axios for API calls

// SEC API Token
const SEC_API_KEY = '621ce92abc247e6ab99099df7c7ae8e7dbedcb05212da8fee4ad628d8b9ab361'

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
async function apiCallForLinks() {
    try {
        // Fetch tickers from the database
        // const tickers = await fetchTickers();

        const tickers = ['TSLA','IBM', 'AAPL']

        // Define the form types to loop over

        // Array to hold all filings
        const filingsArray = [];

        // Object to store all the results
        // Loop through each ticker
        for (const ticker of tickers) {

            // Loop through each form type
                const requestBody = {
                    query: `ticker:${ticker} AND formType:\"10-K\"`, // Dynamically set ticker and form type
                    from: "0",
                    size: "5",
                    sort: [{ filedAt: { order: "desc" } }],
                };

                // Make the API call using Axios
                const response = await axios.post(
                    `https://api.sec-api.io?token=${SEC_API_KEY}`,
                    requestBody
                );

                // Extract and structure the relevant filings information
                const filings = response.data.filings.map(filing => ({
                    ticker: filing.ticker,
                    cik: filing.cik,
                    formType: filing.formType,
                    accessionNo: filing.accessionNo,
                    linkToFilingDetails: filing.linkToFilingDetails,
                    periodOfReport: filing.periodOfReport
                }));
        
                // Add the filings to the array
                filingsArray.push(...filings);
        }

        const jsonData2 = JSON.stringify(filingsArray, null, 2);
        fs.writeFileSync("fetchFillingLinks.json", jsonData2);

        console.log("API responses saved to fillingLink.json");
    } catch (err) {
        console.error("Error during API call or file write:", err);
    }
}

apiCallForLinks()