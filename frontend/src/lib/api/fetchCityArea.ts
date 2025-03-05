import { API_URL } from '../config';

export async function fetchCityArea(city: string) {
  try {
    const response = await fetch(`${API_URL}property/areas/${city}/`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch areas for ${city}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching city areas:", error);
    throw error;
  }
}
