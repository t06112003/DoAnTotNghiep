import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const FinishedPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [totalMarks, setTotalMarks] = useState(null);

    useEffect(() => {
        if (!location.state || !location.state.totalMarks) {
            navigate('/user');
        } else {
            setTotalMarks(location.state.totalMarks);
        }
    }, [location.state, navigate]);

    if (totalMarks === null) {
        return <div>Đang tải...</div>;
    }

    return (
        <div style={{ textAlign: 'center', padding: '20px' }}>
            <h1>Bạn đã hoàn thành bài thi!</h1>
            <h2>Điểm của bạn: {totalMarks}</h2>
            <button onClick={() => navigate('/')}>Quay lại trang chính</button>
        </div>
    );
};

export default FinishedPage;
