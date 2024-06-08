"use client";
import React from 'react';

interface ButtonProps {
    onClick: () => void;
    label: string;
}

const TestButton: React.FC<ButtonProps> = () => {
    return (
        <button onClick={() => console.log("test")}>fdsfsdf</button>
    );
};

export default TestButton;