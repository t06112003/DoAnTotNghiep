import React, { useState, useEffect } from 'react';
import '../../styles/Timer.css'

const Timer = React.memo(({ initialTime, onTimeUp }) => {
    const [remainingTime, setRemainingTime] = useState(initialTime);

    useEffect(() => {
        const startTime = new Date();

        const timerInterval = setInterval(() => {
            const elapsedTime = Math.floor((new Date() - startTime) / 1000);
            const newRemainingTime = initialTime - elapsedTime;

            setRemainingTime(newRemainingTime > 0 ? newRemainingTime : 0);

            if (newRemainingTime <= 0) {
                clearInterval(timerInterval);
                if (onTimeUp) {
                    onTimeUp();
                }
            }
        }, 1000);

        return () => clearInterval(timerInterval);
    }, [initialTime]);

    const formatTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    return (
        <div className="countdown-timer">
            <strong>Thời gian còn lại:</strong> {formatTime(remainingTime)}
        </div>
    );
});

export default Timer;
