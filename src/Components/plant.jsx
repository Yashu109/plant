import { useState, useEffect } from 'react';
import './Plant.css';
import Img from '../assets/red-colour.jpg';
import Img1 from '../assets/green.jpg';
import Img2 from '../assets/blue.jpg';

const API_KEY = "AIzaSyAY1S9UHJc1mz7nM5St9vovlYeQGPQlzVI";
const SPREADSHEET_ID = '1T-s-c1ht11CwjLWv4Lk2uFisDpvrO3OBdGOv5T6haBk';

const WeatherData = () => {
    const [data, setData] = useState(null);
    const [prevData, setPrevData] = useState(null); // Store previous data
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchGoogleSheetData = async () => {
        const RANGE = 'Sheet1!A:I';
        const SHEETS_API_URL = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${RANGE}`;

        try {
            const url = new URL(SHEETS_API_URL);
            url.searchParams.append('key', API_KEY);

            const response = await fetch(url.toString());
            if (!response.ok) throw new Error(`API request failed: ${response.status}`);

            const result = await response.json();
            if (!result.values || result.values.length === 0) throw new Error('No data found in spreadsheet');

            const values = result.values.slice(1); // Skip header row
            const today = new Date().toISOString().split('T')[0];

            // Find today's data or the latest available
            let targetRow = values.reverse().find(row => row[0]?.includes(today));
            if (!targetRow) targetRow = values[0];

            const currentData = {
                date: targetRow[0] || 'N/A',
                time: targetRow[1] || 'N/A',
                temp: parseFloat(targetRow[2]) || 0,
            };

            if (JSON.stringify(currentData) !== JSON.stringify(prevData)) {
                setData(currentData);
                setPrevData(currentData); // Update previous data
            }
        } catch (err) {
            setError(err.message);
        }
    };

    useEffect(() => {
        fetchGoogleSheetData(); // Initial fetch

        const interval = setInterval(() => {
            fetchGoogleSheetData(); // Fetch periodically
        }, 1000); // Check every 10 seconds

        return () => clearInterval(interval); // Cleanup
    }, [prevData]);

    const getMessageAndImage = (temp) => {
        switch (temp) {
            case 1:
                return { message: "This is Red", image: Img, className: 'red' };
            case 2:
                return { message: "This is Green", image: Img1, className: 'green' };
            case 3:
                return { message: "This is Blue", image: Img2, className: 'blue' };
            default:
                return { message: "No valid data", image: '', className: 'no-data' };
        }
    };

    const { message, image, className } = getMessageAndImage(data?.temp);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div className="weather-container">
            <div className="weather-card">
                <h3 className="weather-title">Data</h3>
                {data ? (
                    <>
                        <p><strong>Value:</strong> {data.temp}</p>
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
