import React, {ChangeEvent, useState} from 'react';

import './App.css';

import rockImage from './assets/rock.png';
import paperImage from './assets/paper.png';
import scissorsImage from './assets/scissors.png';

enum Gesture {
    Rock = 0,
    Paper = 1,
    Scissors = 2
}

enum Result {
    Win = 'win',
    Lose = 'lose',
    Draw = 'draw',
}

interface Option {
    value: Gesture;
    imageSrc: string;
    label: string;
}

const options: Option[] = [
    {
        label: 'Stein',
        value: Gesture.Rock,
        imageSrc: rockImage,
    },
    {
        label: 'Papier',
        value: Gesture.Paper,
        imageSrc: paperImage,
    },
    {
        label: 'Schere',
        value: Gesture.Scissors,
        imageSrc: scissorsImage,
    },
]

const sleep = (ms: number) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const App = () => {
    const [name, setName] = useState('');
    const [selectedGesture, setSelectedGesture] = useState<Gesture | null>(null);
    const [randomGesture, setRandomGesture] = useState<Gesture | null>(null);
    const [picketGesture, setPicketGesture] = useState<Gesture | null>(null);
    const [result, setResult] = useState<Result | null>(null);

    const urlSearchParams = new window.URLSearchParams(window.location.search);
    const apiKey = urlSearchParams.get('api_token');

    const onChangeName = (event: ChangeEvent<HTMLInputElement>)=> {
        setName(event.target.value);
    }

    const onClickOptionButton = (gesture: Gesture | null) => {
        reset();
        setSelectedGesture(gesture);
    }

    const reset = () => {
        setRandomGesture(null);
        setPicketGesture(null);
        setResult(null);
    }

    const start = async () => {
        reset();
        if (selectedGesture === null) {
            alert('Bitte auswählen');
            return;
        }

        try {
            const response = await fetch('https://api.random.org/json-rpc/2/invoke', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id: 1,
                    jsonrpc: "2.0",
                    method: "generateIntegers",
                    params: {
                        apiKey,
                        n: 1,
                        min: 0,
                        max: 2,
                        replacement: true,
                        base: 10
                    }
                })
            });
            const body = await response.json();

            for (let i = 0; i < 20; i++) {
                const fake = options[Math.floor(Math.random() * options.length)];
                setRandomGesture(fake.value);
                await sleep(200);
            }
            setRandomGesture(null);
            const picked = body.result.random.data[0] as Gesture;
            const result = getResult(selectedGesture, picked);
            setPicketGesture(picked);
            setResult(result);
        } catch (e) {
            console.error(e);
            alert('FEHLER');
        }
    }

    if (apiKey === null) {
        return (
            <div>
                Das hast du wohl den <code>api_token</code> Parameter vergessen.
            </div>
        );
    }

    return (
        <div className={['wrapper', result ?? ''].join(' ')}>
            <input type="text" value={name} onChange={onChangeName} className="you-name" placeholder="name" />
            <div className="grid">
                <div className="you">
                    <div className="options">
                        {selectedGesture !== null ? (
                            <button type="button" onClick={() => onClickOptionButton(null)} className="option">
                                <img src={options[selectedGesture].imageSrc} alt={options[selectedGesture].label} />
                                <div className="option-label">{options[selectedGesture].label}</div>
                            </button>
                        ) : options.map(option => (
                            <button key={option.label} type="button" onClick={() => onClickOptionButton(option.value)} className="option">
                                <img src={option.imageSrc} alt={option.label} />
                                <div className="option-label">{option.label}</div>
                            </button>
                        ))}
                    </div>
                </div>
                <div className="action">
                    <button className="play-button" onClick={start} disabled={selectedGesture === null}>
                        ↪
                    </button>
                </div>
                <div className="result">
                    {picketGesture !== null &&
                        <div>
                            <img src={options[picketGesture].imageSrc} alt={options[picketGesture].label} />
                            <div className="option-label">{options[picketGesture].label}</div>
                        </div>
                    }
                    {randomGesture !== null &&
                        <div>
                            <img src={options[randomGesture].imageSrc} alt={options[randomGesture].label} />
                            <div className="option-label">{options[randomGesture].label}</div>
                        </div>
                    }
                </div>
            </div>
            <div className="result-label">
                {result !== null && (
                    <>{result}</>
                )}
            </div>
            <footer>
                Powered by <a rel="noreferrer noopener" target="_blank" href="https://random.org">random.org</a>.
                {' '}
                Source Code <a rel="noreferrer noopener" target="_blank" href="https://github.com/KayDomrose/rock-paper-scissors">https://github.com/KayDomrose/rock-paper-scissors</a>
            </footer>
        </div>
    );
}

export default App;

const getResult = (you: Gesture, opponent: Gesture): Result => {
    if (you === opponent){
        return Result.Draw;
    }

    if (you === Gesture.Rock){
        return opponent === Gesture.Paper ? Result.Lose : Result.Win;
    }

    if (you === Gesture.Paper){
        return opponent === Gesture.Scissors ? Result.Lose : Result.Win;
    }

    if (you ===Gesture.Scissors){
        return opponent === Gesture.Rock ? Result.Lose : Result.Win;
    }

    throw new Error('Ups...');
}
