import { useState, useMemo } from "react";

export type ParticleSettings = {
    cursorRadius: number;
    setCursorRadius: React.Dispatch<React.SetStateAction<number>>;
    particleRadius: number;
    setParticleRadius: React.Dispatch<React.SetStateAction<number>>;
    particleColor: string;
    setParticleColor: React.Dispatch<React.SetStateAction<string>>;
    particleAmount: number;
    setParticleAmount: React.Dispatch<React.SetStateAction<number>>;
    friction: number;
    setFriction: React.Dispatch<React.SetStateAction<number>>;
    stiffness: number;
    setStiffness: React.Dispatch<React.SetStateAction<number>>;
    velocityIndicator: boolean;
    setVelocityIndicator: React.Dispatch<React.SetStateAction<boolean>>;
    minStep: number;
    setMinStep: React.Dispatch<React.SetStateAction<number>>;
    F_error: number;
    setFError: React.Dispatch<React.SetStateAction<number>>;
};

export default function useParticleCanvasContext(
    initCursorRadius: number,
    initParticleRadius: number,
    initParticleColor: string,
    initParticleAmount: number,
    initFriction: number,
    initStiffness: number,
    initVelocityIndicator: boolean,
    initMinStep: number,
    initFError: number

    ): ParticleSettings {
    
    const [cursorRadius, setCursorRadius] = useState<number>(initCursorRadius);
    const [particleRadius, setParticleRadius] = useState<number>(initParticleRadius);
    const [particleColor, setParticleColor] = useState<string>(initParticleColor);
    const [particleAmount, setParticleAmount] = useState<number>(initParticleAmount);
    const [friction, setFriction] = useState<number>(initFriction);
    const [stiffness, setStiffness] = useState<number>(initStiffness);
    const [velocityIndicator, setVelocityIndicator] = useState<boolean>(initVelocityIndicator);
    const [minStep, setMinStep] = useState<number>(initMinStep);
    const [F_error, setFError] = useState<number>(initFError);

    return useMemo(() => ({
        cursorRadius,
        setCursorRadius,
        particleRadius,
        setParticleRadius,
        particleColor,
        setParticleColor,
        particleAmount,
        setParticleAmount,
        friction,
        setFriction,
        stiffness,
        setStiffness,
        velocityIndicator,
        setVelocityIndicator,
        minStep,
        setMinStep,
        F_error,
        setFError
        }), [
        cursorRadius,
        particleRadius,
        particleColor,
        particleAmount,
        friction,
        stiffness,
        velocityIndicator,
        minStep,
        F_error
    ]);
}