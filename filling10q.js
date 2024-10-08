const formTypeItemCodes = require('./contanst')
const fs = require("fs"); // Import the 'fs' module for file system operations
const axios = require('axios');   // Axios for API calls
const { JSDOM } = require('jsdom');

const SEC_API_KEY = '621ce92abc247e6ab99099df7c7ae8e7dbedcb05212da8fee4ad628d8b9ab361'

async function getItemFor10q() {
    const data = JSON.parse(fs.readFileSync('fetchFillingLinks.json', 'utf8')); // Read data from the file

    let finalContent = [];
    for (const link of data) {
        
        // Fetch the item content for the current filing link
        const itemsContent = await getJsonResponseForItemCodes(
            link.linkToFilingDetails, 
            "QUARTERLY"
        );
        
        // Create the object with the required structure
        const filingData = {
            ticker: link.ticker,              // Assuming `link` contains the ticker
            cik: link.cik,                    // Assuming `link` contains the CIK
            formType: link.formType,          // Assuming `link` contains the formType
            accessionNo: link.accessionNo,    // Assuming `link` contains the accession number
            periodOfReport: link.periodOfReport,
            jsonContent: itemsContent.reduce((acc, item) => {
                acc[`${item.itemname}`] = item.content; // Add item content dynamically
                return acc;
            }, {})
        };
        console.log('one filling done', link.ticker)
        // Push the formatted data into finalContent array
        finalContent.push(filingData);
    }

    // Write the final content to a file
    fs.writeFileSync("itemfilling10q_final.json", JSON.stringify(finalContent, null, 2));
    // console.log(finalContent)
    return finalContent;
}

async function getJsonResponseForItemCodes(
    fillinglink,
    formType,
  ) {

    const ItemCodes = formTypeItemCodes[formType];
    const finalResult= [];
  
    // Iterate over each item code and make API calls
    for (const item of ItemCodes) {
      try {
        const API_URL = `https://api.sec-api.io/extractor?` + 
        `url=${fillinglink}&item=${item}&type=html&`+
        `token=${SEC_API_KEY}`;
        
        const htmlString = await axios.get(API_URL);
        const jsonResult = htmlToJson(htmlString.data);
        finalResult.push({
            itemname : item,
            content : jsonResult
        })
                      
      } catch (error) {
        if (error instanceof Error) {
          throw new Error(`Error fetching ${item}: ${error.message}`);
        }
      }
    }
    return finalResult;
}


function htmlToJson(html) {
    const dom = new JSDOM(html);
    const doc = dom.window.document;

    const json = { topic: '', content: [] };
    let currentSubtopic = null;
    let currentItalicSubtopic = null;
    let emptySubtopic = null; // Track empty subtopics
    let topicFound = false; 

    function extractTopic(text) {
        const dotIndex = text.indexOf('.');
        if (dotIndex !== -1) {
            return text.substring(dotIndex + 1).trim(); // Get the content after the period
        }
        return text.trim();
    }

    // Helper to extract table data
    function extractTable(tableElement) {
        const table = {
            type: "table",
            content: []
        };

        const rows = tableElement.querySelectorAll('tr');

        rows.forEach(row => {
            const rowData = [];
            const cells = row.querySelectorAll('td, th'); // Get both td and th (headers)

            cells.forEach(cell => {
                const cellText = cell.textContent.trim();
                if (cellText) { // Only add non-empty cells
                    rowData.push({
                        type: "cell",
                        text: cellText
                    });
                }
            });

            if (rowData.length > 0) {
                table.content.push({
                    type: "row",
                    content: rowData
                });
            }
        });

        return table;
    }

    function traverse(node) {
        if (node.nodeType === node.TEXT_NODE && node.textContent.trim()) {
            return {
                type: "paragraph",
                text: node.textContent.trim()
            };
        }

        if (node.nodeType === node.ELEMENT_NODE) {
            const tagName = node.tagName.toLowerCase();
            const fontWeight = node.style.fontWeight || '400'; // Default to 400 if not found
            const fontStyle = node.style.fontStyle || 'normal'; // Default to normal if not italic

            if (tagName === 'span') {
                const contentText = node.textContent.trim();

                // Check if it's bold (font-weight: 700) and NOT italic
                if (fontWeight === '700' && fontStyle === 'normal') {
                    const subtopicText = extractTopic(contentText);

                    if (subtopicText) { // If there's subtopic text

                        if (!topicFound ) {
                            json.topic = subtopicText; // Set the "topic" value
                            topicFound = true; // Set flag so this is only done for the first occurrence
                        }

                        const subtopic = {
                            type: "subtopic",
                            subtopic: subtopicText,
                            content: []
                        };
                        

                        if (emptySubtopic) {
                            // If there's an empty subtopic, nest this subtopic under it
                            emptySubtopic.content.push(subtopic);
                            emptySubtopic = null; // Clear the empty subtopic tracker
                        } else {
                            json.content.push(subtopic);
                        }

                        currentSubtopic = subtopic;
                        currentItalicSubtopic = null; // Reset the italic subtopic
                    } else {
                        // If the subtopic is empty, mark it as a potential parent for the next subtopic
                        const emptySubtopicObject = {
                            type: "subtopic",
                            subtopic: '', // Empty subtopic title
                            content: []
                        };
                        json.content.push(emptySubtopicObject);
                        emptySubtopic = emptySubtopicObject;
                        currentSubtopic = emptySubtopic;
                    }

                } else if (fontWeight === '700' && fontStyle === 'italic') {
                    // If it's bold and italic, nest it inside the current subtopic
                    const italicSubtopicText = extractTopic(contentText);

                    if (italicSubtopicText) { // Only add non-empty italic subtopics
                        const italicSubtopic = {
                            type: "italic-subtopic",
                            subtopic: italicSubtopicText,
                            content: []
                        };

                        if (currentSubtopic) {
                            currentSubtopic.content.push(italicSubtopic);
                            currentItalicSubtopic = italicSubtopic;
                        }
                    }
                } else if (fontWeight === '400') {
                    // Regular paragraph text
                    const paragraph = {
                        type: "paragraph",
                        text: contentText
                    };

                    // Check where to place this paragraph based on the current context
                    if (currentItalicSubtopic) {
                        currentItalicSubtopic.content.push(paragraph);
                    } else if (currentSubtopic) {
                        currentSubtopic.content.push(paragraph);
                    } else {
                        json.content.push(paragraph);
                    }
                }
            } else if (tagName === 'table') {
                // Handle table element
                const tableContent = extractTable(node);

                if (tableContent.content.length > 0) { // Only add non-empty tables
                    if (currentItalicSubtopic) {
                        currentItalicSubtopic.content.push(tableContent);
                    } else if (currentSubtopic) {
                        currentSubtopic.content.push(tableContent);
                    } else {
                        json.content.push(tableContent);
                    }
                }
            }

            Array.from(node.childNodes).forEach(traverse);
        }
    }

    Array.from(doc.body.childNodes).forEach(node => traverse(node));

    return json;
}

getItemFor10q();
