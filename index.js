//1. import required libraries
const { apikeys } =require("googleapis/build/src/apis/apikeys")
const { google } =require("googleapis")
const { GoogleGenerativeAI } =require("@google/generative-ai")
const ObjectsToCsv = require('objects-to-csv')
const dotenv = require('dotenv')
dotenv.config();

// Access your API key as an environment variable (see "Set up your API key" above)
console.log(process.env.GEMINI)
const genAI = new GoogleGenerativeAI(process.env.GEMINI);

// The Gemini 1.5 models are versatile and work with both text-only and multimodal prompts
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});


 const auth = new google.auth.GoogleAuth({
    keyFile: './google.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
}); 


async function readSheet() {
    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = '1xsZOuEK9lkf9MBnb2pOfdCnU06I9Wm9Xl7rB3NCvl9A';
    const range = 'FMSB2019!A1:I101'


    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId, range
        })
        const rows = response.data;
        return rows
    } catch (error) {
        console.error('error', error)
    }
}
    (async () => {
        const googleSheetArray = await readSheet();
        const data = googleSheetArray.values;
    
        // Retrieve the header
        const headerArray = data.shift();
    
        // Remove items in the array starting from the end
        data.splice(-90);
    
        // Initialize an empty array to hold the responses
        let responses = [];

        // Initialize an empty array to hold the responses reason
        let responsesReason = [];
    
        for (const element of data) {
            // For each sub-array in the data array, get the question
            const question = element[1];
            // Get the options
            const optionA = element[2];
            const optionB = element[3];
            const optionC = element[4];
            const optionD = element[5];
            const optionE = element[6];
    
            // Ask the prompt
            const prompt = `Tu composes un test de qcm, la question qui est: ${question}
                et les options sont A:${optionA}, B: ${optionB}, C: ${optionC}, D: ${optionD} et E: ${optionE}
                 Choisis juste la lettre qui correspond à la bonne réponse, sans expliquer, ni rappeler quelle est l'option`;
    
            // Generate content with Gemini AI
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
    
            // Add the response text to the responses array
            responses.push({reponse:text });

            //Add response reason to response eason array
           // responsesReason.push({responsereson:})
    
            console.log(text, question);
        }
    
        // Convert the responses array to a JSON object
        const responsesJson = JSON.stringify(responses);
    
        // Output the JSON object
        console.log(responsesJson);
    })();
    