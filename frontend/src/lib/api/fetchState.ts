import { API_URL } from '../config';

export async function fetchState() {
  console.log("fetching state");
  const response = await fetch(`${API_URL}property/state/`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      'Content-Type': 'application/json' // Set Content-Type header
    }
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to fetch location');
  }

  return await response.json();
}
