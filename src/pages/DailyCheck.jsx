import React, { useState } from 'react';
import { useStorage } from '../context/StorageContext';
import SleepSlider from '../components/SleepSlider';
import MealSelector from '../components/MealSelector';
import MoodSelector from '../components/MoodSelector';
import SymptomSelector from '../components/SymptomSelector';
import ConditionInput from '../components/ConditionInput';

const DailyCheck = ({ onBack }) => {
    const { saveDailyLog } = useStorage();

    // STEP 1: Core
    const [sleep, setSleep] = useState(6);
    const [sleepQuality, setSleepQuality] = useState(3); // 1-5
    const [meal, setMeal] = useState(2);
    const [appetite, setAppetite] = useState(3); // 1-5
    const [mood, setMood] = useState('soso');
    const [energy, setEnergy] = useState(3); // 1-5
    const [anxiety, setAnxiety] = useState(2); // 1-5

    // STEP 2: Optional
    const [showOptional, setShowOptional] = useState(false);
    const [symptoms, setSymptoms] = useState([]);
    const [note, setNote] = useState('');
    const [finished, setFinished] = useState(false);

    const handleSubmit = () => {
        const data = {
            // Core
            sleepHours: sleep,
            sleepQuality,
            mealCount: meal,
            appetite,
            mood,
            energy,
            anxiety,
            // Optional
            physicalSymptoms: symptoms,
            note: note,
            checkInComplete: true
        };
        saveDailyLog(data);
        setFinished(true);
        setTimeout(onBack, 2500);
    };

    if (finished) {
        return (
            <div className="page-container fade-in" style={{ padding: '40px', textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ fontSize: '4rem', marginBottom: '20px' }}>✨</div>
                <h2 style={{ marginBottom: '16px' }}>Log Saved.</h2>
                <p style={{ fontSize: '1.1rem', color: '#64748b' }}>
                    "Small consistency beats intensity."<br />See you tomorrow!
                </p>
            </div>
        )
    }

    return (
        <div className="page-container fade-in" style={{ padding: '24px', paddingBottom: '120px' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
                <button onClick={onBack} style={{ fontSize: '1.5rem', background: 'transparent', border: 'none', marginRight: '16px', cursor: 'pointer' }}>←</button>
                <h1 style={{ fontSize: '1.5rem', margin: 0 }}>Daily Check-in</h1>
            </div>

            {/* CORE SECTION */}
            <div className="fade-in">
                <h3 style={{ fontSize: '1.2rem', color: '#334155', marginBottom: '10px' }}>1. Sleep & Eat</h3>
                <SleepSlider value={sleep} onChange={setSleep} />
                {/* Micro Input for Quality? For MVP keep it simple or add slider inside SleepSlider later. Let's just assume SleepSlider handles hours for now. */}

                <h3 style={{ fontSize: '1.2rem', color: '#334155', marginBottom: '10px', marginTop: '30px' }}>2. Body & Mind</h3>
                <MealSelector value={meal} onChange={setMeal} />
                <MoodSelector value={mood} onChange={setMood} />
                <ConditionInput
                    energy={energy} setEnergy={setEnergy}
                    anxiety={anxiety} setAnxiety={setAnxiety}
                />
            </div>

            {/* OPTIONAL TOGGLE */}
            {!showOptional ? (
                <button
                    onClick={() => setShowOptional(true)}
                    style={{
                        width: '100%', padding: '15px', marginTop: '30px',
                        background: 'transparent', border: '2px dashed #cbd5e1',
                        borderRadius: '16px', color: '#64748b', fontWeight: 'bold', cursor: 'pointer'
                    }}
                >
                    + Add Symptoms or Note (Optional)
                </button>
            ) : (
                <div className="fade-in" style={{ marginTop: '30px', borderTop: '2px dashed #e2e8f0', paddingTop: '20px' }}>
                    <h3 style={{ fontSize: '1.2rem', color: '#334155', marginBottom: '10px' }}>3. Details</h3>
                    <SymptomSelector selected={symptoms} onChange={setSymptoms} />

                    <div style={{ background: 'white', padding: '20px', borderRadius: '16px', marginTop: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                        <label style={{ fontWeight: '600', fontSize: '1rem', display: 'block', marginBottom: '12px', color: '#334155' }}>One Line Note</label>
                        <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Significant event or trigger today..."
                            style={{
                                width: '100%', height: '80px', padding: '12px',
                                borderRadius: '12px', border: '1px solid #cbd5e1',
                                fontFamily: 'inherit', resize: 'none'
                            }}
                        />
                    </div>
                </div>
            )}

            {/* SUBMIT */}
            <div style={{ position: 'fixed', bottom: '24px', left: '24px', right: '24px', zIndex: 100 }}>
                <button
                    onClick={handleSubmit}
                    style={{
                        width: '100%',
                        background: 'var(--color-primary)',
                        color: 'white',
                        padding: '16px',
                        borderRadius: '50px',
                        fontSize: '1.2rem',
                        fontWeight: 'bold',
                        boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.5)',
                        border: 'none', cursor: 'pointer',
                        transition: 'transform 0.1s'
                    }}
                >
                    {showOptional ? 'Save Complete Log' : 'Save Core Log'}
                </button>
            </div>
        </div>
    );
};

export default DailyCheck;
