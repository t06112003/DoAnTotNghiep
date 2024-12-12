import React from 'react';
import { useNavigate } from 'react-router-dom';

import '../styles/TimeOutPage.css';

const TimeOutPage = () => {
    const navigate = useNavigate();

    return (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <h1>Bài thi đã kết thúc</h1>
            <p>Bạn không thể truy cập vào trang này nữa.</p>
            <button className='back' onClick={() => navigate('/user')}>Quay về trang chủ</button>
        </div>
    );
};

export default TimeOutPage;