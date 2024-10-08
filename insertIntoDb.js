const { Client } = require('pg');
const fs = require('fs');

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

async function createTableAndInsertData() {
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

    const createTableQuery =  `
    
    CREATE TABLE IF NOT EXISTS filling_report_10K (
        id SERIAL PRIMARY KEY,
        symbol VARCHAR(20),
        cik VARCHAR(10),
        form_type VARCHAR(10),
        accession_no VARCHAR(30),
        period_of_report DATE,

        item_1 JSONB,
        item_1A JSONB,
        item_1B JSONB,
        item_1C JSONB,
        item_2 JSONB,
        item_3 JSONB,
        item_4 JSONB,
        item_5 JSONB,
        item_6 JSONB,
        item_7 JSONB,
        item_7A JSONB,
        item_8 JSONB,
        item_9 JSONB,
        item_9A JSONB,
        item_9B JSONB,
        item_10 JSONB,
        item_11 JSONB,
        item_12 JSONB,
        item_13 JSONB,
        item_14 JSONB,
        item_15 JSONB
    );
    
    -- Table for 10Q specific items
    CREATE TABLE IF NOT EXISTS filling_report_10Q (
        id SERIAL PRIMARY KEY,
        symbol VARCHAR(20),
        cik VARCHAR(10),
        form_type VARCHAR(10),
        accession_no VARCHAR(30),
        period_of_report DATE,
        
        part1item1 JSONB,
        part1item2 JSONB,
        part1item3 JSONB,
        part1item4 JSONB,
        part2item1 JSONB,
        part2item1a JSONB,
        part2item2 JSONB,
        part2item3 JSONB,
        part2item4 JSONB,
        part2item5 JSONB,
        part2item6 JSONB
    );
    
    -- Table for 8K specific items
    CREATE TABLE IF NOT EXISTS filling_report_8K (
        id SERIAL PRIMARY KEY,
        symbol VARCHAR(20),
        cik VARCHAR(10),
        form_type VARCHAR(10),
        accession_no VARCHAR(30),
        period_of_report DATE,
        
        item_1_1 JSONB,
        item_1_2 JSONB,
        item_1_3 JSONB,
        item_1_4 JSONB,
        item_1_5 JSONB,
        item_2_1 JSONB,
        item_2_2 JSONB,
        item_2_3 JSONB,
        item_2_4 JSONB,
        item_2_5 JSONB,
        item_2_6 JSONB,
        item_3_1 JSONB,
        item_3_2 JSONB,
        item_3_3 JSONB,
        item_4_1 JSONB,
        item_4_2 JSONB,
        item_5_1 JSONB,
        item_5_2 JSONB,
        item_5_3 JSONB,
        item_5_4 JSONB,
        item_5_5 JSONB,
        item_5_6 JSONB,
        item_5_7 JSONB,
        item_5_8 JSONB,
        item_6_1 JSONB,
        item_6_2 JSONB,
        item_6_3 JSONB,
        item_6_4 JSONB,
        item_6_5 JSONB,
        item_6_6 JSONB,
        item_6_10 JSONB,
        item_7_1 JSONB,
        item_8_1 JSONB,
        item_9_1 JSONB
    );`;
        
    await client.query(createTableQuery);
    console.log("Table created successfully.");

    // // Read data from JSON file
    // const data = JSON.parse(fs.readFileSync('itemfilling10k_final.json', 'utf8'));

    // await client.query('BEGIN'); // Start a transaction

    // // Insert each row from the data array
    // for (const report of data) {
    //   const insertQuery = `
    //     INSERT INTO filling_report_10K (
    //       symbol, cik, form_type, accession_no, period_of_report,
    //       item_1, item_1A, item_1B, item_1C, item_2, item_3, item_4, item_5,
    //       item_6, item_7, item_7A, item_8, item_9, item_9A, item_9B,
    //       item_10, item_11, item_12, item_13, item_14, item_15
    //     ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 
    //       $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26)
    //   `;

    //   const values = [
    //     report.ticker,
    //     report.cik,
    //     report.formType,
    //     report.accessionNo,
    //     report.periodOfReport,
    //     report.jsonContent.item_1,
    //     report.jsonContent.item_1A,
    //     report.jsonContent.item_1B,
    //     report.jsonContent.item_1C,
    //     report.jsonContent.item_2,
    //     report.jsonContent.item_3,
    //     report.jsonContent.item_4,
    //     report.jsonContent.item_5,
    //     report.jsonContent.item_6,
    //     report.jsonContent.item_7,
    //     report.jsonContent.item_7A,
    //     report.jsonContent.item_8,
    //     report.jsonContent.item_9,
    //     report.jsonContent.item_9A,
    //     report.jsonContent.item_9B,
    //     report.jsonContent.item_10,
    //     report.jsonContent.item_11,
    //     report.jsonContent.item_12,
    //     report.jsonContent.item_13,
    //     report.jsonContent.item_14,
    //     report.jsonContent.item_15,
    //   ];

    //   await client.query(insertQuery, values);
    // }

// FOR 10 Q


    // // Read data from JSON file
    // const data = JSON.parse(fs.readFileSync('itemfilling10q_final.json', 'utf8'));

    // await client.query('BEGIN'); // Start a transaction

    // // Insert each row from the data array
    // for (const report of data) {
    //   const insertQuery = `
    //   INSERT INTO filling_report_10Q (
    //     symbol, cik, form_type, accession_no, period_of_report, 
    //     part1item1, part1item2, part1item3, part1item4,
    //     part2item1, part2item1a, part2item2, part2item3, part2item4, part2item5, part2item6
    // ) VALUES
    //  ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 
    //   $14, $15, $16);
    //   `;

    //   const values = [
    //     report.ticker,
    //     report.cik,
    //     report.formType,
    //     report.accessionNo,
    //     report.periodOfReport,
    //     report.jsonContent.part1item1,
    //     report.jsonContent.part1item2,
    //     report.jsonContent.part1item3,
    //     report.jsonContent.part1item4,
    //     report.jsonContent.part2item1,
    //     report.jsonContent.part2item1a,
    //     report.jsonContent.part2item2,
    //     report.jsonContent.part2item3,
    //     report.jsonContent.part2item4,
    //     report.jsonContent.part2item5,
    //     report.jsonContent.part2item6
    //   ];

    //   await client.query(insertQuery, values);
    // }

// 8 K

      // Read data from JSON file
    const data = JSON.parse(fs.readFileSync('itemfilling8k_final.json', 'utf8'));

    await client.query('BEGIN'); // Start a transaction

    // Insert each row from the data array
    for (const report of data) {
      const insertQuery = `
        INSERT INTO filling_report_8K (
          symbol, cik, form_type, accession_no, period_of_report, 
          item_1_1, item_1_2, item_1_3, item_1_4, item_1_5, 
          item_2_1, item_2_2, item_2_3, item_2_4, item_2_5, item_2_6,
          item_3_1, item_3_2, item_3_3, item_4_1, item_4_2,
          item_5_1, item_5_2, item_5_3, item_5_4, item_5_5, item_5_6, item_5_7, item_5_8,
          item_6_1, item_6_2, item_6_3, item_6_4, item_6_5, item_6_6, item_6_10,
          item_7_1, item_8_1, item_9_1
        ) VALUES (
          $1, $2, $3, $4, $5,
          $6, $7, $8, $9, $10,
          $11, $12, $13, $14, $15, $16,
          $17, $18, $19, $20, $21,
          $22, $23, $24, $25, $26, $27, $28, $29,
          $30, $31, $32, $33, $34, $35, $36,
          $37, $38, $39
        )
      `;

      // Values array for each report
      const values = [
        report.ticker, report.cik, report.formType, report.accessionNo, report.periodOfReport,
        report.jsonContent.item_1_1, report.jsonContent.item_1_2, report.jsonContent.item_1_3, report.jsonContent.item_1_4, report.jsonContent.item_1_5,
        report.jsonContent.item_2_1, report.jsonContent.item_2_2, report.jsonContent.item_2_3, report.jsonContent.item_2_4, report.jsonContent.item_2_5, report.jsonContent.item_2_6,
        report.jsonContent.item_3_1, report.jsonContent.item_3_2, report.jsonContent.item_3_3, report.jsonContent.item_4_1, report.jsonContent.item_4_2,
        report.jsonContent.item_5_1, report.jsonContent.item_5_2, report.jsonContent.item_5_3, report.jsonContent.item_5_4, report.jsonContent.item_5_5, report.jsonContent.item_5_6, report.jsonContent.item_5_7, report.jsonContent.item_5_8,
        report.jsonContent.item_6_1, report.jsonContent.item_6_2, report.jsonContent.item_6_3, report.jsonContent.item_6_4, report.jsonContent.item_6_5, report.jsonContent.item_6_6, report.jsonContent.item_6_1,
        report.jsonContent.item_7_1, report.jsonContent.item_8_1, report.jsonContent.item_9_1
      ];

      await client.query(insertQuery, values);
    }

    await client.query('COMMIT'); // Commit the transaction
    console.log('Data inserted successfully!');

  } catch (err) {
    console.error("Error executing query", err);
  } finally {
    await client.end();
  }
}

async function fetchData() {
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

    const query = `
    SELECT *
    FROM filling_report_10K
    WHERE symbol = $1
    AND period_of_report = $2;
    `;
  
      const values = ["TSLA", new Date("2023-12-31")];
  
      const result = await client.query(query, values);
      fs.writeFileSync("fetchdata.json", result, null, 2);
    //   return result.rows; 
}

createTableAndInsertData();

// fetchData();