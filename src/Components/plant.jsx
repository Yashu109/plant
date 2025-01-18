import { useState, useEffect } from 'react';
import './Plant.css'; // Make sure this CSS file is in the same folder

const API_KEY = "AIzaSyAY1S9UHJc1mz7nM5St9vovlYeQGPQlzVI";
const SPREADSHEET_ID = '1T-s-c1ht11CwjLWv4Lk2uFisDpvrO3OBdGOv5T6haBk';

const WeatherData = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchGoogleSheetData = async () => {
            const RANGE = 'Sheet1!A:I'; // Added one more column for date
            const SHEETS_API_URL = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${RANGE}`;

            const validateNumber = (value) => {
                const num = parseFloat(value);
                return isNaN(num) ? 0 : num;
            };

            try {
                setLoading(true);
                setError(null);

                const url = new URL(SHEETS_API_URL);
                url.searchParams.append('key', API_KEY);

                const response = await fetch(url.toString());
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('API Error:', response.status, errorText);
                    throw new Error(`API request failed: ${response.status}`);
                }

                const result = await response.json();
                if (!result.values || result.values.length === 0) {
                    throw new Error('No data found in spreadsheet');
                }

                const values = result.values.slice(1); // Skip header row
                const today = new Date().toISOString().split('T')[0];

                // Find today's data or the latest available
                let targetRow = values.reverse().find(row => row[0]?.includes(today));
                if (!targetRow) targetRow = values[0];

                setData({
                    date: targetRow[0] || 'N/A',
                    time: targetRow[1] || 'N/A',
                    temp: validateNumber(targetRow[2]),
                });
            } catch (err) {
                setError(err.message);
                setData(null);
            } finally {
                setLoading(false);
            }
        };

        fetchGoogleSheetData();
    }, []);

    const getMessageAndImage = (temp) => {
        switch (temp) {
            case 1:
                return { message: "This is Red", image: '/src/assets/red-colour.jpg', className: 'red' };
            case 2:
                return { message: "This is Green", image: '/src/assets/green.jpg', className: 'green' };
            case 3:
                return { message: "This is Blue", image: '/src/assets/blue.jpg', className: 'blue' };
            default:
                return { message: "No valid data", image: '', className: 'no-data' };
        }
    };

    if (loading) return <p className="loading">Loading...</p>;
    if (error) return <p className="error">Error: {error}</p>;

    const { message, image, className } = getMessageAndImage(data?.temp);

    return (
        <div className="weather-container">
            <div className="weather-card">
                <h3 className="weather-title"> Data</h3>
                {data ? (
                    <>
                        <p className="weather-info"><strong>Value:</strong> {data.temp}</p>
                        <p className={`weather-message ${className}`}>{message}</p>
                        {image && <img className="weather-image" src={image} alt="Color Representation" />}
                    </>
                ) : (
                    <p>No data available</p>
                )}
            </div>
        </div>
    );
};

export default WeatherData;
