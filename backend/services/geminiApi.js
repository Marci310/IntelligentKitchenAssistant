const {GoogleGenAI} = require("@google/genai");
const fs = require('fs');
require('dotenv').config();
const path = require('path');

const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});
const MODEL_NAME = 'gemini-2.0-flash';

const getAudioPart = (path) => ({
    inlineData: {mimeType: 'audio/mp3', data: fs.readFileSync(path).toString('base64')}
});

exports.saveImageToFile = (base64String) => {
    try {
        const matches = base64String.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);

        if (!matches || matches.length !== 3) {
            throw new Error('Invalid input string');
        }

        const extension = matches[1];
        const data = matches[2];
        const buffer = Buffer.from(data, 'base64');

        const fileName = `recipe-${Date.now()}.${extension}`;

        const uploadDir = path.join(__dirname, '../public/images');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, {recursive: true});
        }

        const filePath = path.join(uploadDir, fileName);
        fs.writeFileSync(filePath, buffer);

        return `/images/${fileName}`;

    } catch (error) {
        console.error("Fájlmentési hiba:", error);
        return null;
    }
};

const PROMPTS = {
    getRecipePrompt: (inventory, instructions) => `
        You are a helpful cooking assistant.
        User's Inventory: ${JSON.stringify(inventory)}
        User Request: "${instructions}"
    
        Job:
        1. Create a recipe based on the user's request.
        2. Identify missing ingredients for a shopping list.
        3. Provide an English image prompt for the dish.
    
        Response JSON format ONLY:
        {
          "title": "String",
          "shortDescription": "String",
          "ingredients": [
            { "name": "ingredient name", "quantity": "amount", "unit": "unit", "category": "category" }
          ],
          "missingIngredients": [
            { "name": "ingredient name", "quantity": "amount", "unit": "unit", "category": "category" }
          ],
          "instructions": ["Step 1", "Step 2"],
          "imagePrompt": "Hand-drawn style image, appetizing close-up centered shot of the dish with an empty background"
        }
        If the instructions come in different language, respond in that language.
        Categories must be one of: [Vegetables, Fruits, Dairies, Meats, Pastries, Spices, Cans, Other]
        Units must be standard: kg, g, l, ml, db, etc.
        If you want to say "to taste" as amount, write "to taste" as unit in the language it was asked and 1 as quantity.
        I you want to say grated cheese, write "grated cheese" as name, not "cheese" with "grated" in description.
`,

    inventorySystem: `
        Te egy készletnyilvántartó asszisztens vagy.
        A feladatod: Hallgasd meg a felhasználót, aki felsorolja, mit vett vagy mi van otthon.
        
        Készíts egy JSON listát a hallottak alapján.
        
        A következő kategóriákba sorold be az elemeket (ha nem tudod, legyen 'Egyéb'):
        [Vegetables, Fruits, Dairies, Meats, Pastries, Spices, Cans, Other]
        Használd a standard mértékegységeket: kg, g, l, ml, db, stb.
        Ha használt dolgokat hallasz (pl. reszelt sajt), írd azt a névhez (pl. "reszelt sajt"), ne a leíráshoz.
        
        Példa bemenet:
        "Vettem egy darab krumplit, két liter tejet és kétszáz gramm reszelt sajtot."
        
        Elvárt JSON válasz formátum (Array):
        [
          { "name": "krumpli", "quantity": "1", "unit": "db", "category": "Vegetables" },
          { "name": "tej", "quantity": "2", "unit": "liter", "category": "Dairies" },
          { "name": "reszelt sajt", "quantity": "200", "unit": "g", "category": "Dairies" }
        ]
            
        Csak tiszta JSON-t adj vissza!
    `
};

exports.generateRecipe = async (input, ingredients, isAudio = false) => {
    try {
        const contents = [
            {role: 'user', parts: [{text: PROMPTS.getRecipePrompt(ingredients, isAudio ? "See audio input" : input)}]}
        ];
        if (isAudio) {
            contents.push({role: 'user', parts: [getAudioPart(input)]});
        }

        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: contents,
            config: {responseMimeType: 'application/json'}
        });

        const text = response.candidates[0].content.parts[0].text;
        console.log(JSON.parse(text));
        return JSON.parse(text);
    } catch (error) {
        console.error("Gemini Recipe Error:", error);
        throw error;
    }
};

exports.generateImage = async (prompt) => {
    try {
        const response = await ai.models.generateContent({
            model: "imagen-3.0-generate-001",
            contents: {role: 'user', parts: [{text: `Create a picture: ${prompt}`}]},
            config: {responseModalities: "Image"}
        });
        console.log("Full response:", JSON.stringify(response, null, 2));
        console.log("Candidates:", response.candidates);
        console.log("Parts:", response.candidates?.[0]?.content?.parts);

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                return `data:image/png;base64,${part.inlineData.data}`;
            }
        }
        return null;
    } catch (error) {
        console.error("Gemini Image Gen Error:", error);
        return null;
    }
};

exports.parseIngredientsFromAudio = async (audioPath) => {
    try {
        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: [
                {role: 'user', parts: [{text: PROMPTS.inventorySystem}]},
                {role: 'user', parts: [getAudioPart(audioPath)]}
            ],
            config: {responseMimeType: 'application/json'}
        });

        const text = response.candidates[0].content.parts[0].text;
        return JSON.parse(text);

    } catch (error) {
        console.error("Inventory Audio Error:", error);
        throw error;
    }
};