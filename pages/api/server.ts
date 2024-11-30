import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios';
import dotenv from 'dotenv';
import data from '@/data/grocery.json' assert { type: 'json' };

dotenv.config();

const apiKey = process.env.OPENAI_API_KEY;
//const prompt = "what is the capital of usa?"; // Replace with the actual prompt or get it from the request body

const grocery = data.grocery
const body = data.body

const generateRecipe = (grocery: any, body: any) => {
    const fruits = grocery.fruits || {};
    const vegetables = grocery.vegitables || {};

    // Helper function to create a list of ingredients based on quantity
    const formatIngredients = (ingredients: Record<string, number>) => {
        return Object.entries(ingredients)
            .map(([ingredient, quantity]) => `${quantity} x ${ingredient}`)
            .join(", ");
    };

    return `
    Based on the following grocery list and body attributes, suggest some meal options:

    Grocery List:
    Fruits: ${formatIngredients(fruits)}
    Vegetables: ${formatIngredients(vegetables)}
    Eggs: ${grocery.eggs ? grocery.eggs : 0}

    Body Attributes:
    Weight: ${body.weight} kg
    Height: ${body.height} m
    Allergies: ${body.alergies.join(', ')}

    Please suggest meal options based on the available ingredients, ensuring they are balanced, healthy, and take into account any allergies.
    `;
}
type ResponseData = {
    success?: boolean;
    error?: string;
    chatRes?: any;
    error_mess?: any;
    groceryList?: any;
};

const retryRequest = async (url: string, data: any, headers: any, retries = 3, delay = 1000) => {
    try {
        const response = await axios.post(url, data, { headers });
        return response.data;
    } catch (error: any) {
        if (error.response && error.response.status === 429 && retries > 0) {
            console.log(`Rate limit hit. Retrying in ${delay / 1000} seconds...`);
            await new Promise(resolve => setTimeout(resolve, delay)); // wait before retry
            return retryRequest(url, data, headers, retries - 1, delay * 2); // retry with increased delay
        }
        throw error;
    }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
    if (req.method === "POST") {
        // Check if the API key is available
        if (!apiKey) {
            return res.status(500).json({ error: "API key is missing from environment variables" });
        }

        const url = "https://api.openai.com/v1/chat/completions";
        const headers = {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
        };
        const data = {
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: "You are a helpful assistant." },
                { role: "user", content: generateRecipe(grocery, body) },
            ],
        };

        try {
            const response = await retryRequest(url, data, headers);
            const result = response.choices[0].message.content;

            res.status(200).json({ success: true, chatRes: result, groceryList: generateRecipe(grocery, body) });
        } catch (error: any) {
            const errorMessage = error.response?.data?.error?.message || "Something went wrong";
            res.status(500).json({ error: errorMessage, error_mess: error });
        }
    } else {
        res.status(405).json({ error: "Method not allowed" });
    }
}
