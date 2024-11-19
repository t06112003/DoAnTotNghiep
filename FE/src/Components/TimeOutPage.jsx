import React from 'react';
import { useNavigate } from 'react-router-dom';

const TimeOutPage = () => {
    const navigate = useNavigate();

    return (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <h1>Bài thi đã kết thúc</h1>
            <p>Thời gian làm bài của bạn đã hết. Bạn không thể truy cập vào trang này nữa.</p>
            <button onClick={() => navigate('/user')}>Quay về trang chủ</button>
        </div>
    );
};

export default TimeOutPage;