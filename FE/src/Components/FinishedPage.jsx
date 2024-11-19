import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const FinishedPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [totalMarks, setTotalMarks] = useState(null);

    useEffect(() => {
        if (location.state && typeof location.state.totalMarks === "number") {
            setTotalMarks(location.state.totalMarks); // Gán điểm hợp lệ
        } else {
            navigate('/user'); // Điều hướng nếu không có `totalMarks`
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