import React, { useState } from 'react';
import { useStorage } from '../context/StorageContext';
import SleepSlider from '../components/SleepSlider';
import MealSelector from '../components/MealSelector';
import MoodSelector from '../components/MoodSelector';

const DailyCheck = ({ onBack }) => {
    const { saveDailyLog } = useStorage();

    const [sleep, setSleep] = useState(6);
    const [meal, setMeal] = useState(2);
    const [mood, setMood] = useState('soso');
    const [finished, setFinished] = useState(false);

    const handleSubmit = () => {
        saveDailyLog({
            sleepHours: sleep,
            mealCount: meal,
            mood: mood
        });
        setFinished(true);
        // Auto go back after 2 seconds
        setTimeout(onBack, 2500);
    };

    const getFeedbackMessage = () => {
        if (mood === 'worst' || mood === 'bad') return "It's okay to not be okay. You are doing enough.";
        if (sleep < 5) return "Rest is productive too. Try to sleep a bit earlier tonight.";
        if (meal < 2) return "Your body needs fuel to heal. How about a small snack?";
        return "You're taking great care of yourself!";
    };

    if (finished) {
        return (
            <div className="page-container fade-in" style={{ padding: '40px', textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ fontSize: '4rem', marginBottom: '20px' }}>✨</div>
                <h2 style={{ marginBottom: '16px' }}>Recorded.</h2>
                <p style={{ fontSize: '1.2rem', lineHeight: '1.5', color: 'var(--color-text-sub)' }}>
                    {getFeedbackMessage()}
                </p>
            </div>
        )
    }

    return (
        <div className="page-container fade-in" style={{ padding: '24px', paddingBottom: '100px' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
                <button onClick={onBack} style={{ fontSize: '1.5rem', background: 'transparent', marginRight: '16px' }}>←</button>
                <h1 style={{ fontSize: '1.5rem' }}>Daily Check-in</h1>
            </div>

            <SleepSlider value={sleep} onChange={setSleep} />
            <MealSelector value={meal} onChange={setMeal} />
            <MoodSelector value={mood} onChange={setMood} />

            <div style={{ position: 'fixed', bottom: '24px', left: '24px', right: '24px' }}>
                <button
                    onClick={handleSubmit}
                    style={{
                        width: '100%',
                        background: 'var(--color-primary)',
                        color: 'white',
                        padding: '16px',
                        borderRadius: '50px',
                        fontSize: '1.1rem',
                        fontWeight: '600',
                        boxShadow: 'var(--shadow-float)'
                    }}
                >
                    Save
                </button>
            </div>
        </div>
    );
};

export default DailyCheck;
